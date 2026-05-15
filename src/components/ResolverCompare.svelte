<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getResolverCompare } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { readQuery, updateQuery } from '../lib/share-state';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getResolverCompare(lang));
  const c = $derived(getCommon(lang));

  interface Answer { data: string; ttl: number; }
  interface ResolverResult { id: string; name: string; operator: string; ok: boolean; status: number | null; responseMs: number; answers: Answer[]; error?: string; }
  interface CompareResult { domain: string; type: string; consistent: boolean; divergentCount: number; results: ResolverResult[]; }

  let domain = $state("");
  let recordType = $state<"A" | "AAAA" | "MX" | "TXT" | "NS" | "CNAME">("A");
  let loading = $state(false);
  let error = $state("");
  let result = $state<CompareResult | null>(null);
  let requestId = $state(0);

  const types = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"] as const;

  // CW-PT-04 / Theme A (2026-05-03): Hydrate from URL.
  onMount(() => {
    const q = readQuery(["domain"]);
    if (q.domain) {
      domain = q.domain;
      compare();
    }
  });

  async function compare() {
    if (!domain.trim()) return;
    requestId++;
    const myId = requestId;
    loading = true; error = ""; result = null;
    updateQuery({ domain: domain.trim() });
    try {
      const res = await fetch(`/api/resolver-compare?lang=${lang}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), type: recordType }),
        signal: AbortSignal.timeout(15000),
      });
      if (myId !== requestId) return;
      const data = await res.json();
      if (myId !== requestId) return;
      if (!res.ok) { error = data?.error || t.lookupFailed; return; }
      result = data;
    } catch (e: any) {
      if (myId !== requestId) return;
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') error = c.requestTimeout;
      else error = t.lookupFailed;
    } finally {
      if (myId === requestId) loading = false;
    }
  }

  function latencyColor(ms: number): string {
    if (ms <= 150) return "var(--color-green, #22c55e)";
    if (ms <= 400) return "var(--color-yellow, #eab308)";
    return "var(--color-red, #ef4444)";
  }

  const fireToolComplete = useToolComplete("resolver-compare");
  let __ftcFirstRun = true;
  $effect(() => {
    domain; recordType; loading; error; result; requestId;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (error) { fireToolComplete('error'); return; }
    if (!result) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="rc-domain" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input id="rc-domain" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={domain} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && compare()} style="width: 100%;" />
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;" role="group" aria-label={t.recordType}>
        <span style="font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.recordType}</span>
        {#each types as rt}
          <button type="button" class={recordType === rt ? "btn-primary" : "btn-secondary"} style="padding: 8px 12px; font-size: 12px; min-height: 36px; min-width: 44px;" onclick={() => { recordType = rt; }}>{rt}</button>
        {/each}
      </div>
      <button class="btn-primary" onclick={compare} disabled={loading || !domain.trim()}>
        {loading ? t.comparing : t.compare}
      </button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}
    <div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>
  {/if}

  {#if result}
    <div class="card" style="border-left: 3px solid {result.consistent ? 'var(--color-green)' : 'var(--color-yellow)'}; margin-bottom: 16px;">
      <div class="card-body">
        <div style="font-weight: 700;">{result.consistent ? t.consistent : t.inconsistent}</div>
        <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">
          {result.consistent ? t.consistentHint : t.inconsistentHint.replace("{n}", String(result.divergentCount))}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">{t.resolverResults}</span></div>
      <div class="card-body" style="padding: 0;">
        {#each result.results as r}
          <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-border);">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px; flex-wrap: wrap;">
              <div>
                <div style="font-weight: 700;">{r.name}</div>
                <div style="font-size: 11px; color: var(--color-text-muted); font-family: monospace;">{r.operator}</div>
              </div>
              <div style="text-align: right;">
                {#if r.ok}
                  <div style="font-family: monospace; font-weight: 700; color: {latencyColor(r.responseMs)};">{r.responseMs} ms</div>
                  <div style="font-size: 10px; color: var(--color-text-muted);">{r.answers.length} {r.answers.length === 1 ? t.record : t.records}</div>
                {:else}
                  <div style="color: var(--color-red); font-weight: 600; font-size: 12px;">{r.error || "error"}</div>
                  <div style="font-size: 10px; color: var(--color-text-muted);">{r.responseMs} ms</div>
                {/if}
              </div>
            </div>
            {#if r.ok && r.answers.length > 0}
              <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 2px;">
                {#each r.answers as ans}
                  <div style="font-family: monospace; font-size: 12px; color: var(--color-text-muted); word-break: break-all;">
                    <span style="color: var(--color-text);">{ans.data}</span>
                    <span style="margin-left: 8px; font-size: 10px;">TTL {ans.ttl}s</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
  </div>
</div>
