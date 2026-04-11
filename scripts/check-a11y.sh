#!/bin/bash
# a11y pre-commit regression guards
# Prevents re-introduction of bugs fixed in the M1.2 sweep (2026-04-12).
# Run locally via git hook; also safe to run manually: bash scripts/check-a11y.sh
set -u

FAIL=0
RED=$'\033[0;31m'
YELLOW=$'\033[0;33m'
GREEN=$'\033[0;32m'
NC=$'\033[0m'

fail() {
  echo "${RED}[a11y] $1${NC}"
  FAIL=1
}

# Rule 1: <a> tags with hover:underline and no default underline.
# WCAG 1.4.1 "Use of Color" — links in text must be distinguishable by
# more than color alone. axe's link-in-text-block rule only fires on
# <a>; buttons with hover:underline are a visual style choice, not a
# WCAG failure, so this rule is scoped to <a ...hover:underline...>.
if [ -d src ]; then
  hits=$(grep -rnE '<a\b[^>]*\bhover:underline\b[^>]*>' src/ 2>/dev/null | grep -vE '\bunderline\s' || true)
  if [ -n "$hits" ]; then
    fail "Rule 1 FAIL: <a> with hover:underline but no default underline (WCAG 1.4.1)."
    echo "$hits" | head -5
    echo "  Fix: replace 'hover:underline' with 'underline'."
    echo
  fi
fi

# Rule 2: sync-xhr in Permissions-Policy (deprecated, removed from spec)
if [ -d functions ]; then
  hits=$(grep -rnE 'sync-xhr' functions/ 2>/dev/null || true)
  if [ -n "$hits" ]; then
    fail "Rule 2 FAIL: sync-xhr present in Permissions-Policy (deprecated)."
    echo "$hits" | head -5
    echo "  Fix: remove 'sync-xhr' from the Permissions-Policy directive."
    echo
  fi
fi

# Rule 3: <h1> inside <noscript> — creates duplicate h1 when JS disabled
# AND when axe inspects the live DOM with JS enabled (OP bug pattern).
for dir in src public; do
  if [ -d "$dir" ]; then
    hits=$(grep -rEn '<noscript[^>]*>[^<]*<h1|<noscript[^>]*>.*<h1' "$dir/" 2>/dev/null || true)
    if [ -n "$hits" ]; then
      fail "Rule 3 FAIL: <h1> inside <noscript> in $dir/."
      echo "$hits" | head -5
      echo "  Fix: demote the noscript heading to <p> or <h2>."
      echo
    fi
  fi
done

# Rule 4: <input type="range"> without an accessible name.
# WCAG 4.1.2 "Name, Role, Value" — unlabeled range inputs are critical
# a11y failures. An input is considered labeled if ANY of:
#   (a) tag contains aria-label= or aria-labelledby=
#   (b) tag is wrapped by an ancestor <label> element (implicit)
#   (c) tag has id="X" and a <label for="X"> exists in the same file
# Uses a Python helper to handle all 3 cases.
if [ -d src ]; then
  python3 - <<'PY'
import re, sys
from pathlib import Path

violations = []
label_open = re.compile(r'<label\b')
label_close = re.compile(r'</label>')
range_input = re.compile(r'<input\b[^>]*type="range"')
has_aria = re.compile(r'aria-label(?:ledby)?\s*=')
id_attr = re.compile(r'\bid="([^"]+)"')
label_for = re.compile(r'<label\s+[^>]*\bfor="([^"]+)"')

def find_tag_end(text, start):
    """Find the position right after '>' or '/>' that closes the tag
    starting at `start`, ignoring '>' inside string literals and
    inside Svelte/JSX {...} attribute values (which may contain =>)."""
    i = start
    in_quote = None
    brace_depth = 0
    while i < len(text):
        ch = text[i]
        if in_quote:
            if ch == in_quote:
                in_quote = None
        elif ch in ('"', "'"):
            in_quote = ch
        elif ch == '{':
            brace_depth += 1
        elif ch == '}':
            if brace_depth > 0:
                brace_depth -= 1
        elif ch == '>' and brace_depth == 0:
            return i + 1
        i += 1
    return -1

# Range inputs are detected on a line-by-line basis, but the full tag
# (which may span multiple lines) is sliced from the file source so
# aria-label on a continuation line still counts.
for p in Path('src').rglob('*'):
    if not p.is_file() or p.suffix not in ('.astro', '.svelte'):
        continue
    try:
        text = p.read_text()
    except Exception:
        continue
    label_for_ids = set(label_for.findall(text))
    # Precompute line starts so we can map offsets to line numbers
    line_starts = [0]
    for idx, ch in enumerate(text):
        if ch == '\n':
            line_starts.append(idx + 1)

    def offset_to_line(off):
        # Binary search for the line containing this offset
        lo, hi = 0, len(line_starts) - 1
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if line_starts[mid] <= off:
                lo = mid
            else:
                hi = mid - 1
        return lo + 1

    # Track label nesting at file-level by scanning tags in order
    depth = 0
    pos = 0
    # Scan the whole file: at each <label, ++depth; at each </label>, --depth;
    # at each <input...type="range", check the current depth + tag content.
    for m in re.finditer(r'<label\b|</label>|<input\b', text):
        if m.group(0) == '<label':
            depth += 1
            continue
        if m.group(0) == '</label>':
            depth -= 1
            continue
        # <input...
        tag_start = m.start()
        tag_end = find_tag_end(text, tag_start)
        if tag_end == -1:
            continue
        tag = text[tag_start:tag_end]
        # Only care about type="range"
        if 'type="range"' not in tag:
            continue
        if has_aria.search(tag):
            continue
        if depth > 0:
            continue  # wrapped by ancestor <label>
        id_match = id_attr.search(tag)
        if id_match and id_match.group(1) in label_for_ids:
            continue
        line_no = offset_to_line(tag_start)
        first_line = tag.split('\n', 1)[0]
        violations.append(f"{p}:{line_no}: {first_line.strip()[:120]}")

if violations:
    print(f"\033[0;31m[a11y] Rule 4 FAIL: {len(violations)} unlabeled range input(s) (WCAG 4.1.2 critical).\033[0m", file=sys.stderr)
    for v in violations[:5]:
        print(f"  {v}", file=sys.stderr)
    print("  Fix: add aria-label={labelExpr}, wrap in <label>, or pair with <label for=\"id\">.", file=sys.stderr)
    sys.exit(1)
PY
  if [ $? -ne 0 ]; then
    FAIL=1
  fi
fi

if [ "$FAIL" = "1" ]; then
  echo "${RED}═══ Pre-commit a11y check FAILED ═══${NC}"
  echo "${YELLOW}Bypass (NOT recommended): git commit --no-verify${NC}"
  exit 1
fi

echo "${GREEN}[a11y] pre-commit checks passed ✓${NC}"
