/**
 * Cancel-vs-timeout discriminator for in-flight API requests.
 *
 * Nielsen audit Phase 6 + round-2 review fix (2026-04-30):
 * `controller.abort()` with no argument sets `signal.reason` to a default
 * `DOMException("AbortError")`. So `signal.reason !== undefined` is true
 * for BOTH the user-cancel path and the setTimeout-driven 30s timeout abort.
 * The original code conflated them and silently cleared the error on every
 * timeout.
 *
 * Discriminate by the explicit string passed to `controller.abort('user-
 * cancelled')`. Anything else (default DOMException, no abort at all,
 * other AbortErrors) is treated as "real" timeout/error and surfaces the
 * timeout message.
 *
 * Usage in components (SslChecker / HttpHeaders / RedirectChecker / SiteSpeed):
 *   const abortController = new AbortController();
 *   …
 *   } catch (e) {
 *     if (isAbortError(e)) {
 *       error = isUserCancelled(abortController.signal) ? "" : timeoutMsg;
 *     } else { … }
 *   }
 *
 *   function cancel() { abortController.abort('user-cancelled'); }
 */

export const USER_CANCELLED_REASON = 'user-cancelled' as const;

export function isAbortError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const name = (e as { name?: unknown }).name;
  return name === 'AbortError' || name === 'TimeoutError';
}

export function isUserCancelled(signal: AbortSignal): boolean {
  return signal.aborted && signal.reason === USER_CANCELLED_REASON;
}
