// src/lib/palette-match.ts
// Match scoring for the Cmd+K palette. Pure + unit-tested.
// Tiers: exact prefix 4 > word-boundary prefix 3 > substring 2 > in-order
// subsequence 1 > null. The palette consumes match-or-null (visibility only,
// grouped layout keeps DOM order); the tiers exist so a future ranked mode
// can reuse them without re-deriving the scale.

export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function scoreMatch(query: string, haystack: string): number | null {
  const q = normalize(query).trim();
  if (!q) return 0; // match-all sentinel: empty query shows everything
  const h = normalize(haystack);
  if (h.startsWith(q)) return 4;
  if (h.split(/[^a-z0-9]+/).some((w) => w.startsWith(q))) return 3;
  if (h.includes(q)) return 2;
  let i = 0;
  for (const ch of h) {
    if (ch === q[i]) i++;
    if (i === q.length) return 1;
  }
  return null;
}

export function matchTool(query: string, fields: ReadonlyArray<string>): number | null {
  let best: number | null = null;
  for (const f of fields) {
    const s = scoreMatch(query, f);
    if (s !== null && (best === null || s > best)) best = s;
  }
  return best;
}
