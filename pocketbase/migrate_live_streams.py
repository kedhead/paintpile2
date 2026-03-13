"""
Migration: Create 'live_streams' collection for feed live streaming.
Run on VPS: python3 /opt/paintpile2/pocketbase/migrate_live_streams.py
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

# Check if collection already exists
existing = api("GET", "/collections/live_streams")
if existing:
    print("'live_streams' collection already exists!")
    print("Fields:")
    for f in existing.get("fields", []):
        print(f"  - {f['name']} ({f['type']})")
    exit(0)

# Get users collection ID
users_col = api("GET", "/collections/users")
USERS = users_col["id"] if users_col else "_pb_users_auth_"

# Create live_streams collection
result = api("POST", "/collections", {
    "name": "live_streams",
    "type": "base",
    "fields": [
        {"name": "user", "type": "relation", "required": True, "collectionId": USERS, "cascadeDelete": True, "maxSelect": 1},
        {"name": "title", "type": "text", "required": True, "max": 200},
        {"name": "room_name", "type": "text", "required": True},
        {"name": "is_live", "type": "bool", "required": False},
        {"name": "viewer_count", "type": "number", "required": False, "min": 0},
        {"name": "started_at", "type": "autodate", "required": False, "onCreate": True, "onUpdate": False},
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "@request.auth.id = user",
    "updateRule": "@request.auth.id = user",
    "deleteRule": "@request.auth.id = user",
})

if result:
    print("SUCCESS! Created 'live_streams' collection:")
    for f in result.get("fields", []):
        print(f"  - {f['name']} ({f['type']})")
else:
    print("FAILED to create 'live_streams' collection.")
