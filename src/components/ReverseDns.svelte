<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getReverseDns } from '../i18n/components';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getReverseDns(lang));

  let input = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<{ ip: string; arpa: string; ptrs: string[]; family: 4 | 6 } | null>(null);
  let requestId = $state(0);

  function validateIPv4(s: string): number[] | null {
    const parts = s.trim().split(".");
    if (parts.length !== 4) return null;
    const nums: number[] = [];
    for (const p of parts) {
      if (!/^\d+$/.test(p)) return null;
      const n = parseInt(p, 10);
      if (n < 0 || n > 255) return null;
      nums.push(n);
    }
    return nums;
  }

  function expandIPv6(s: string): number[] | null {
    // Returns array of 8 16-bit groups (0..65535) or null
    const trimmed = s.trim();
    if (!/^[0-9a-fA-F:]+$/.test(trimmed)) return null;
    const doubleColons = (trimmed.match(/::/g) || []).length;
    if (doubleColons > 1) return null;
    let groups: string[];
    if (doubleColons === 1) {
      const [left, right] = trimmed.split("::");
      const leftParts = left ? left.split(":") : [];
      const rightParts = right ? right.split(":") : [];
      const missing = 8 - leftParts.length - rightParts.length;
      if (missing < 0) return null;
      groups = [...leftParts, ...Array(missing).fill("0"), ...rightParts];
    } else {
      groups = trimmed.split(":");
    }
    if (groups.length !== 8) return null;
    const nums: number[] = [];
    for (const g of groups) {
      if (g.length === 0 || g.length > 4) return null;
      const n = parseInt(g, 16);
      if (isNaN(n) || n < 0 || n > 0xffff) return null;
      nums.push(n);
    }
    return nums;
  }

  function arpaV4(nums: number[]): string {
    return nums.slice().reverse().join(".") + ".in-addr.arpa";
  }

  function arpaV6(groups: number[]): string {
    // 32 nibbles reversed
    const nibbles: string[] = [];
    for (const g of groups) {
      const hex = g.toString(16).padStart(4, "0");
      for (const c of hex) nibbles.push(c);
    }
    return nibbles.reverse().join(".") + ".ip6.arpa";
  }

  async function lookup() {
    if (!input.trim()) return;
    requestId++;
    const myId = requestId;
    loading = true; error = ""; result = null;

    const raw = input.trim();
    let arpa: string;
    let family: 4 | 6;
    let canonicalIp: string;

    const v4 = validateIPv4(raw);
    if (v4) {
      arpa = arpaV4(v4);
      family = 4;
      canonicalIp = v4.join(".");
    } else {
      const v6 = expandIPv6(raw.replace(/^\[|\]$/g, ""));
      if (v6) {
        arpa = arpaV6(v6);
        family = 6;
        canonicalIp = v6.map((g) => g.toString(16)).join(":");
      } else {
        error = t.invalidIp;
        loading = false;
        return;
      }
    }

    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(arpa)}&type=PTR`,
        { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) }
      );
      if (myId !== requestId) return;
      if (!res.ok) throw new Error("DNS query failed");
      const data = await res.json();
      if (myId !== requestId) return;
      const ptrs = (data.Answer || [])
        .filter((a: any) => a.type === 12)
        .map((a: any) => a.data.replace(/\.$/, ""));
      result = { ip: canonicalIp, arpa, ptrs, family };
    } catch (e: any) {
      if (myId !== requestId) return;
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') {
        error = lang === 'es' ? 'La petici\u00f3n ha tardado demasiado. Int\u00e9ntalo de nuevo.' : 'Request timed out. Please try again.';
      } else {
        error = t.lookupFailed;
      }
    } finally {
      if (myId === requestId) loading = false;
    }
  }

  const fireToolComplete = useToolComplete("reverse-dns");
  let __ftcFirstRun = true;
  $effect(() => {
    input; loading; error; result; requestId;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (error) { fireToolComplete('error'); return; }
    if (!result) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="rdns-input" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.ipLabel}</label>
      <input id="rdns-input" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={input} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && !e.isComposing && !loading && lookup()} style="width: 100%;" />
      <div style="font-size: 11px; color: var(--color-text-muted);">{t.hint}</div>
      <button class="btn-primary" onclick={lookup} disabled={loading || !input.trim()}>
        {loading ? t.looking : t.lookup}
      </button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}
    <div class="card" style="border-left: 3px solid var(--color-bad);"><div class="card-body" style="color: var(--color-bad);">{error}</div></div>
  {/if}

  {#if result}
    <div class="card" style="border-left: 3px solid {result.ptrs.length > 0 ? 'var(--color-ok)' : 'var(--color-warn)'};">
      <div class="card-body space-y-3">
        <div style="font-size: 12px; color: var(--color-text-muted);">
          <span>{t.resolving}:</span>
          <span style="font-family: monospace; color: var(--color-text);">{result.ip}</span>
          <span style="margin-left: 6px; padding: 1px 8px; font-size: 10px; font-weight: 700; background: var(--color-accent, #3b82f6); color: #fff; border-radius: 9999px;">IPv{result.family}</span>
        </div>
        <div style="font-family: monospace; font-size: 11px; color: var(--color-text-muted); word-break: break-all;">{result.arpa}</div>

        {#if result.ptrs.length > 0}
          <div>
            <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">{t.ptrFound} ({result.ptrs.length})</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              {#each result.ptrs as ptr}
                <div style="font-family: monospace; font-size: 13px; padding: 6px 10px; background: var(--color-surface2); border-radius: 4px; word-break: break-all;">{ptr}</div>
              {/each}
            </div>
          </div>
        {:else}
          <div style="color: var(--color-warn); font-weight: 600;">{t.noPtr}</div>
          <div style="font-size: 12px; color: var(--color-text-muted);">{t.noPtrHint}</div>
        {/if}
      </div>
    </div>
  {/if}
  </div>
</div>
