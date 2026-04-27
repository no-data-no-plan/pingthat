#!/bin/bash
# Honest per-URL sitemap <lastmod> bump.
# Delegates to ~/scripts/sitemap-lastmod-honest.sh which uses git history per source file
# (page + shared layout/i18n/header/footer) — no lying to Google about freshness.
exec bash "$HOME/scripts/sitemap-lastmod-honest.sh" "$(cd "$(dirname "$0")/.." && pwd)" --apply
