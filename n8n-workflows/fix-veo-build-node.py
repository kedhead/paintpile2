#!/usr/bin/env python3
"""Fix the Build Claude Request code node - single quotes were lost in SSH."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
nodes = json.loads(cur.fetchone()[0])

build_request_code = """const projects = $json.projects;
const projectList = projects.map(p => {
  let line = p.name + ' by ' + (p.author_name || 'Unknown');
  if (p.description) {
    line += ' - ' + p.description.substring(0, 80);
  }
  return line;
}).join('\\n');

const prompt = `You are a creative director making a viral 8-second video ad for PaintPile, a miniature painting community app at thepaintpile.com. Users can share painted miniatures, browse paint recipes, battle in painting challenges, and get AI-powered critiques of their work.

You need to write TWO things:
1. A vivid Veo3 AI video prompt describing a single stunning 8-second scene
2. A Bluesky post caption (under 280 chars)

Here are some recent projects on the site for inspiration (you may or may not feature them):
${projectList}

IMPORTANT: Do NOT always make the video about specific projects. Mix it up! Some weeks do:
- A general hype commercial for PaintPile as a platform
- A commercial highlighting the Paint Recipes feature
- A commercial about the AI Critique / scoring feature
- A commercial about painting battles and competitions
- A commercial featuring the community feed and social aspects
- A commercial showcasing the color matcher or paint mixer tools
- A cinematic mini-painting montage that just looks cool
Only sometimes feature the actual projects listed above.

For the VIDEO PROMPT, describe a cinematic scene including:
- Dark moody stage with dramatic spotlights (purple, cyan, magenta)
- Paint bottles, brushes, miniatures, or app UI elements as relevant
- Vibrant paint splatter explosions in cyan, magenta, yellow, purple
- PaintPile text appearing as graffiti-style neon logo
- thepaintpile.com appearing boldly
- Dynamic camera movement (dolly, crane, or orbit shot)
- End with a punchy tagline like PAINT. BATTLE. SHARE. or Unleash Your Colors
- Audio: energetic electronic music with paint splash sound effects

Be extremely specific and visual. Veo3 works best with detailed cinematic descriptions.

For the CAPTION, write an engaging Bluesky post with relevant hashtags (#minipainting #paintpile #warhammer #hobby #tabletop).

Return ONLY a raw JSON object with two keys: veoPrompt and caption. No markdown, no code fences, no explanation.`;

return [{ json: {
  projects,
  requestBody: {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }]
  }
}}];"""

for n in nodes:
    if n["name"] == "Build Claude Request":
        n["parameters"]["jsCode"] = build_request_code
        print("Fixed Build Claude Request code")
        break

cur.execute("UPDATE workflow_entity SET nodes=? WHERE id=?", (json.dumps(nodes), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done")
