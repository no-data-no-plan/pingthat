/**
 * Fire a single `tool_complete` gtag event per session per tool, debounced.
 *
 * Designed for reactive calculators ($derived / $effect — no explicit submit
 * button) — fires after `debounceMs` of input stability, meaning the user
 * stopped adjusting inputs and is now consuming the result. Marco's master-plan
 * P1.1 / Sprint 3 instrumentation pattern adapted for Svelte 5 runes.
 *
 * GA4 scorecard signal S11 ("tool_complete event tracked per tool"). Once per
 * page load is sufficient — not once per keystroke.
 *
 * Usage in a Svelte 5 component:
 *   import { useToolComplete } from '../lib/tool-complete.svelte';
 *   const fireToolComplete = useToolComplete('compound-interest');
 *   $effect(() => {
 *     // Reference each reactive input inside the effect so Svelte tracks them
 *     principal; monthly; rate; years;
 *     fireToolComplete();
 *   });
 */
export function useToolComplete(toolId: string, debounceMs = 1500) {
  let fired = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return function fire() {
    if (fired || typeof window === 'undefined') return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (fired) return;
      fired = true;
      const w = window as Window & { gtag?: (...args: unknown[]) => void };
      w.gtag?.('event', 'tool_complete', {
        tool_id: toolId,
        outcome: 'success',
      });
    }, debounceMs);
  };
}
