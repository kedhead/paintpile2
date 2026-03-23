#!/usr/bin/env python3
"""Fix the Generate Veo Prompt (Claude) node jsonBody escaping."""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT nodes FROM workflow_entity WHERE id=?", (WORKFLOW_ID,))
nodes = json.loads(cur.fetchone()[0])

# Build the prompt as a plain string (no quotes that need JSON-escaping)
prompt = (
    "You are a creative director making a viral 8-second video ad for PaintPile, "
    "a miniature painting community app at thepaintpile.com. "
    "Users can share painted miniatures, browse paint recipes, battle in painting challenges, "
    "and get AI-powered critiques of their work.\n\n"

    "You need to write TWO things:\n"
    "1. A vivid Veo3 AI video prompt describing a single stunning 8-second scene\n"
    "2. A Bluesky post caption (under 280 chars)\n\n"

    "Here are some recent projects on the site for inspiration (you may or may not feature them):\n"
    "\" + JSON.stringify($json.projects.map(p => ({ name: p.name, author: p.author_name, description: p.description }))) + \"\n\n"

    "IMPORTANT: Do NOT always make the video about specific projects. Mix it up! Some weeks do:\n"
    "- A general hype commercial for PaintPile as a platform\n"
    "- A commercial highlighting the Paint Recipes feature\n"
    "- A commercial about the AI Critique / scoring feature\n"
    "- A commercial about painting battles and competitions\n"
    "- A commercial featuring the community feed and social aspects\n"
    "- A commercial showcasing the color matcher or paint mixer tools\n"
    "- A cinematic mini-painting montage that just looks cool\n"
    "Only sometimes feature the actual projects listed above.\n\n"

    "For the VIDEO PROMPT, describe a cinematic scene including:\n"
    "- Dark moody stage with dramatic spotlights (purple, cyan, magenta)\n"
    "- Paint bottles, brushes, miniatures, or app UI elements as relevant\n"
    "- Vibrant paint splatter explosions in cyan, magenta, yellow, purple\n"
    "- PaintPile text appearing as graffiti-style neon logo\n"
    "- thepaintpile.com appearing boldly\n"
    "- Dynamic camera movement (dolly, crane, or orbit shot)\n"
    "- End with a punchy tagline like PAINT. BATTLE. SHARE. or Unleash Your Colors\n"
    "- Audio: energetic electronic music with paint splash sound effects\n\n"
    "Be extremely specific and visual. Veo3 works best with detailed cinematic descriptions.\n\n"

    "For the CAPTION, write an engaging Bluesky post with relevant hashtags "
    "(#minipainting #paintpile #warhammer #hobby #tabletop).\n\n"

    "Return ONLY a raw JSON object with two keys: veoPrompt and caption. "
    "No markdown, no code fences, no explanation."
)

# Build the n8n expression jsonBody
# In n8n, = prefix means expression mode. The content uses string concatenation
# to inject the dynamic projects data.
inner = json.dumps({
    "model": "claude-haiku-4-5-20251001",
    "max_tokens": 1500,
    "messages": [{
        "role": "user",
        "content": prompt
    }]
})

# n8n expression: = prefix, with {{ }} for the dynamic expression parts
# We need to break the string at the point where projects are injected
# The prompt uses string concatenation: "..." + JSON.stringify(...) + "..."
# So the jsonBody should be a single n8n expression

# Actually, the simplest approach: put the whole thing as an n8n expression
# with {{ }} around the dynamic part
json_body = "=" + inner.replace(
    '" + JSON.stringify($json.projects.map(p => ({ name: p.name, author: p.author_name, description: p.description }))) + "',
    '{{ JSON.stringify($json.projects.map(p => ({ name: p.name, author: p.author_name, description: p.description }))) }}'
)

for n in nodes:
    if n["name"] == "Generate Veo Prompt (Claude)":
        n["parameters"]["jsonBody"] = json_body
        # Verify it looks right
        print("jsonBody starts with:", json_body[:80])
        print("jsonBody length:", len(json_body))
        print("Contains {{ expression }}:", "{{ JSON.stringify" in json_body)
        print("Fixed!")
        break

cur.execute("UPDATE workflow_entity SET nodes=? WHERE id=?", (json.dumps(nodes), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done - restart n8n to apply")
