import { describe, it, expect } from 'vitest';
import {
  isAbortError,
  isUserCancelled,
  USER_CANCELLED_REASON,
} from './cancel-discriminator';

describe('isAbortError', () => {
  it('recognises an AbortError-named object', () => {
    expect(isAbortError({ name: 'AbortError' })).toBe(true);
  });

  it('recognises a TimeoutError-named object (AbortSignal.timeout path)', () => {
    expect(isAbortError({ name: 'TimeoutError' })).toBe(true);
  });

  it('does not match a generic Error', () => {
    expect(isAbortError(new Error('boom'))).toBe(false);
  });

  it('does not match TypeError (DNS/network failure path)', () => {
    expect(isAbortError({ name: 'TypeError', message: 'fetch failed' })).toBe(false);
  });

  it('handles primitives safely (strings, null, undefined, numbers)', () => {
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
    expect(isAbortError('AbortError')).toBe(false);
    expect(isAbortError(42)).toBe(false);
  });

  it('handles objects without a name property', () => {
    expect(isAbortError({})).toBe(false);
    expect(isAbortError({ message: 'foo' })).toBe(false);
  });
});

describe('isUserCancelled', () => {
  it('returns true when signal was aborted with the user-cancelled reason', () => {
    const ctrl = new AbortController();
    ctrl.abort(USER_CANCELLED_REASON);
    expect(isUserCancelled(ctrl.signal)).toBe(true);
  });

  it('returns false when signal was aborted with no argument', () => {
    // controller.abort() with no arg sets reason to a default DOMException —
    // this is the bug round-2 review caught: the original `reason !== undefined`
    // check treated this as user-cancelled and swallowed timeout errors.
    const ctrl = new AbortController();
    ctrl.abort();
    expect(ctrl.signal.aborted).toBe(true);
    expect(ctrl.signal.reason).toBeDefined(); // confirms the bug premise
    expect(isUserCancelled(ctrl.signal)).toBe(false);
  });

  it('returns false when signal was aborted with a different string reason', () => {
    const ctrl = new AbortController();
    ctrl.abort('timeout');
    expect(isUserCancelled(ctrl.signal)).toBe(false);
  });

  it('returns false when signal is not aborted', () => {
    const ctrl = new AbortController();
    expect(isUserCancelled(ctrl.signal)).toBe(false);
  });

  it('returns false for AbortSignal.timeout()', () => {
    const signal = AbortSignal.timeout(0);
    // wait one tick so the timeout fires
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(signal.aborted).toBe(true);
        expect(isUserCancelled(signal)).toBe(false);
        resolve();
      }, 5);
    });
  });
});

describe('combined flow (component pattern)', () => {
  /**
   * Mirrors what SslChecker.svelte / HttpHeaders.svelte do in the catch
   * block: derive the user-facing error message from the abort signal.
   */
  function deriveErrorMessage(
    e: unknown,
    signal: AbortSignal,
    timeoutMsg: string,
    genericMsg: string,
  ): string {
    if (isAbortError(e)) {
      return isUserCancelled(signal) ? '' : timeoutMsg;
    }
    return genericMsg;
  }

  it('user-cancelled → empty error (UI clears)', () => {
    const ctrl = new AbortController();
    ctrl.abort(USER_CANCELLED_REASON);
    const msg = deriveErrorMessage(
      { name: 'AbortError' },
      ctrl.signal,
      'Timed out',
      'Failed',
    );
    expect(msg).toBe('');
  });

  it('default abort (no reason arg) → timeout message', () => {
    const ctrl = new AbortController();
    ctrl.abort();
    const msg = deriveErrorMessage(
      { name: 'AbortError' },
      ctrl.signal,
      'Timed out',
      'Failed',
    );
    expect(msg).toBe('Timed out');
  });

  it('non-abort error (e.g. fetch network failure) → generic message', () => {
    const ctrl = new AbortController();
    const msg = deriveErrorMessage(
      new TypeError('fetch failed'),
      ctrl.signal,
      'Timed out',
      'Failed',
    );
    expect(msg).toBe('Failed');
  });
});
