"""
Bring an existing PocketBase up to date with the reworked app:

1. Project "showcase details" fields (kind, source, style, techniques,
   color_scheme).
2. Read rules for photos and paint lists (with --fix-rules).
3. An optional `project` link on notes (diary_entries), which turns a
   project's notes into its private build journal.
4. Collections: `project_collections` (a painter's named boards) and
   `project_collection_items` (which projects are saved to which board).

Safe to re-run: existing fields are left alone.

Usage:
  PB_URL=https://your-pocketbase PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... \
    python3 pocketbase/add_showcase_fields.py [--fix-rules]

--fix-rules also sets the list/view rules on `photos` and `project_paints` to
the recommended ones: anyone can read them for public projects; for private
projects only the owner (and admins) can. Without it, the script only reports.
"""
import json, os, sys, urllib.request, urllib.error

BASE = os.environ.get("PB_URL", "http://127.0.0.1:8090").rstrip("/") + "/api"
EMAIL = os.environ.get("PB_ADMIN_EMAIL")
PASSWORD = os.environ.get("PB_ADMIN_PASSWORD")
if not EMAIL or not PASSWORD:
    sys.exit("Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD (and PB_URL for a remote server).")


def call(method, path, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = token
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(BASE + path, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req).read()
        return json.loads(resp) if resp else None
    except urllib.error.HTTPError as e:
        sys.exit(f"{method} {path} failed: {e.code} {e.read().decode()[:400]}")


token = call("POST", "/collections/_superusers/auth-with-password", {"identity": EMAIL, "password": PASSWORD})["token"]

# 1. Fields on projects
NEW_FIELDS = [
    {"name": "kind", "type": "text"},
    {"name": "source", "type": "text"},
    {"name": "style", "type": "text"},
    {"name": "techniques", "type": "json"},
    {"name": "color_scheme", "type": "json"},
]
projects = call("GET", "/collections/projects", token=token)
existing = {f["name"] for f in projects["fields"]}
missing = [f for f in NEW_FIELDS if f["name"] not in existing]
if missing:
    call("PATCH", "/collections/projects", {"fields": projects["fields"] + missing}, token=token)
    print("Added to projects:", ", ".join(f["name"] for f in missing))
else:
    print("projects already has all showcase fields")

# 2. Read access for the pieces of a project page: public for public projects,
#    owner-only (plus admins) for private ones. An empty rule ('') would let
#    anyone list photos and paints from private projects via the API.
ADMIN = '@request.auth.role = "admin"'
RULES = {
    # Photos always carry their uploader, so owners keep access to every photo.
    "photos": f"user = @request.auth.id || project.user = @request.auth.id || project.is_public = true || {ADMIN}",
    "project_paints": f"project.user = @request.auth.id || project.is_public = true || {ADMIN}",
}
fix = "--fix-rules" in sys.argv
for name, rule in RULES.items():
    col = call("GET", f"/collections/{name}", token=token)
    current = {k: col.get(k) for k in ("listRule", "viewRule")}
    if all(v == rule for v in current.values()):
        print(f"{name}: OK (public projects readable, private ones owner-only)")
        continue
    if current["listRule"] == "":
        problem = "open to everyone, including photos/paints of PRIVATE projects"
    elif current["listRule"] is None:
        problem = "admin-only, so visitors can't see public projects' photos/paints"
    else:
        problem = f"custom rule {current['listRule']!r}"
    if fix:
        call("PATCH", f"/collections/{name}", {"listRule": rule, "viewRule": rule}, token=token)
        print(f"{name}: was {problem} -> rules updated")
    else:
        print(f"{name}: {problem}. Re-run with --fix-rules to apply the recommended rule.")

# 3. Notes -> project journal: optional link from a note to a project.
#    Deleting a project keeps its notes (they just become unlinked).
try:
    diary = call("GET", "/collections/diary_entries", token=token)
except SystemExit:
    diary = None
if diary is None:
    print("diary_entries: collection not found, skipping journal link")
elif any(f["name"] == "project" for f in diary["fields"]):
    print("diary_entries already has the project link")
else:
    link = {"name": "project", "type": "relation", "collectionId": projects["id"],
            "maxSelect": 1, "cascadeDelete": False, "required": False}
    call("PATCH", "/collections/diary_entries", {"fields": diary["fields"] + [link]}, token=token)
    print("Added to diary_entries: project (notes can now form a project journal)")

# 4. Collections ("boards" of saved projects).
OWNER = "user = @request.auth.id"
existing_names = {c["name"] for c in call("GET", "/collections?perPage=500", token=token)["items"]}
autodates = [
    {"name": "created", "type": "autodate", "onCreate": True, "onUpdate": False},
    {"name": "updated", "type": "autodate", "onCreate": True, "onUpdate": True},
]
if "project_collections" in existing_names:
    print("project_collections already exists")
    boards = call("GET", "/collections/project_collections", token=token)
else:
    boards = call("POST", "/collections", {
        "name": "project_collections",
        "type": "base",
        "fields": [
            {"name": "user", "type": "relation", "collectionId": "_pb_users_auth_", "maxSelect": 1, "required": True, "cascadeDelete": True},
            {"name": "name", "type": "text", "required": True, "max": 60},
            {"name": "description", "type": "text", "max": 300},
            {"name": "is_public", "type": "bool"},
        ] + autodates,
        "listRule": f"is_public = true || {OWNER}",
        "viewRule": f"is_public = true || {OWNER}",
        "createRule": OWNER,
        # Owners can edit, but never hand a board to someone else.
        "updateRule": f"{OWNER} && (@request.body.user:isset = false || @request.body.user = @request.auth.id)",
        "deleteRule": OWNER,
    }, token=token)
    print("Created project_collections")

if "project_collection_items" in existing_names:
    print("project_collection_items already exists")
else:
    call("POST", "/collections", {
        "name": "project_collection_items",
        "type": "base",
        "fields": [
            {"name": "collection", "type": "relation", "collectionId": boards["id"], "maxSelect": 1, "required": True, "cascadeDelete": True},
            {"name": "project", "type": "relation", "collectionId": projects["id"], "maxSelect": 1, "required": True, "cascadeDelete": True},
        ] + autodates,
        "indexes": ["CREATE UNIQUE INDEX idx_collection_project ON project_collection_items (collection, project)"],
        "listRule": "collection.is_public = true || collection.user = @request.auth.id",
        "viewRule": "collection.is_public = true || collection.user = @request.auth.id",
        "createRule": "collection.user = @request.auth.id",
        "deleteRule": "collection.user = @request.auth.id",
    }, token=token)
    print("Created project_collection_items")
