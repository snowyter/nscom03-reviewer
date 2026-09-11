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
idx = root / "index.html"
html = idx.read_text()
def stamp(m):
    attr, path = m.group(1), m.group(2)
    f = root / path
    if not f.exists():
        return m.group(0)
    h = hashlib.sha256(f.read_bytes()).hexdigest()[:8]
    return f'{attr}="{path}?v={h}"'
new, n = re.subn(r'(src|href)="((?:js|css)/[^"?]+)"', stamp, html)
if new != html:
    idx.write_text(new)
print(f"  stamped {n} asset urls")
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
