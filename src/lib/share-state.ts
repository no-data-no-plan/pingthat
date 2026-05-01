/** Shared helpers for PingThat tools to:
 *
 *  1. Encode current input state in the URL so a result is shareable.
 *     `updateQuery({ domain: "google.com", type: "A" })` does a
 *     replaceState — no history pollution from typing.
 *
 *  2. Read input state from the URL on mount so shared links pre-fill
 *     the form and (if the caller chooses) auto-execute the query.
 *
 *  3. Track per-tool recent queries in localStorage (last 10) so users
 *     can re-run a previous lookup with one click.
 *
 *  All functions are SSR-safe (no-op when window/localStorage missing).
 */

export type QueryParams = Record<string, string | undefined | null>;

/** Read the listed keys from window.location.search. Empty string for
 *  missing keys. */
export function readQuery(keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = "";
  if (typeof window === "undefined") return out;
  const params = new URLSearchParams(window.location.search);
  for (const k of keys) {
    const v = params.get(k);
    if (v !== null) out[k] = v;
  }
  return out;
}

/** Replace the URL's query string with the provided params. Empty values
 *  are dropped so the URL stays clean. Uses replaceState to avoid
 *  cluttering browser history with every keystroke. */
export function updateQuery(params: QueryParams): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") {
      url.searchParams.delete(k);
    } else {
      url.searchParams.set(k, v);
    }
  }
  window.history.replaceState(null, "", url.toString());
}

const RECENT_LIMIT = 10;

function storageKey(toolId: string): string {
  return `pt-recent:${toolId}`;
}

/** Push a value onto the recent-queries list for a tool. Most-recent
 *  first, deduped, capped at RECENT_LIMIT. Silently no-ops if
 *  localStorage is unavailable (private mode, quota exceeded). */
export function pushRecent(toolId: string, value: string): void {
  if (typeof localStorage === "undefined") return;
  const trimmed = value.trim();
  if (!trimmed) return;
  try {
    const raw = localStorage.getItem(storageKey(toolId));
    const list: string[] = raw ? JSON.parse(raw) : [];
    const filtered = [trimmed, ...list.filter((v) => v !== trimmed)].slice(0, RECENT_LIMIT);
    localStorage.setItem(storageKey(toolId), JSON.stringify(filtered));
  } catch {
    /* quota / disabled / parse failure — silent */
  }
}

/** Get the recent-queries list for a tool, most-recent first. Empty
 *  array if no history or storage unavailable. */
export function getRecent(toolId: string): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(toolId));
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Wipe a tool's recent-queries history. */
export function clearRecent(toolId: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(storageKey(toolId));
  } catch {
    /* silent */
  }
}
