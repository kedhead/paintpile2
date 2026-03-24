#!/usr/bin/env python3
"""Add ending instructions to the Claude prompt so videos resolve naturally."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
nodes = json.loads(cur.fetchone()[0])

for n in nodes:
    if n["name"] == "Build Claude Request":
        old_code = n["parameters"]["jsCode"]
        # Add ending guidance before the KEY RULES section
        old_code = old_code.replace(
            "KEY RULES:",
            "PACING (CRITICAL):\n"
            "- The video is ONLY 8 seconds. Structure it as: 0-2s hook/opening, 2-6s main action, 6-8s natural resolution.\n"
            "- The ending MUST feel complete — a held pose, a slow zoom freeze, a final brush stroke, a smirk to camera, a logo reveal, someone walking away, etc.\n"
            "- NEVER describe action that would take longer than 8 seconds. Keep it one tight scene, not a mini-movie.\n"
            "- End on a strong final frame — something that works as a freeze-frame thumbnail.\n\n"
            "KEY RULES:"
        )
        n["parameters"]["jsCode"] = old_code
        print("Added pacing/ending instructions")
        break

cur.execute("UPDATE workflow_entity SET nodes=? WHERE id=?", (json.dumps(nodes), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done")
