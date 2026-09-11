#!/usr/bin/env bash
# Deploy the NSCOM03 reviewer to GitHub Pages.
# Idempotent: safe to re-run if the repo already exists.
set -euo pipefail

REPO="nscom03-reviewer"
OWNER="snowyter"
cd "$(dirname "$0")/.."

echo "==> preflight"
[ -f index.html ] || { echo "index.html missing"; exit 1; }
[ -f .nojekyll ] || touch .nojekyll
node --test test/ 2>&1 | tail -3
echo

echo "==> stamp asset versions"
# GitHub Pages serves assets with cache-control: max-age=600, so a browser can
# keep running an old script for ten minutes after a deploy — a hard refresh does
# not always defeat it. Stamping every local js/css URL with a content hash makes
# each edit a NEW url, so clients re-fetch immediately and never run stale code.
python3 - <<'PY'
import hashlib, pathlib, re
root = pathlib.Path(".")
css  = root / "css"

# Stamp the @import urls inside app.css first: app.css pulls in base/lesson/drill,
# so if only app.css itself were hashed, editing base.css would leave app.css's
# hash unchanged and browsers would keep serving the stale imports.
app = css / "app.css"
if app.exists():
    src = app.read_text()
    def stamp_import(m):
        fname = m.group(1)
        f = css / fname
        if not f.exists():
            return m.group(0)
        h = hashlib.sha256(f.read_bytes()).hexdigest()[:8]
        return f'@import url("{fname}?v={h}");'
    app.write_text(re.sub(r'@import url\("([a-z-]+\.css)"\);', stamp_import, src))

# Then stamp every local js/css url in index.html. app.css gets a hash over the
# whole CSS graph so a change in any imported sheet invalidates it.
idx = root / "index.html"
html = idx.read_text()
graph = ["app.css", "base.css", "lesson.css", "drill.css"]
h_all = hashlib.sha256(b"".join(
    (css / n).read_bytes() for n in graph if (css / n).exists())).hexdigest()[:8]

def stamp(m):
    attr, path = m.group(1), m.group(2)
    if path == "css/app.css":
        return f'{attr}="{path}?v={h_all}"'
    f = root / path
    if not f.exists():
        return m.group(0)
    h = hashlib.sha256(f.read_bytes()).hexdigest()[:8]
    return f'{attr}="{path}?v={h}"'

new, n = re.subn(r'(src|href)="((?:js|css)/[^"?]+)"', stamp, html)
if new != html:
    idx.write_text(new)
print(f"  stamped {n} asset urls (css graph hash {h_all})")
PY
echo

echo "==> working tree"
if [ -n "$(git status --porcelain)" ]; then
  echo "uncommitted changes present; commit them first"; exit 1
fi
git log --oneline | head -1
echo

echo "==> remote"
if git remote get-url origin >/dev/null 2>&1; then
  echo "origin already set: $(git remote get-url origin)"
else
  gh repo create "$OWNER/$REPO" --public --source=. --remote=origin \
    --description "Interactive NSCOM03 Data Communications study reviewer" --push
fi

echo "==> push"
git push -u origin main

echo "==> enable Pages"
gh api "repos/$OWNER/$REPO/pages" >/dev/null 2>&1 \
  && echo "Pages already configured" \
  || gh api "repos/$OWNER/$REPO/pages" -X POST \
       -f "source[branch]=main" -f "source[path]=/" >/dev/null

echo "==> wait for the build"
for i in $(seq 1 40); do
  status=$(gh api "repos/$OWNER/$REPO/pages" --jq .status 2>/dev/null || echo "pending")
  echo "  [$i] $status"
  [ "$status" = "built" ] && break
  sleep 6
done

URL="https://$OWNER.github.io/$REPO/"
echo
echo "==> live URL: $URL"
curl -s -o /dev/null -w "  index.html  HTTP %{http_code}\n" "$URL"
curl -s -o /dev/null -w "  figs.json   HTTP %{http_code}\n" "$URL/figs.json"
curl -s -o /dev/null -w "  css         HTTP %{http_code}\n" "$URL/css/app.css"
