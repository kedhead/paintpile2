# PocketBase Setup

## Local Development

1. Download PocketBase from https://pocketbase.io/docs/
2. Extract to this directory
3. Run: `./pocketbase serve`
4. Admin UI: http://127.0.0.1:8090/_/
5. Create your first admin account
6. Import `pb_schema.json` via Settings > Import collections

## Seed Data

After importing the schema, create default chat channels via the admin UI:

| name | slug | category | sort_order |
|------|------|----------|------------|
| General | general | Community | 1 |
| Show Off | show-off | Community | 2 |
| WIP | wip | Community | 3 |
| Help & Tips | help-tips | Community | 4 |
| Paint Recipes | paint-recipes | Hobby | 5 |
| Kitbashing | kitbashing | Hobby | 6 |
| 3D Printing | 3d-printing | Hobby | 7 |
| Off Topic | off-topic | Other | 8 |

## Production Deployment

Deploy PocketBase to any VPS:
- **Fly.io**: ~$3-5/mo (Dockerfile provided)
- **Railway**: ~$5/mo
- **Hetzner VPS**: ~$4/mo (CX22)
- **Any server with Docker**

Data is stored in `pb_data/` (SQLite). Back up this directory regularly.

## Google OAuth

1. Go to Admin UI > Settings > Auth providers
2. Enable Google
3. Add your Google OAuth client ID and secret
