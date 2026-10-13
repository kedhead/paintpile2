"""
Add the project "showcase details" fields (kind, source, style, techniques,
color_scheme) to an existing PocketBase, and check that public project pages
can read photos and paints.

Safe to re-run: existing fields are left alone.

Usage:
  PB_URL=https://your-pocketbase PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... \
    python3 pocketbase/add_showcase_fields.py [--fix-rules]

--fix-rules also sets the list/view rules on `photos` and `project_paints` so
anyone can read them for public projects (owners can always read their own).
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

# 2. Public read access for the pieces of a project page
PUBLIC_RULE = "project.is_public = true || project.user = @request.auth.id"
fix = "--fix-rules" in sys.argv
for name in ["photos", "project_paints"]:
    col = call("GET", f"/collections/{name}", token=token)
    rules = {k: col.get(k) for k in ("listRule", "viewRule")}
    ok = all(r == "" or (r is not None and "is_public" in r) for r in rules.values())
    if ok:
        print(f"{name}: public projects are readable ({rules['listRule']!r})")
    elif fix:
        call("PATCH", f"/collections/{name}", {"listRule": PUBLIC_RULE, "viewRule": PUBLIC_RULE}, token=token)
        print(f"{name}: rules updated to {PUBLIC_RULE!r}")
    else:
        print(f"{name}: visitors can't read this yet (listRule={rules['listRule']!r}). Re-run with --fix-rules.")
