#!/usr/bin/env python3
"""Switch from Veo3 to prunaai/p-video on Replicate — cheaper and faster."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
nodes = json.loads(cur.fetchone()[0])

# 1. Update Start Veo3 Generation → Start Video Generation (p-video)
for n in nodes:
    if n["name"] == "Start Veo3 Generation":
        n["name"] = "Start Video Generation"
        n["parameters"]["url"] = "https://api.replicate.com/v1/models/prunaai/p-video/predictions"
        # p-video params: prompt, duration, resolution, aspect_ratio, save_audio
        n["parameters"]["jsonBody"] = '={{ JSON.stringify({ input: { prompt: $json.veoPrompt, duration: 8, resolution: "1080p", aspect_ratio: "9:16", save_audio: true, prompt_upsampling: true } }) }}'
        print("Updated: Start Video Generation (p-video)")
        break

# 2. Update connections that reference old name
cur.execute("SELECT connections FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
conns = json.loads(cur.fetchone()[0])

# Rename in connections
if "Start Veo3 Generation" in conns:
    conns["Start Video Generation"] = conns.pop("Start Veo3 Generation")

# Fix any node referencing the old name
for src, targets in conns.items():
    for chain in targets.get("main", []):
        for t in chain:
            if t["node"] == "Start Veo3 Generation":
                t["node"] = "Start Video Generation"

# 3. Update Build Claude Request prompt to say p-video instead of Veo3
for n in nodes:
    if n["name"] == "Build Claude Request":
        old_code = n["parameters"]["jsCode"]
        # Just update the prompt description - p-video works great with same style prompts
        new_code = old_code.replace(
            "a vivid Veo3 AI video prompt",
            "a vivid AI video prompt"
        ).replace(
            "Veo3 works best with",
            "AI video generation works best with"
        )
        n["parameters"]["jsCode"] = new_code
        print("Updated: Build Claude Request prompt")
        break

# 4. Update error messages in any remaining nodes
for n in nodes:
    if n["name"] == "Extract Video URL":
        old = n["parameters"].get("jsCode", "")
        n["parameters"]["jsCode"] = old.replace("Veo3", "Video")

print("Node names:", [n["name"] for n in nodes])

cur.execute("UPDATE workflow_entity SET nodes=?, connections=? WHERE id=?",
            (json.dumps(nodes), json.dumps(conns), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done!")
