#!/bin/bash
# Honest per-URL sitemap <lastmod> bump — uses git history per source file
# (page + shared layout/i18n/header/footer); no lying to Google about freshness.
# Prefers the vendored copy in scripts/lib/ so fresh clones build without this
# box (adoption fix 2026-06-11); falls back to the shared ~/scripts copy,
# which stays canonical — if you edit it, re-vendor into the 6 repos.
# Needs full git history: shallow clones / ZIP exports degrade or fail it.
HERE="$(cd "$(dirname "$0")" && pwd)"
HONEST="$HERE/lib/sitemap-lastmod-honest.sh"
[ -f "$HONEST" ] || HONEST="$HOME/scripts/sitemap-lastmod-honest.sh"
exec bash "$HONEST" "$(cd "$HERE/.." && pwd)" --apply
