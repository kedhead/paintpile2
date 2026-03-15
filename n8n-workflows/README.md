# n8n Workflows

## Setup

### Prerequisites (one-time, manual)

1. **Install ffmpeg on VPS:**
   ```bash
   apt-get install -y ffmpeg
   ```

2. **Add env vars to VPS `.env`:**
   ```bash
   VIDEO_API_SECRET=<generate-a-strong-secret>
   ```

3. **Instagram Setup:**
   - Link Facebook Business Page to Instagram Professional account
   - Create Meta Developer App → add Instagram Graph API product
   - Request permissions: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
   - Get `IG_USER_ID` via `GET /me/accounts` → `GET /{page-id}?fields=instagram_business_account`
   - Generate a long-lived token (or System User token from Business Manager)
   - Add to n8n environment variables:
     - `META_ACCESS_TOKEN` — long-lived Meta access token
     - `IG_USER_ID` — Instagram Business Account ID
     - `ANTHROPIC_API_KEY` — for Claude Haiku script generation
     - `VIDEO_API_SECRET` — must match the VPS .env value

### Deploying Workflows

#### Instagram Nodes (patch existing workflow)
The `instagram-nodes-patch.json` contains nodes to add to the existing "PaintPile Social Media Promoter" workflow. In n8n:
1. Open the existing workflow
2. Add each node manually (or import via n8n API)
3. Connect "Format Post" output → "Resolve Photo URL" input
4. The Instagram branch runs in parallel with Twitter/Bluesky

#### Video Commercial Generator (new workflow)
Import `video-commercial-generator.json` as a new workflow in n8n:
1. Go to n8n → Workflows → Import from File
2. Select `video-commercial-generator.json`
3. Configure environment variables in n8n Settings → Variables
4. Test with manual trigger first

### Testing

```bash
# Test the video commercial endpoint
curl -X POST https://thepaintpile.com/api/video/commercial \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-secret-here",
    "format": "9:16",
    "projects": [
      {
        "id": "test123",
        "collectionId": "projects",
        "name": "Space Marine Captain",
        "author_name": "TestUser",
        "cover_photo": "photo.jpg"
      }
    ],
    "script": [
      { "type": "intro", "text_overlay": "PaintPile", "duration": 4 },
      { "type": "project", "project_index": 0, "text_overlay": "Amazing detail!", "duration": 6 },
      { "type": "cta", "text_overlay": "Join PaintPile today!", "duration": 4 }
    ]
  }' \
  --output commercial.mp4

# Test the file proxy
curl -I https://thepaintpile.com/api/files/{collectionId}/{recordId}/{filename}
```
