#!/usr/bin/env python3
"""Fix Parse Veo Prompt to handle markdown fences and alternate key names."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
nodes = json.loads(cur.fetchone()[0])

parse_code = """const response = $input.first().json;
let text = response.content?.[0]?.text || '';

// Strip markdown code fences if present
text = text.replace(/^```(?:json)?\\s*/i, '').replace(/\\s*```$/,'').trim();

let parsed;
try {
  parsed = JSON.parse(text);
} catch {
  // Try to find JSON object in the text
  const match = text.match(/\\{[\\s\\S]*\\}/);
  if (match) {
    parsed = JSON.parse(match[0]);
  } else {
    throw new Error('Could not parse prompt from Claude response: ' + text.substring(0, 300));
  }
}

// Handle alternate key names Claude might use
const videoPrompt = parsed.veoPrompt || parsed.videoPrompt || parsed.prompt || '';
const caption = parsed.caption || parsed.blueskyCaption || '';

if (!videoPrompt) throw new Error('No video prompt in Claude response');

const projects = $('Build Claude Request').first().json.projects;

// Build reference image URL from best project cover photo
const pbBase = 'http://172.17.0.1:8090/api/files';
const referenceImageUrls = [];
for (const p of projects) {
  if (p.cover_photo && referenceImageUrls.length < 2) {
    referenceImageUrls.push(pbBase + '/' + p.collectionId + '/' + p.id + '/' + p.cover_photo);
  }
}

return [{ json: {
  veoPrompt: videoPrompt,
  caption: caption || 'Check out the latest minis on thepaintpile.com! #minipainting #paintpile #warhammer #hobby',
  referenceImageUrls,
  projects
}}];"""

for n in nodes:
    if n["name"] == "Parse Veo Prompt":
        n["parameters"]["jsCode"] = parse_code
        print("Fixed Parse Veo Prompt — handles fences + alternate keys")
        break

cur.execute("UPDATE workflow_entity SET nodes=? WHERE id=?", (json.dumps(nodes), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done")
