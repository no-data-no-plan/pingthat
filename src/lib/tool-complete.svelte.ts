/**
 * Fire `tool_complete` gtag events per session per tool, debounced.
 *
 * Emits `outcome: 'success' | 'error'`. The first outcome to settle wins —
 * subsequent fires (of either outcome) are no-ops once a session has fired
 * once for this tool. This is intentional: GA4 scorecard signal S11 only
 * needs ONE event per tool per session; the outcome tells us whether the
 * user's first settled attempt succeeded or failed.
 *
 * If `window.gtag` is missing (consent CMP not granted, adblocker dropped
 * the snippet, script not loaded yet), the call is NOT marked as fired —
 * a later $effect re-run will retry. To stay observable in that case, the
 * util increments `window.__toolCompleteMissedFires[toolId]` so the
 * operator can read measurement-loss counts from DevTools.
 *
 * Usage in a Svelte 5 component:
 *   import { useToolComplete } from '../lib/tool-complete.svelte';
 *   const fire = useToolComplete('bmi-calculator');
 *   // happy path:
 *   $effect(() => { weight; height; fire(); });
 *   // error path (when the component has a clear failure mode):
 *   if (validationError) fire('error');
 */
type Outcome = 'success' | 'error';

interface ToolCompleteWindow extends Window {
  gtag?: (...args: unknown[]) => void;
  __toolCompleteMissedFires?: Record<string, number>;
}

export function useToolComplete(toolId: string, debounceMs = 1500) {
  let fired = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return function fire(outcome: Outcome = 'success') {
    if (fired || typeof window === 'undefined') return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (fired) return;
      const w = window as ToolCompleteWindow;
      if (typeof w.gtag !== 'function') {
        w.__toolCompleteMissedFires = w.__toolCompleteMissedFires || {};
        const key = `${toolId}:${outcome}`;
        w.__toolCompleteMissedFires[key] = (w.__toolCompleteMissedFires[key] || 0) + 1;
        return;
      }
      fired = true;
      w.gtag('event', 'tool_complete', {
        tool_id: toolId,
        outcome,
      });
    }, debounceMs);
  };
}
