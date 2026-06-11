#!/usr/bin/env bash
# sitemap-lastmod-honest.sh
#
# Per-URL honest <lastmod> bump for the 5 Astro web apps (CV/AY/JC/OI/PT).
# OpenPDF has its own simpler bumper (the prerender HTMLs are tracked directly).
#
# For every <loc> in public/sitemap.xml, derive the most-likely source file under
# src/pages/ or src/content/docs/, take its git-history last-commit date, and
# combine it with the max mtime of shared files (layout + i18n + global components)
# that affect every rendered page. Resulting date is the page's true freshness ceiling
# from the user's git history — no lying to Google.
#
# Modes:
#   bash sitemap-lastmod-honest.sh /path/to/repo --check   (default; prints summary, no writes)
#   bash sitemap-lastmod-honest.sh /path/to/repo --apply   (writes public/sitemap.xml)
#
# Exit codes: 0 ok, 2 input error, 3 mapping coverage < 80%.

set -uo pipefail

REPO="${1:?usage: sitemap-lastmod-honest.sh <repo> [--check|--apply]}"
MODE="${2:---check}"
# -e (not -d): in a linked worktree .git is a FILE pointing at the main repo.
git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "FATAL: $REPO is not a git repo" >&2; exit 2; }
cd "$REPO"

SITEMAP="public/sitemap.xml"
[ -f "$SITEMAP" ] || { echo "FATAL: $SITEMAP not found in $REPO" >&2; exit 2; }

DOMAIN="$(awk 'match($0, /https:\/\/[a-z0-9.-]+/) { print substr($0, RSTART+8, RLENGTH-8); exit }' "$SITEMAP")"
[ -n "$DOMAIN" ] || { echo "FATAL: could not derive domain from sitemap" >&2; exit 2; }

# Compute shared-file ceiling (layouts + i18n + Header/Footer/Cookie/Nav components).
# These touch every rendered page, so any change here legitimately bumps every URL.
shared_dirs=(src/layouts src/i18n)
shared_globs=(
  'src/components/Header.astro' 'src/components/Header.svelte'
  'src/components/Footer.astro' 'src/components/Footer.svelte'
  'src/components/CookieConsent.astro' 'src/components/CookieConsent.svelte'
  'src/components/LangToggle.astro' 'src/components/LangToggle.svelte'
  'src/components/AdGate.astro' 'src/components/AdSlot.astro'
  # SPA-style apps (OpenPDF) — when the SPA shell or root template changes,
  # every route's output changes too. Including these as shared signals keeps
  # SPA pages bumping honestly instead of stalling.
  'index.html'
  'src/App.svelte' 'src/App.tsx' 'src/App.jsx' 'src/App.vue'
  'src/main.ts' 'src/main.js' 'src/main.tsx'
)

shared_files=()
for d in "${shared_dirs[@]}"; do
  [ -d "$d" ] && while IFS= read -r f; do shared_files+=("$f"); done < <(find "$d" -type f \( -name '*.astro' -o -name '*.svelte' -o -name '*.ts' -o -name '*.json' \))
done
for g in "${shared_globs[@]}"; do [ -f "$g" ] && shared_files+=("$g"); done

# Honest commit detector (Mueller 2024 rule):
# A commit is "content-affecting" for this file if its diff to the file
# contains at least one ADDED OR REMOVED line that is NOT pure whitespace,
# NOT a single-line comment, and NOT a CSS-only / Tailwind-class-only line.
# Returns the most recent content-affecting commit date (depth ≤ 12).
last_content_commit_date() {
  local f="$1" sha date
  local depth=0
  while IFS=$'\t' read -r sha date; do
    [ -z "$sha" ] && break
    depth=$((depth+1))
    [ "$depth" -gt 12 ] && { echo "$date"; return; }
    # The diff for this file at this commit (unified=0 = no context).
    # 2026-05-20 fix: `git show` requires the commit BEFORE `--`, otherwise
    # $sha is parsed as a pathspec and the diff comes back empty — making
    # the substantive check a no-op. The loop then walked 12 commits and
    # returned the 13th-back date, systematically undercounting shared_max
    # for any file with >12 commits (e.g. index.html in OpenPDF).
    diff_out=$(git show "$sha" --format= --unified=0 -- "$f" 2>/dev/null \
      | grep -E '^[-+]' | grep -vE '^(---|\+\+\+)')
    [ -z "$diff_out" ] && continue
    # Substantive = at least one +/- line that is NOT:
    #   - blank,
    #   - pure comment (//, #, <!--, /* */, *)
    #   - pure CSS property line (token: value;)
    #   - line containing only a class="..." attribute change
    # 2026-05-20 regex tightening (review found false-negatives that hid
    # real content changes):
    #   - COMMENT: bare `\*` arm dropped — was matching `* x = y * 2;` and
    #     CSS universal selectors / mdx list items as comments. JSDoc
    #     continuation lines now count as substantive (false positive that
    #     bumps dates — conservative direction, no lying to Google).
    #   - CSS_PROP: leading `--` made mandatory (was `--?`). Was matching
    #     JSON-LD keys (`"dateModified": …`), YAML front matter, TS object
    #     properties — silently skipping SEO-relevant commits. Now only
    #     CSS custom properties (`--var: value;`) are filtered.
    #   - stderr no longer suppressed: a Python crash here surfaces in the
    #     build log instead of silently returning 0 (which would mask the
    #     classifier breakage and fall back to git-log-1).
    substantive=$(printf '%s\n' "$diff_out" | python3 -c '
import sys, re
COMMENT = re.compile(r"^[-+]\s*(//|#|<!--|-->|/\*|\*/).*$")
BLANK   = re.compile(r"^[-+]\s*$")
CSS_PROP = re.compile(r"^[-+]\s*--[a-zA-Z][\w-]*\s*:[^{}]+;?\s*$")
CLASS_ONLY = re.compile(r"^[-+]\s*class(Name)?=\s*[\x22\x27][^\x22\x27]*[\x22\x27]\s*/?>?\s*$")
TAILWIND_BARE = re.compile(r"^[-+]\s*(class:|@apply|@tailwind)[^;]*;?\s*$")
hits = 0
for line in sys.stdin:
    line = line.rstrip("\n")
    if BLANK.match(line) or COMMENT.match(line): continue
    if CSS_PROP.match(line) or CLASS_ONLY.match(line) or TAILWIND_BARE.match(line): continue
    hits += 1
print(hits)
' || echo 0)
    if [ "${substantive:-0}" -gt 0 ]; then
      echo "$date"
      return
    fi
  done < <(git log --format='%H%x09%cs' -- "$f" 2>/dev/null)
  # No substantive commit found in window — fall back to latest commit date.
  git log -1 --format=%cs -- "$f" 2>/dev/null || echo ""
}

shared_max=""
for f in "${shared_files[@]}"; do
  d=$(last_content_commit_date "$f")
  [ -n "$d" ] && [[ "$d" > "${shared_max:-0000-00-00}" ]] && shared_max="$d"
done
[ -z "$shared_max" ] && shared_max="$(date +%Y-%m-%d)"

# Map URL path to candidate source files. Returns 0 with files on stdout (newline-separated)
# in priority order. The first existing file's git mtime wins.
url_to_files() {
  local path="$1" p
  p="${path#https://${DOMAIN}}"
  p="${p%/}"; p="${p#/}"

  # Root
  if [ -z "$p" ]; then
    printf '%s\n' \
      "src/pages/index.astro" "src/pages/index.md" "src/pages/index.mdx" \
      "index.html" "public/index.html"
    return
  fi
  # ES root
  if [ "$p" = "es" ]; then
    printf '%s\n' \
      "src/pages/es/index.astro" "src/pages/es.astro" \
      "public/es/index.html"
    return
  fi

  local lang_prefix="" rest="$p"
  if [[ "$p" == es/* ]]; then
    lang_prefix="es/"
    rest="${p#es/}"
  fi

  # Docs collection (content/docs)
  if [[ "$rest" == docs/* ]]; then
    local slug="${rest#docs/}"
    slug="${slug%/}"
    local lang_short="${lang_prefix%/}"
    [ -z "$lang_short" ] && lang_short="en"
    printf '%s\n' \
      "src/content/docs/${lang_short}/${slug}.md" \
      "src/content/docs/${lang_short}/${slug}.mdx" \
      "src/content/docs/${lang_short}/${slug}/index.md" \
      "src/content/docs/${lang_short}/${slug}/index.mdx" \
      "src/pages/${lang_prefix}docs/[slug].astro" \
      "src/pages/${lang_prefix}docs/[...slug].astro" \
      "src/pages/${lang_prefix}docs/index.astro"
    return
  fi
  # Page (with or without subfolders)
  printf '%s\n' \
    "src/pages/${lang_prefix}${rest}.astro" \
    "src/pages/${lang_prefix}${rest}.svelte" \
    "src/pages/${lang_prefix}${rest}.md" \
    "src/pages/${lang_prefix}${rest}.mdx" \
    "src/pages/${lang_prefix}${rest}/index.astro" \
    "public/${lang_prefix}${rest}/index.html" \
    "public/${lang_prefix}${rest}.html"
}

# Extract all <loc> URLs and current <lastmod> values from sitemap.
mapfile -t urls < <(grep -oE '<loc>[^<]+' "$SITEMAP" | sed 's|<loc>||')
total=${#urls[@]}

# Pre-build URL→old-lastmod map by parsing the sitemap linearly.
declare -A old_lastmod
current_url=""
while IFS= read -r line; do
  if [[ "$line" =~ \<loc\>([^\<]+)\</loc\> ]]; then
    current_url="${BASH_REMATCH[1]}"
  elif [[ "$line" =~ \<lastmod\>([0-9-]+)\</lastmod\> ]] && [ -n "$current_url" ]; then
    old_lastmod[$current_url]="${BASH_REMATCH[1]}"
    current_url=""
  fi
done < "$SITEMAP"

# Per-URL processing.
declare -A new_lastmod
mapped=0; unmapped=0; bumped=0; unchanged=0; ahead_kept=0; ahead_lowered=0
unmapped_urls=()

for url in "${urls[@]}"; do
  src=""
  while IFS= read -r cand; do
    [ -f "$cand" ] && { src="$cand"; break; }
  done < <(url_to_files "$url")

  if [ -z "$src" ]; then
    # Fallback: bump only to shared ceiling. Honest because we can't prove a per-page change,
    # but we know shared files affecting all pages have changed by shared_max date.
    unmapped=$((unmapped+1))
    unmapped_urls+=("$url")
    file_date=""
  else
    mapped=$((mapped+1))
    file_date=$(last_content_commit_date "$src")
  fi

  # Effective date = max(file_date, shared_max). Shared changes legitimately
  # bump every page since they affect rendered HTML.
  effective="$shared_max"
  [ -n "$file_date" ] && [[ "$file_date" > "$effective" ]] && effective="$file_date"

  old="${old_lastmod[$url]:-0000-00-00}"
  if [[ "$effective" > "$old" ]]; then
    new_lastmod[$url]="$effective"
    bumped=$((bumped+1))
  elif [[ "$effective" < "$old" ]]; then
    # Old lastmod is AHEAD of any honest signal — that's a lie (someone
    # bumped it artificially). Default behaviour: lower it to the honest
    # value. Set HONEST_KEEP_AHEAD=1 to preserve the old (dishonest) value
    # — only useful when migrating a fresh deploy where you don't yet
    # trust the git history.
    if [ "${HONEST_KEEP_AHEAD:-0}" = "1" ]; then
      new_lastmod[$url]="$old"
      ahead_kept=$((${ahead_kept:-0}+1))
    else
      new_lastmod[$url]="$effective"
      ahead_lowered=$((${ahead_lowered:-0}+1))
    fi
  else
    new_lastmod[$url]="$old"
    unchanged=$((unchanged+1))
  fi
done

# Shallow-clone detection — if git history is truncated, all dates derived
# from `git log` are unreliable. Warn loudly + refuse --apply unless the
# user opts in via HONEST_KEEP_AHEAD=1 (which preserves existing dates).
commit_count=$(git rev-list --count HEAD 2>/dev/null || echo 0)
if [ "$commit_count" -lt 50 ]; then
  echo "WARN: shallow clone detected ($commit_count commits in HEAD)." >&2
  echo "      Git-derived dates are unreliable; set HONEST_KEEP_AHEAD=1 to" >&2
  echo "      preserve existing sitemap dates instead of regressing them." >&2
fi

# Summary report.
coverage_pct=$(( total ? mapped * 100 / total : 0 ))
echo "── sitemap-lastmod-honest @ $REPO ($DOMAIN) ──"
echo "total URLs:              $total"
echo "mapped to source:        $mapped ($coverage_pct%)"
echo "unmapped (shared only):  $unmapped"
echo "shared-file ceiling:     $shared_max"
echo "bumped:                  $bumped"
echo "unchanged:               $unchanged"
echo "ahead-of-signal lowered: ${ahead_lowered:-0}  (set HONEST_KEEP_AHEAD=1 to preserve)"
echo "ahead-of-signal kept:    ${ahead_kept:-0}"
[ "$unmapped" -gt 0 ] && [ "$MODE" = "--check" ] && {
  echo
  echo "Unmapped URLs (sample 10):"
  printf '  %s\n' "${unmapped_urls[@]:0:10}"
}

MIN_COVERAGE_PCT="${MIN_COVERAGE_PCT:-80}"
if [ "$MODE" = "--apply" ]; then
  if [ "$coverage_pct" -lt "$MIN_COVERAGE_PCT" ]; then
    echo "REFUSING to apply: mapping coverage $coverage_pct% < $MIN_COVERAGE_PCT%. Inspect unmapped list (override with MIN_COVERAGE_PCT=NN)." >&2
    exit 3
  fi
  mapping_file="$(mktemp -t sitemap-mapping.XXXXXX.tsv)"
  trap 'rm -f "$mapping_file"' EXIT
  for u in "${!new_lastmod[@]}"; do
    printf '%s\t%s\n' "$u" "${new_lastmod[$u]}" >> "$mapping_file"
  done
  MAPPING_FILE="$mapping_file" python3 - <<'PY'
import os, re
mapping = {}
with open(os.environ["MAPPING_FILE"]) as f:
    for line in f:
        line = line.rstrip("\n")
        if not line: continue
        url, date = line.split("\t", 1)
        mapping[url] = date

sitemap_path = "public/sitemap.xml"
with open(sitemap_path) as f:
    src = f.read()

def repl(block_match):
    block = block_match.group(0)
    loc_m = re.search(r"<loc>([^<]+)</loc>", block)
    if not loc_m or loc_m.group(1) not in mapping:
        return block
    new_date = mapping[loc_m.group(1)]
    if re.search(r"<lastmod>[^<]+</lastmod>", block):
        block = re.sub(r"<lastmod>[^<]+</lastmod>",
                       f"<lastmod>{new_date}</lastmod>", block)
    else:
        block = re.sub(r"(\s*)</url>",
                       r"\1  <lastmod>" + new_date + r"</lastmod>\1</url>",
                       block, count=1)
    return block

new_src = re.sub(r"<url>.*?</url>", repl, src, flags=re.DOTALL)
with open(sitemap_path, "w") as f:
    f.write(new_src)
print("sitemap.xml written.")
PY
fi

echo
echo "Distribution of new lastmod values:"
for u in "${urls[@]}"; do echo "${new_lastmod[$u]}"; done | sort | uniq -c | sort -rn | head -10
