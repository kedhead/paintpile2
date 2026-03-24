#!/usr/bin/env python3
"""Rewrite prompt for viral, creative, attention-grabbing videos."""
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

const prompt = `You are writing a text-to-video prompt for an 8-second vertical (9:16) social media video promoting thepaintpile.com — a community app for miniature painters.

The video needs to be SCROLL-STOPPING. Think viral TikTok/Reels energy. Edgy, fun, sexy, weird, cool — whatever makes someone stop scrolling and watch. NOT a boring corporate ad.

The site is about miniature painting (Warhammer, D&D minis, etc). Features: sharing painted minis, paint recipes, AI critiques, color matching tools.

Recent projects for inspiration:
${projectList}

Write a CREATIVE, ATTENTION-GRABBING video prompt. Here are some example vibes (mix it up, surprise me every time):

- Rock and roll style — thepaintpile.com logo tattooed on someone as they sensually paint a mini
- A dramatic heist scene but they're stealing paint pots and the getaway car has thepaintpile.com on it
- Someone painting a mini that comes to life and starts fighting on the desk
- A painter in a dark room, sparks flying off the brush like they're welding, thepaintpile.com spray painted on the wall
- A mini painting competition with dramatic sports commentary energy
- Street art style — someone graffiti-spraying "thepaintpile.com" while painted minis line the alley
- A chef-style cooking show but they're mixing paints with dead serious precision
- Someone painting a mini on a rooftop at sunset, cinematic drone shot, thepaintpile.com on a billboard
- Music video energy — painter vibing to music, paint flying everywhere in slow-mo
- A tattoo parlor but they're tattooing a miniature instead of a person

KEY RULES:
- ALWAYS work "thepaintpile.com" into the scene naturally (tattoo, graffiti, neon sign, billboard, spray paint, written on something, etc.)
- Include actual miniature painting somewhere in the scene
- Make it visually stunning and unexpected
- Go for viral social media energy — the kind of video people share
- Be specific and detailed in your description
- Audio: pick music that matches the vibe (rock, electronic, lo-fi, cinematic, whatever fits)

Also write a punchy Bluesky caption (under 280 chars) with hashtags: #minipainting #paintpile #warhammer #hobby

Return ONLY a raw JSON object with keys "veoPrompt" and "caption". No markdown, no code fences.`;

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
        print("Updated prompt — viral, creative, scroll-stopping energy")
        break

cur.execute("UPDATE workflow_entity SET nodes=? WHERE id=?", (json.dumps(nodes), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done")
