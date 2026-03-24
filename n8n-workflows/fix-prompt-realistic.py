#!/usr/bin/env python3
"""Rewrite the Claude prompt to generate realistic miniature painting videos."""
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

const prompt = `You are writing a text-to-video prompt for an 8-second vertical (9:16) social media ad for PaintPile (thepaintpile.com), a community app for miniature painters.

PaintPile lets users:
- Share photos of their painted miniatures (Warhammer, D&D, Star Wars Legion, etc.)
- Browse and share Paint Recipes with exact paints and step-by-step techniques
- Get AI-powered critiques and scoring of their paintwork
- Use a Color Matcher to find the closest paint match from any brand
- Use a Paint Mixer to simulate mixing colors

Recent projects on the site:
${projectList}

Write a REALISTIC video prompt. The video should look like something a real miniature painting hobbyist would relate to. NO abstract neon stages, NO floating objects, NO surreal nonsense.

Pick ONE of these realistic scene concepts (vary each week):

A) HOBBY DESK SCENE: Close-up of a painter's hands carefully painting a detailed miniature with a fine brush. Hobby desk with paint pots (Citadel, Vallejo, Army Painter), a wet palette, brushes in a cup, and a cutting mat. Warm desk lamp lighting. Camera slowly pulls back to reveal the full workspace. The finished mini looks incredible.

B) MINIATURE SHOWCASE: A beautifully painted miniature (fantasy warrior, space marine, dragon, etc.) sits on a display plinth. Camera does a slow 360-degree orbit around it. Dramatic but natural lighting highlights the paint job details — edge highlights, blending, weathering. Clean dark background.

C) BEFORE/AFTER: A grey unpainted miniature on a sprue transforms into a fully painted masterpiece. Time-lapse feel. Paint colors appear stroke by stroke. Final result is a stunning tabletop-ready mini.

D) COMMUNITY VIBE: Multiple painted miniatures arranged on a gaming table or display shelf. Different styles and armies. Camera glides past them. Feels like browsing a gallery of amazing paintwork. Warm, inviting lighting.

E) PAINT RECIPE: Close-up of paint pots being opened, a brush loading paint, and applying it to a miniature. Shows the layering process — base coat, wash, highlight. Satisfying and meditative. ASMR-like quality.

IMPORTANT RULES FOR THE PROMPT:
- Describe real, physically plausible scenes only
- Mention specific miniature types (space marines, dragons, knights, orcs, etc.)
- Mention real paint brands (Citadel, Vallejo, Army Painter, Scale75)
- Include natural lighting (desk lamp, soft studio light) not neon/lasers
- The video should make a miniature painter think "that's MY hobby"
- End with "thepaintpile.com" text overlay appearing cleanly
- Audio: calm lo-fi or ambient music, brush-on-miniature ASMR sounds

Also write a Bluesky caption (under 280 chars) with hashtags: #minipainting #paintpile #warhammer #hobby #tabletop #miniatures

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
        print("Updated prompt — realistic miniature painting scenes")
        break

cur.execute("UPDATE workflow_entity SET nodes=? WHERE id=?", (json.dumps(nodes), WORKFLOW_ID))
conn.commit()
conn.close()
print("Done")
