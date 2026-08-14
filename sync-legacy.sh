#!/usr/bin/env bash
#
# Mirror the site from this repo (squirmular.io) into the legacy repo (swarmular.io).
#
# ── RETIRED 2026-08-14 (Jay) ──────────────────────────────────────────────────
# swarmular.io is now a standalone dark COMING SOON holding page (commit
# 137512e in mang0jam/swarmular.io) and must NOT mirror this site — the mirror
# carried a PLAY button pointing at play.squirmular.io. Delete the guard below
# only if Swarmular relaunches as a mirror of this page.
echo "sync-legacy is RETIRED: swarmular.io is a standalone COMING SOON page (2026-08-14)." >&2
echo "It must not mirror the squirmular.io site. See the header of this script." >&2
exit 1
# ──────────────────────────────────────────────────────────────────────────────
#
# The two sites share one codebase. The ONLY file that differs is CNAME, which
# pins each repo to its own domain — so this script deliberately never touches it.
# Branding is not duplicated either: index.html picks SWARMULAR vs SQUIRMULAR at
# runtime from location.hostname.
#
# Usage:  ./sync-legacy.sh        (or: npm run sync:legacy)
#
set -euo pipefail

LEGACY_REMOTE="git@github-mangojam:mang0jam/swarmular.io.git"

# Everything that makes up the site. CNAME is intentionally absent.
SHARED=(index.html app.js favicon.svg package.json package-lock.json obfuscator.config.json .gitignore src)

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

git clone --quiet --depth 1 "$LEGACY_REMOTE" "$tmp/legacy"

for f in "${SHARED[@]}"; do
  [ -e "$root/$f" ] || { echo "missing in source repo: $f" >&2; exit 1; }
  rm -rf "${tmp:?}/legacy/$f"
  cp -R "$root/$f" "$tmp/legacy/$f"
done

cd "$tmp/legacy"

if [ -z "$(git status --porcelain)" ]; then
  echo "legacy swarmular.io already in sync — nothing to push"
  exit 0
fi

echo "changes to mirror:"
git status --porcelain

git add -A
git commit -q -m "sync: mirror site from squirmular.io (CNAME untouched)"
git push -q origin HEAD:master

echo "legacy swarmular.io updated -> $(git rev-parse --short HEAD)"
