#!/usr/bin/env python3
"""Switch video generation from p-video to grok-imagine-video."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
nodes = json.loads(cur.fetchone()[0])

for n in nodes:
    if n["name"] == "Start Video Generation":
        n["parameters"]["url"] = "https://api.replicate.com/v1/models/xai/grok-imagine-video/predictions"
        n["parameters"]["jsonBody"] = '={{ JSON.stringify({ input: { prompt: $json.veoPrompt, duration: 8, resolution: "720p", aspect_ratio: "9:16" } }) }}'
        print("Switched to grok-imagine-video")
        break

cur.execute("UPDATE workflow_entity SET nodes=? WHERE id=?", (json.dumps(nodes), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done")
