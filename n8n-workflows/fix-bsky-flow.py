#!/usr/bin/env python3
"""Fix Bluesky flow — Login before Download so binary data reaches Upload."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes, connections FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
row = cur.fetchone()
nodes = json.loads(row[0])
conns = json.loads(row[1])

# Reorder: Extract Video URL → Bluesky Login → Download Video → Upload Video
# This way Download's binary data flows directly into Upload

# Update Upload node to reference Bluesky Login for auth token
for n in nodes:
    if n["name"] == "Upload Video to Bluesky":
        n["parameters"]["headerParameters"]["parameters"] = [
            {"name": "Authorization", "value": "=Bearer {{ $('Bluesky Login').first().json.accessJwt }}"},
            {"name": "Content-Type", "value": "video/mp4"}
        ]
        print("Updated Upload auth to reference Bluesky Login")

    # Update Download to get URL from Extract Video URL
    if n["name"] == "Download Veo Video":
        n["parameters"]["url"] = "={{ $('Extract Video URL').first().json.videoUrl }}"
        print("Updated Download URL reference")

# Rewire connections
conns["Extract Video URL"] = {
    "main": [[{"node": "Bluesky Login", "type": "main", "index": 0}]]
}
conns["Bluesky Login"] = {
    "main": [[{"node": "Download Veo Video", "type": "main", "index": 0}]]
}
conns["Download Veo Video"] = {
    "main": [[{"node": "Upload Video to Bluesky", "type": "main", "index": 0}]]
}
conns["Upload Video to Bluesky"] = {
    "main": [[{"node": "Build Video Post", "type": "main", "index": 0}]]
}

# Reposition
for n in nodes:
    if n["name"] == "Extract Video URL":
        n["position"] = [2200, 200]
    elif n["name"] == "Bluesky Login":
        n["position"] = [2400, 200]
    elif n["name"] == "Download Veo Video":
        n["position"] = [2600, 200]
    elif n["name"] == "Upload Video to Bluesky":
        n["position"] = [2800, 200]
    elif n["name"] == "Build Video Post":
        n["position"] = [3000, 200]
    elif n["name"] == "Post to Bluesky":
        n["position"] = [3200, 200]

# Verify flow
flow = []
node = "Extract Video URL"
visited = set()
while node and node not in visited:
    visited.add(node)
    flow.append(node)
    targets = conns.get(node, {}).get("main", [[]])
    if targets and targets[0]:
        node = targets[0][0]["node"]
    else:
        node = None
print("Bluesky flow:", " -> ".join(flow))

cur.execute("UPDATE workflow_entity SET nodes=?, connections=? WHERE id=?",
            (json.dumps(nodes), json.dumps(conns), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done!")
