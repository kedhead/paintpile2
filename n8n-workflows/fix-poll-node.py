#!/usr/bin/env python3
"""Fix the Poll for Result code node — single quotes were lost in SSH."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
nodes = json.loads(cur.fetchone()[0])

poll_code = """const predictionUrl = $json.urls.get;
const token = $env.REPLICATE_API_TOKEN;
const maxWait = 300000;
const interval = 15000;
const start = Date.now();

while (Date.now() - start < maxWait) {
  const res = await fetch(predictionUrl, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();

  if (data.status === 'succeeded') {
    return [{ json: { videoUrl: data.output, status: 'succeeded' } }];
  }
  if (data.status === 'failed' || data.status === 'canceled') {
    throw new Error('Veo3 generation ' + data.status + ': ' + (data.error || 'unknown'));
  }
  await new Promise(r => setTimeout(r, interval));
}
throw new Error('Veo3 generation timed out after 5 minutes');"""

for n in nodes:
    if n["name"] == "Poll for Result":
        n["parameters"]["jsCode"] = poll_code
        print("Fixed Poll for Result code")
        break

cur.execute("UPDATE workflow_entity SET nodes=? WHERE id=?", (json.dumps(nodes), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done")
