#!/usr/bin/env python3
"""Fix the Generate Veo Prompt (Claude) node jsonBody — use raw string like working nodes."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
nodes = json.loads(cur.fetchone()[0])

# Use the EXACT same format as upgrade-video-workflow.py (which works):
# Raw string with \n as literal 2-char sequences, not actual newlines.
# n8n expression: = prefix, {{ }} for dynamic parts.
claude_body = r"""={
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 1500,
  "messages": [{
    "role": "user",
    "content": "You are a creative director making a viral 8-second video ad for PaintPile, a miniature painting community app at thepaintpile.com. Users can share painted miniatures, browse paint recipes, battle in painting challenges, and get AI-powered critiques of their work.\n\nYou need to write TWO things:\n1. A vivid Veo3 AI video prompt describing a single stunning 8-second scene\n2. A Bluesky post caption (under 280 chars)\n\nHere are some recent projects on the site for inspiration (you may or may not feature them):\n{{ JSON.stringify($json.projects.map(p => ({ name: p.name, author: p.author_name, description: p.description }))) }}\n\nIMPORTANT: Do NOT always make the video about specific projects. Mix it up! Some weeks do:\n- A general hype commercial for PaintPile as a platform\n- A commercial highlighting the Paint Recipes feature\n- A commercial about the AI Critique / scoring feature\n- A commercial about painting battles and competitions\n- A commercial featuring the community feed and social aspects\n- A commercial showcasing the color matcher or paint mixer tools\n- A cinematic mini-painting montage that just looks cool\nOnly sometimes feature the actual projects listed above.\n\nFor the VIDEO PROMPT, describe a cinematic scene including:\n- Dark moody stage with dramatic spotlights (purple, cyan, magenta)\n- Paint bottles, brushes, miniatures, or app UI elements as relevant\n- Vibrant paint splatter explosions in cyan, magenta, yellow, purple\n- PaintPile text appearing as graffiti-style neon logo\n- thepaintpile.com appearing boldly\n- Dynamic camera movement (dolly, crane, or orbit shot)\n- End with a punchy tagline like PAINT. BATTLE. SHARE. or Unleash Your Colors\n- Audio: energetic electronic music with paint splash sound effects\n\nBe extremely specific and visual. Veo3 works best with detailed cinematic descriptions.\n\nFor the CAPTION, write an engaging Bluesky post with relevant hashtags (#minipainting #paintpile #warhammer #hobby #tabletop).\n\nReturn ONLY a raw JSON object with two keys: veoPrompt and caption. No markdown, no code fences, no explanation."
  }]
}"""

for n in nodes:
    if n["name"] == "Generate Veo Prompt (Claude)":
        n["parameters"]["jsonBody"] = claude_body
        print("Updated jsonBody")
        print("Starts with:", repr(claude_body[:50]))
        print("Has {{ expr }}:", "{{ JSON.stringify" in claude_body)
        break

cur.execute("UPDATE workflow_entity SET nodes=? WHERE id=?", (json.dumps(nodes), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done")
