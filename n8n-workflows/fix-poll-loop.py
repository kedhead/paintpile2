#!/usr/bin/env python3
"""Replace Poll for Result code node with native n8n Wait + HTTP + IF loop."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes, connections FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
row = cur.fetchone()
nodes = json.loads(row[0])
conns = json.loads(row[1])

# Remove the broken Poll for Result code node
nodes = [n for n in nodes if n["name"] != "Poll for Result"]
conns.pop("Poll for Result", None)

# 1. Extract Poll URL (Code node - just extracts URL, no HTTP)
extract_url = {
    "parameters": {
        "jsCode": "const pollUrl = $json.urls.get;\nreturn [{ json: { pollUrl } }];"
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [1400, 300],
    "id": "veo-extract-url-001",
    "name": "Extract Poll URL"
}

# 2. Wait 15 seconds
wait_node = {
    "parameters": {
        "amount": 15,
        "unit": "seconds"
    },
    "type": "n8n-nodes-base.wait",
    "typeVersion": 1.1,
    "position": [1600, 300],
    "id": "veo-wait-001",
    "name": "Wait 15s",
    "webhookId": "veo-wait-webhook-001"
}

# 3. Check Status (HTTP Request to Replicate)
check_status = {
    "parameters": {
        "url": "={{ $('Extract Poll URL').first().json.pollUrl }}",
        "sendHeaders": True,
        "headerParameters": {
            "parameters": [
                {"name": "Authorization", "value": "=Bearer {{ $env.REPLICATE_API_TOKEN }}"}
            ]
        },
        "options": {"timeout": 15000}
    },
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [1800, 300],
    "id": "veo-check-status-001",
    "name": "Check Veo Status"
}

# 4. IF node - check if succeeded
if_done = {
    "parameters": {
        "conditions": {
            "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"},
            "combinator": "and",
            "conditions": [
                {
                    "id": "veo-if-done-cond",
                    "leftValue": "={{ $json.status }}",
                    "rightValue": "succeeded",
                    "operator": {
                        "type": "string",
                        "operation": "equals"
                    }
                }
            ]
        }
    },
    "type": "n8n-nodes-base.if",
    "typeVersion": 2.2,
    "position": [2000, 300],
    "id": "veo-if-done-001",
    "name": "Is Done?"
}

# 5. Extract Video URL (Code node)
extract_video = {
    "parameters": {
        "jsCode": "const videoUrl = $json.output;\nif (!videoUrl) throw new Error('No video URL in response');\nreturn [{ json: { videoUrl } }];"
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [2200, 200],
    "id": "veo-extract-video-001",
    "name": "Extract Video URL"
}

# Add all new nodes
nodes.extend([extract_url, wait_node, check_status, if_done, extract_video])

# Remove old nodes that need repositioning
# Update Download Veo Video position
for n in nodes:
    if n["name"] == "Download Veo Video":
        n["position"] = [2400, 200]
    elif n["name"] == "Bluesky Login":
        n["position"] = [2600, 200]
    elif n["name"] == "Upload Video to Bluesky":
        n["position"] = [2800, 200]
    elif n["name"] == "Build Video Post":
        n["position"] = [3000, 200]
    elif n["name"] == "Post to Bluesky":
        n["position"] = [3200, 200]

# Wire up connections
conns["Start Veo3 Generation"] = {
    "main": [[{"node": "Extract Poll URL", "type": "main", "index": 0}]]
}
conns["Extract Poll URL"] = {
    "main": [[{"node": "Wait 15s", "type": "main", "index": 0}]]
}
conns["Wait 15s"] = {
    "main": [[{"node": "Check Veo Status", "type": "main", "index": 0}]]
}
conns["Check Veo Status"] = {
    "main": [[{"node": "Is Done?", "type": "main", "index": 0}]]
}
# IF node: output 0 = true (succeeded), output 1 = false (loop back)
conns["Is Done?"] = {
    "main": [
        [{"node": "Extract Video URL", "type": "main", "index": 0}],
        [{"node": "Wait 15s", "type": "main", "index": 0}]
    ]
}
conns["Extract Video URL"] = {
    "main": [[{"node": "Download Veo Video", "type": "main", "index": 0}]]
}
conns["Download Veo Video"] = {
    "main": [[{"node": "Bluesky Login", "type": "main", "index": 0}]]
}

print("Nodes:", [n["name"] for n in nodes])
print()

# Trace the flow
flow = []
node = "Weekly Schedule"
visited = set()
while node and node not in visited:
    visited.add(node)
    flow.append(node)
    targets = conns.get(node, {}).get("main", [[]])
    if targets and targets[0]:
        node = targets[0][0]["node"]
    else:
        node = None
print("Flow:", " -> ".join(flow))
print("(Is Done? false branch loops back to Wait 15s)")

cur.execute("UPDATE workflow_entity SET nodes=?, connections=? WHERE id=?",
            (json.dumps(nodes), json.dumps(conns), WORKFLOW_ID))
conn.commit()
conn.close()
print("\nDone!")
