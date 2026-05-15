/** Lightweight toast helper. Dispatches a CustomEvent on `window`; the
 * <NotifyToast> component listens and renders an aria-live region.
 *
 * Three kinds:
 *   - "success" / "info": positive feedback (copy, format applied)
 *   - "error": failures that aren't tied to a specific input (clipboard
 *     denied, parse failed mid-flow). Inline-error UX is still preferred
 *     when you can attach context next to the failed control; reach for
 *     this when the failure has no anchor.
 *
 * Event name `pt-toast` is app-specific so a future iframe / extension
 * embedding multiple portfolio apps can't cross-talk.
 */
export type ToastKind = "success" | "info" | "error";

const EVENT_NAME = "pt-toast";

export interface ToastOptions {
  /** Stable identity. If a toast with this id is still visible, the call
   *  refreshes it (resets timer, updates text) instead of stacking. */
  id?: string;
  /** Override the default duration (ms). Defaults: success/info 5000,
   *  error 7000. Pass 0 to make sticky (close-button only). */
  durationMs?: number;
}

export function notify(message: string, kind: ToastKind = "success", opts: ToastOptions = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { message, kind, ...opts } }));
}

/** Convenience: copy + toast in one call. Returns true on success. */
export async function copyAndNotify(text: string, label: string, errorLabel?: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    notify(errorLabel ?? "Clipboard not available", "error");
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    notify(label);
    return true;
  } catch {
    notify(errorLabel ?? "Copy failed", "error");
    return false;
  }
}
