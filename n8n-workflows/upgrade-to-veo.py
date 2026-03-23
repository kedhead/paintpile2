#!/usr/bin/env python3
"""
Upgrade the PaintPile Video Commercial Generator workflow to use Veo3 AI video.

Replaces the ffmpeg slideshow pipeline with:
  Claude crafts Veo3 prompt → API generates AI video → Post to Bluesky with video

Run on VPS: python3 /opt/paintpile2/n8n-workflows/upgrade-to-veo.py
"""
import sqlite3, json

DB_PATH = "/opt/n8n/data/database.sqlite"
WORKFLOW_ID = "8d3891c9-50a7-4b91-8af2-494c2581c405"

# ─── New/updated node definitions ────────────────────────────────────────────

# Claude now generates a Veo3 prompt + Bluesky caption instead of a slide script
claude_body = r"""={
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 1500,
  "messages": [{
    "role": "user",
    "content": "You are a creative director making a viral 8-second video ad for PaintPile, a miniature painting community app. You need to write TWO things:\n\n1. A vivid Veo3 AI video prompt describing a single stunning 8-second scene\n2. A Bluesky post caption (under 280 chars)\n\nFeatured projects this week:\n{{ JSON.stringify($json.projects.map(p => ({ name: p.name, author: p.author_name, description: p.description }))) }}\n\nFor the VIDEO PROMPT, describe a cinematic scene that includes:\n- Dark moody stage with dramatic spotlights (purple, cyan, magenta)\n- Paint bottles (Vallejo, Citadel, Army Painter) arranged dramatically or flying through air\n- Painted miniatures showcased on display pedestals or inside glass bubbles\n- Vibrant paint splatter explosions in cyan, magenta, yellow, purple\n- 'PaintPile' text appearing as graffiti-style neon logo with 'PP' monogram\n- 'thepaintpile.com' appearing boldly\n- Dynamic camera movement (dolly, crane, or orbit shot)\n- Reference the actual featured project themes/names for variety\n- End with a punchy tagline like 'PAINT. BATTLE. SHARE.' or 'Unleash Your Colors'\n- Audio: energetic electronic music with paint splash sound effects\n\nBe extremely specific and visual. Veo3 works best with detailed cinematic descriptions.\n\nFor the CAPTION, write an engaging Bluesky post mentioning the featured artists/projects with relevant hashtags (#minipainting #paintpile #warhammer #hobby #tabletop).\n\nReturn ONLY valid JSON (no markdown):\n{\"veoPrompt\": \"your detailed scene description...\", \"caption\": \"your bluesky caption...\"}"
  }]
}"""

# Parse Veo prompt + caption from Claude response
parse_code = r"""const response = $input.first().json;
const text = response.content?.[0]?.text || '';
let parsed;
try {
  parsed = JSON.parse(text);
} catch {
  const match = text.match(/\{[\s\S]*"veoPrompt"[\s\S]*\}/);
  if (match) {
    parsed = JSON.parse(match[0]);
  } else {
    throw new Error('Could not parse Veo prompt from Claude response: ' + text.substring(0, 300));
  }
}
if (!parsed.veoPrompt) throw new Error('No veoPrompt in Claude response');

const projects = $('Format Projects').first().json.projects;

// Build reference image URL from best project cover photo
const pbBase = 'http://172.17.0.1:8090/api/files';
const referenceImageUrls = [];
for (const p of projects) {
  if (p.cover_photo && referenceImageUrls.length < 2) {
    referenceImageUrls.push(`${pbBase}/${p.collectionId}/${p.id}/${p.cover_photo}`);
  }
}

return [{ json: {
  veoPrompt: parsed.veoPrompt,
  caption: parsed.caption || 'Check out this week\'s amazing minis on PaintPile! 🎨 thepaintpile.com #minipainting #paintpile',
  referenceImageUrls,
  projects
}}];"""

# Veo commercial API call body
veo_reel_body = """={{ JSON.stringify({ prompt: $json.veoPrompt, referenceImageUrls: $json.referenceImageUrls, aspectRatio: '9:16', resolution: '1080p', generateAudio: true, secret: $env.VIDEO_API_SECRET }) }}"""

# Bluesky login node (reused pattern from promoter workflow)
bsky_login = {
    "parameters": {
        "method": "POST",
        "url": "https://bsky.social/xrpc/com.atproto.server.createSession",
        "sendHeaders": True,
        "headerParameters": {
            "parameters": [
                {"name": "Content-Type", "value": "application/json"}
            ]
        },
        "sendBody": True,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({identifier: $env.BSKY_HANDLE, password: $env.BSKY_APP_PASSWORD}) }}",
        "options": {}
    },
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [1600, 300],
    "id": "veo-bsky-login-001",
    "name": "Bluesky Login"
}

# Upload video blob to Bluesky
bsky_upload_video = {
    "parameters": {
        "method": "POST",
        "url": "https://bsky.social/xrpc/com.atproto.repo.uploadBlob",
        "sendHeaders": True,
        "headerParameters": {
            "parameters": [
                {"name": "Authorization", "value": "=Bearer {{ $('Bluesky Login').first().json.accessJwt }}"},
                {"name": "Content-Type", "value": "video/mp4"}
            ]
        },
        "sendBody": True,
        "contentType": "binaryData",
        "inputDataFieldName": "data",
        "options": {}
    },
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [1800, 300],
    "id": "veo-bsky-upload-001",
    "name": "Upload Video to Bluesky"
}

# Build Bluesky post with video embed
bsky_build_post_code = r"""const blob = $input.first().json.blob;
const session = $('Bluesky Login').first().json;
const data = $('Parse Veo Prompt').first().json;
const caption = data.caption;
const now = new Date().toISOString();

// Build facets for any URLs in the caption
const facets = [];
const urlRegex = /(https?:\/\/[^\s]+)/g;
let match;
while ((match = urlRegex.exec(caption)) !== null) {
  const url = match[1];
  const urlStart = match.index;
  // Calculate byte offsets
  let byteStart = 0;
  for (let i = 0; i < urlStart; i++) {
    const code = caption.charCodeAt(i);
    if (code <= 0x7f) byteStart += 1;
    else if (code <= 0x7ff) byteStart += 2;
    else if (code <= 0xffff) byteStart += 3;
    else byteStart += 4;
  }
  let byteEnd = byteStart;
  for (let i = 0; i < url.length; i++) {
    const code = url.charCodeAt(i);
    if (code <= 0x7f) byteEnd += 1;
    else if (code <= 0x7ff) byteEnd += 2;
    else if (code <= 0xffff) byteEnd += 3;
    else byteEnd += 4;
  }
  facets.push({
    index: {byteStart, byteEnd},
    features: [{"$type": "app.bsky.richtext.facet#link", uri: url}]
  });
}

// Video embed
const embed = {
  "$type": "app.bsky.embed.video",
  video: blob,
  aspectRatio: { width: 9, height: 16 }
};

return [{json: {
  did: session.did,
  accessJwt: session.accessJwt,
  postBody: {
    repo: session.did,
    collection: "app.bsky.feed.post",
    record: {
      "$type": "app.bsky.feed.post",
      text: caption,
      facets: facets.length > 0 ? facets : undefined,
      embed: embed,
      createdAt: now
    }
  }
}}];"""

bsky_build_post = {
    "parameters": {
        "jsCode": bsky_build_post_code
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [2000, 300],
    "id": "veo-bsky-build-001",
    "name": "Build Video Post"
}

# Create the Bluesky post
bsky_create_post = {
    "parameters": {
        "method": "POST",
        "url": "https://bsky.social/xrpc/com.atproto.repo.createRecord",
        "sendHeaders": True,
        "headerParameters": {
            "parameters": [
                {"name": "Authorization", "value": "=Bearer {{ $json.accessJwt }}"},
                {"name": "Content-Type", "value": "application/json"}
            ]
        },
        "sendBody": True,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json.postBody) }}",
        "options": {}
    },
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [2200, 300],
    "id": "veo-bsky-post-001",
    "name": "Post to Bluesky"
}


# ─── Apply changes ──────────────────────────────────────────────────────────

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute('SELECT nodes, connections FROM workflow_entity WHERE id=?', (WORKFLOW_ID,))
row = cur.fetchone()
if not row:
    print(f'ERROR: Workflow {WORKFLOW_ID} not found')
    exit(1)

nodes = json.loads(row[0])
connections = json.loads(row[1])

# ─── Update existing nodes ──────────────────────────────────────────────────

# Remove nodes we're replacing
remove_names = {
    'Generate Reel (9:16)',
    'Generate Square (1:1)',
    'Prepare IG Post',
}
nodes = [n for n in nodes if n['name'] not in remove_names]
print(f'Removed old nodes: {remove_names}')

for n in nodes:
    if n['name'] == 'Generate Script (Claude)':
        n['name'] = 'Generate Veo Prompt (Claude)'
        n['parameters']['jsonBody'] = claude_body
        print('Updated: Generate Script → Generate Veo Prompt')

    elif n['name'] == 'Parse Script':
        n['name'] = 'Parse Veo Prompt'
        n['parameters']['jsCode'] = parse_code
        print('Updated: Parse Script → Parse Veo Prompt')

# ─── Add new nodes ──────────────────────────────────────────────────────────

# Veo Reel generation node
veo_reel = {
    "parameters": {
        "method": "POST",
        "url": "http://172.17.0.1:3000/api/video/veo-commercial",
        "sendBody": True,
        "specifyBody": "json",
        "jsonBody": veo_reel_body,
        "options": {
            "response": {"response": {"responseFormat": "file"}},
            "timeout": 300000
        }
    },
    "id": "veo-generate-reel-001",
    "name": "Generate Veo Reel",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [1200, 300]
}

nodes.extend([veo_reel, bsky_login, bsky_upload_video, bsky_build_post, bsky_create_post])
print('Added new nodes: Generate Veo Reel, Bluesky Login, Upload Video, Build Video Post, Post to Bluesky')

# ─── Update connections ─────────────────────────────────────────────────────

# Remove old connections
for old_name in list(remove_names) + ['Generate Script (Claude)', 'Parse Script']:
    connections.pop(old_name, None)

# New linear flow
connections['Format Projects'] = {
    'main': [[{'node': 'Generate Veo Prompt (Claude)', 'type': 'main', 'index': 0}]]
}
connections['Generate Veo Prompt (Claude)'] = {
    'main': [[{'node': 'Parse Veo Prompt', 'type': 'main', 'index': 0}]]
}
connections['Parse Veo Prompt'] = {
    'main': [[{'node': 'Generate Veo Reel', 'type': 'main', 'index': 0}]]
}
connections['Generate Veo Reel'] = {
    'main': [[{'node': 'Bluesky Login', 'type': 'main', 'index': 0}]]
}
connections['Bluesky Login'] = {
    'main': [[{'node': 'Upload Video to Bluesky', 'type': 'main', 'index': 0}]]
}
connections['Upload Video to Bluesky'] = {
    'main': [[{'node': 'Build Video Post', 'type': 'main', 'index': 0}]]
}
connections['Build Video Post'] = {
    'main': [[{'node': 'Post to Bluesky', 'type': 'main', 'index': 0}]]
}

print('Updated connections for new flow')

# ─── Save ────────────────────────────────────────────────────────────────────

cur.execute('UPDATE workflow_entity SET nodes=?, connections=? WHERE id=?',
            (json.dumps(nodes), json.dumps(connections), WORKFLOW_ID))
conn.commit()
conn.close()
print('\nDone! Workflow updated to Veo3 pipeline.')
print('New flow: Schedule → Fetch → Format → Claude Veo Prompt → Parse → Generate Veo Reel → Bluesky Login → Upload Video → Build Post → Post to Bluesky')
print('\nRequired env vars: ANTHROPIC_API_KEY, VIDEO_API_SECRET, BSKY_HANDLE, BSKY_APP_PASSWORD')
