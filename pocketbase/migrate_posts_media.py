"""
Migration: Add 'videos' and 'text_overlays' fields to the existing posts collection.
Run on VPS: python3 /opt/paintpile2/pocketbase/migrate_posts_media.py
"""
import json, urllib.request, urllib.error

BASE = "http://127.0.0.1:8090/api"

# Auth
data = json.dumps({"identity": "admin@paintpile.app", "password": "paintpile2admin"}).encode()
req = urllib.request.Request(BASE + "/collections/_superusers/auth-with-password", data=data, headers={"Content-Type": "application/json"}, method="POST")
token = json.loads(urllib.request.urlopen(req).read())["token"]
headers = {"Authorization": "Bearer " + token, "Content-Type": "application/json"}

def api(method, path, data=None):
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(BASE + path, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req).read()
        return json.loads(resp) if resp else None
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print("  ERROR: " + err[:600])
        return None

# Get current posts collection
posts = api("GET", "/collections/posts")
if not posts:
    print("ERROR: Could not fetch posts collection")
    exit(1)

print("Current posts fields:")
for f in posts.get("fields", []):
    print(f"  - {f['name']} ({f['type']})")

# Check if fields already exist
existing_names = [f["name"] for f in posts.get("fields", [])]

new_fields = []
if "videos" not in existing_names:
    new_fields.append({
        "name": "videos",
        "type": "file",
        "required": False,
        "maxSelect": 3,
        "maxSize": 52428800,
        "mimeTypes": ["video/mp4", "video/webm", "video/quicktime"],
    })
    print("\nAdding 'videos' field...")
else:
    print("\n'videos' field already exists, skipping.")

if "text_overlays" not in existing_names:
    new_fields.append({
        "name": "text_overlays",
        "type": "json",
        "required": False,
    })
    print("Adding 'text_overlays' field...")
else:
    print("'text_overlays' field already exists, skipping.")

if not new_fields:
    print("\nNo new fields to add. Done!")
    exit(0)

# PATCH the collection with new fields appended
updated_fields = posts["fields"] + new_fields
result = api("PATCH", f"/collections/{posts['id']}", {"fields": updated_fields})

if result:
    print("\nSUCCESS! Updated posts collection fields:")
    for f in result.get("fields", []):
        print(f"  - {f['name']} ({f['type']})")
else:
    print("\nFAILED to update posts collection.")
