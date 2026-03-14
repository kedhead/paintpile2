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
        print("  ERROR: " + err[:400])
        return None

USERS = "_pb_users_auth_"

# Helper to build flat field dicts for PB v0.25
def text(name, required=False, max_len=0):
    f = {"name": name, "type": "text", "required": required}
    if max_len: f["max"] = max_len
    return f

def number(name, required=False):
    return {"name": name, "type": "number", "required": required}

def bool_field(name):
    return {"name": name, "type": "bool", "required": False}

def relation(name, collection_id, required=True, cascade=True, max_select=1):
    return {"name": name, "type": "relation", "required": required, "collectionId": collection_id, "cascadeDelete": cascade, "maxSelect": max_select}

def select(name, values, required=True):
    return {"name": name, "type": "select", "required": required, "values": values}

def json_field(name):
    return {"name": name, "type": "json", "required": False}

def date_field(name):
    return {"name": name, "type": "date", "required": False}

def file_field(name, max_select=1, max_size=10485760):
    return {"name": name, "type": "file", "required": False, "maxSelect": max_select, "maxSize": max_size}

def url_field(name):
    return {"name": name, "type": "url", "required": False}

def autodate(name, on_create=True, on_update=True):
    return {"name": name, "type": "autodate", "required": False, "onCreate": on_create, "onUpdate": on_update}

def create_col(name, fields, rules):
    body = {"name": name, "type": "base", "fields": fields}
    body.update(rules)
    result = api("POST", "/collections", body)
    if result:
        print("Created: " + name)
        return result["id"]
    else:
        print("FAILED: " + name)
        return None

# Delete old channels + messages collections (replaced by groups system)
for old_col in ["messages", "channels"]:
    existing = api("GET", f"/collections/{old_col}")
    if existing:
        api("DELETE", f"/collections/{existing['id']}")
        print(f"Deleted old collection: {old_col}")

# Create collections
PUBLIC = {"listRule": "", "viewRule": ""}
AUTH_ONLY = {"listRule": "@request.auth.id != ''", "viewRule": "@request.auth.id != ''"}
OWNER_ONLY = lambda: {"listRule": "@request.auth.id = user", "viewRule": "@request.auth.id = user"}

# paints (admin-only write, public read)
create_col("paints", [
    text("brand", required=True),
    text("name", required=True),
    text("hex_color", required=True),
    select("type", ["base", "layer", "shade", "metallic", "technical", "contrast"]),
    text("category"),
], PUBLIC)

# Get paints ID
paints_col = api("GET", "/collections/paints")
PAINTS = paints_col["id"] if paints_col else "paints"

# user_stats
create_col("user_stats", [
    relation("user", USERS),
    number("project_count"), number("photo_count"), number("pile_count"),
    number("paint_count"), number("follower_count"), number("following_count"),
    number("army_count"), number("likes_received"), number("recipes_created"),
    number("badge_count"), number("comment_count"), number("post_count"),
], {"listRule": "", "viewRule": "", "createRule": "@request.auth.id != ''", "updateRule": "@request.auth.id = user"})

# follows
create_col("follows", [
    relation("follower", USERS),
    relation("following", USERS),
], {"listRule": "", "viewRule": "", "createRule": "@request.auth.id = follower && follower != following", "deleteRule": "@request.auth.id = follower"})

# posts
create_col("posts", [
    relation("user", USERS),
    text("content", required=True),
    json_field("tags"),
    file_field("images", max_select=10),
    number("like_count"), number("comment_count"),
    bool_field("is_public"),
], {"listRule": "is_public = true || user = @request.auth.id", "viewRule": "is_public = true || user = @request.auth.id", "createRule": "@request.auth.id = user", "updateRule": "@request.auth.id = user", "deleteRule": "@request.auth.id = user"})

# armies
create_col("armies", [
    relation("user", USERS),
    text("name", required=True),
    text("description"),
    text("faction"),
    json_field("tags"),
    file_field("cover_photo"),
    bool_field("is_public"),
    number("like_count"), number("comment_count"),
], {"listRule": "is_public = true || user = @request.auth.id", "viewRule": "is_public = true || user = @request.auth.id", "createRule": "@request.auth.id = user", "updateRule": "@request.auth.id = user", "deleteRule": "@request.auth.id = user"})

# projects
create_col("projects", [
    relation("user", USERS),
    text("name", required=True),
    text("description"),
    select("status", ["not-started", "in-progress", "completed"]),
    number("quantity"),
    json_field("tags"),
    date_field("start_date"),
    bool_field("is_public"),
    number("photo_count"), number("paint_count"),
    file_field("cover_photo"),
    number("like_count"), number("comment_count"),
    json_field("last_critique"),
], {"listRule": "is_public = true || user = @request.auth.id", "viewRule": "is_public = true || user = @request.auth.id", "createRule": "@request.auth.id = user", "updateRule": "@request.auth.id = user", "deleteRule": "@request.auth.id = user"})

# likes
create_col("likes", [
    relation("user", USERS),
    text("target_id", required=True),
    select("target_type", ["post", "project", "army", "recipe", "message"]),
], {"listRule": "", "viewRule": "", "createRule": "@request.auth.id = user", "deleteRule": "@request.auth.id = user"})

# comments
create_col("comments", [
    relation("user", USERS),
    text("target_id", required=True),
    select("target_type", ["post", "project", "army", "recipe"]),
    text("content", required=True),
    bool_field("edited"),
], {"listRule": "", "viewRule": "", "createRule": "@request.auth.id = user", "updateRule": "@request.auth.id = user", "deleteRule": "@request.auth.id = user"})

# notifications
create_col("notifications", [
    relation("user", USERS),
    select("type", ["follow", "like", "comment", "comment_reply", "mention", "badge_earned", "new_post", "news", "message", "system"]),
    relation("actor", USERS),
    text("target_id", required=True),
    text("target_type", required=True),
    text("message", required=True),
    bool_field("read"),
    url_field("action_url"),
], {"listRule": "@request.auth.id = user", "viewRule": "@request.auth.id = user", "createRule": "@request.auth.id != ''", "updateRule": "@request.auth.id = user", "deleteRule": "@request.auth.id = user"})

# --- Groups System ---

# groups
GROUPS = create_col("groups", [
    text("name", required=True, max_len=100),
    text("description", max_len=500),
    file_field("icon"),
    file_field("banner"),
    relation("owner", USERS),
    number("member_count"),
    bool_field("is_public"),
    text("invite_code"),
    autodate("created", on_create=True, on_update=False),
    autodate("updated"),
], {"listRule": "", "viewRule": "", "createRule": "@request.auth.id != ''", "updateRule": "@request.auth.id = owner", "deleteRule": "@request.auth.id = owner"})

# group_members
create_col("group_members", [
    relation("group", GROUPS),
    relation("user", USERS),
    select("role", ["admin", "moderator", "member"]),
    autodate("created", on_create=True, on_update=False),
    autodate("updated"),
], {"listRule": "@request.auth.id != ''", "viewRule": "@request.auth.id != ''", "createRule": "@request.auth.id = user", "updateRule": "@request.auth.id != ''", "deleteRule": "@request.auth.id = user || @request.auth.id != ''"})

# group_invites
create_col("group_invites", [
    relation("group", GROUPS),
    relation("created_by", USERS),
    text("code", required=True),
    number("max_uses"),
    number("use_count"),
    date_field("expires_at"),
    autodate("created", on_create=True, on_update=False),
    autodate("updated"),
], {"listRule": "@request.auth.id != ''", "viewRule": "", "createRule": "@request.auth.id != ''", "deleteRule": "@request.auth.id = created_by || @request.auth.id != ''"})

# group_channels
GROUP_CHANNELS = create_col("group_channels", [
    relation("group", GROUPS),
    text("name", required=True, max_len=100),
    select("type", ["text", "voice"]),
    text("description", max_len=500),
    number("sort_order"),
    text("category", max_len=100),
    autodate("created", on_create=True, on_update=False),
    autodate("updated"),
], {"listRule": "@request.auth.id != ''", "viewRule": "@request.auth.id != ''", "createRule": "@request.auth.id != ''", "updateRule": "@request.auth.id != ''", "deleteRule": "@request.auth.id != ''"})

# group_messages
create_col("group_messages", [
    relation("channel", GROUP_CHANNELS),
    relation("user", USERS),
    text("content", required=True),
    file_field("image"),
    bool_field("edited"),
    autodate("created", on_create=True, on_update=False),
    autodate("updated"),
], {"listRule": "@request.auth.id != ''", "viewRule": "@request.auth.id != ''", "createRule": "@request.auth.id = user", "updateRule": "@request.auth.id = user", "deleteRule": "@request.auth.id = user || @request.auth.id != ''"})

# user_paints
create_col("user_paints", [
    relation("user", USERS),
    relation("paint", PAINTS, cascade=False),
    number("quantity"),
    text("notes"),
], {"listRule": "@request.auth.id = user", "viewRule": "@request.auth.id = user", "createRule": "@request.auth.id = user", "updateRule": "@request.auth.id = user", "deleteRule": "@request.auth.id = user"})

# ai_usage
create_col("ai_usage", [
    relation("user", USERS),
    text("operation", required=True),
    number("credits_used", required=True),
    text("month_key", required=True),
], {"listRule": "@request.auth.id = user", "viewRule": "@request.auth.id = user", "createRule": "@request.auth.id = user"})

# ai_quota
create_col("ai_quota", [
    relation("user", USERS),
    number("monthly_limit"),
    number("credits_used"),
    text("month_key", required=True),
], {"listRule": "@request.auth.id = user", "viewRule": "@request.auth.id = user", "createRule": "@request.auth.id = user", "updateRule": "@request.auth.id = user"})

print("\nSetup complete!")
