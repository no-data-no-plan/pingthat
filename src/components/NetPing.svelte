<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import type { Level } from '../lib/severity';
  import type { PingResult } from '../lib/api-types';
  import { getNetPing } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidUrl, getValidationError } from '../lib/validation';
  import { readQuery, updateQuery } from '../lib/share-state';
  import { computeStats } from '../lib/ping-stats';
  import { useToolComplete } from '../lib/tool-complete.svelte';
  import StatusBadge from './ui/StatusBadge.svelte';

  interface Props { lang?: Lang; }
  let { lang = 'en' }: Props = $props();
  const t = $derived(getNetPing(lang));
  const c = $derived(getCommon(lang));

  let host = $state('');
  let loading = $state(false);
  let error = $state('');
  let result = $state<PingResult | null>(null);
  let requestId = $state(0);

  const stats = $derived(result && result.samples.length ? computeStats(result.samples) : null);
  const verdict = $derived.by<{ level: Level; label: string } | null>(() => {
    if (!result) return null;
    if (result.received === 0) return { level: 'bad', label: t.unreachableLabel };
    const a = stats!.avg;
    if (a < 100) return { level: 'ok', label: t.ratingFast };
    if (a <= 400) return { level: 'warn', label: t.ratingModerate };
    return { level: 'bad', label: t.ratingSlow };
  });

  onMount(() => { const q = readQuery(['host']); if (q.host) { host = q.host; run(); } });

  async function run() {
    if (!host.trim()) return;
    if (!isValidUrl(host.trim())) { error = getValidationError('url', lang as 'en' | 'es'); result = null; return; }
    requestId++; const myId = requestId;
    loading = true; error = ''; result = null;
    updateQuery({ host: host.trim() });
    try {
      const res = await fetch(`/api/ping?lang=${lang}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: host.trim() }), signal: AbortSignal.timeout(20000),
      });
      if (myId !== requestId) return;
      const data = await res.json();
      if (myId !== requestId) return;
      if (!res.ok || (data.error && !data.samples?.length)) { error = data?.error || t.checkFailed; }
      else result = data;
    } catch { if (myId === requestId) error = t.checkFailed; }
    finally { if (myId === requestId) loading = false; }
  }

  const fireToolComplete = useToolComplete('net-ping');
  let __ftc = true;
  $effect(() => { host; result; loading; error; requestId; if (__ftc) { __ftc = false; return; } if (error) { fireToolComplete('error'); return; } if (!result) return; fireToolComplete(); });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="ping-host" style="display:block; font-size:9px; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:.1em;">{t.domainLabel}</label>
      <input id="ping-host" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={host} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && !e.isComposing && !loading && run()} style="width:100%;" />
      <button class="btn-primary" onclick={run} disabled={loading || !host.trim()}>{loading ? t.checking : t.check}</button>
      <p style="font-size:11px; color:var(--color-text-dim); margin:0; line-height:1.5;">{t.caveat}</p>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
    {#if error && !result}<div class="card" style="border-left:3px solid var(--color-bad);"><div class="card-body" style="color:var(--color-bad);">{error}</div></div>{/if}

    {#if result && verdict}
      <div class="card sev-accent is-{verdict.level}">
        <div class="card-body space-y-3">
          <div style="display:flex; align-items:center; gap:12px;">
            <StatusBadge level={verdict.level} label={verdict.label} />
            <span style="font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--color-text-muted); word-break:break-all;">{result.host}</span>
          </div>
          {#if stats}
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px;">
              {#each [[t.min, stats.min], [t.avg, stats.avg], [t.max, stats.max], [t.jitter, stats.jitter]] as [lbl, val]}
                <div style="text-align:center;">
                  <div style="font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:var(--color-text-dim);">{lbl}</div>
                  <div style="font-family:'JetBrains Mono',monospace; font-size:18px; color:var(--color-text);">{val}<span style="font-size:11px; color:var(--color-text-muted);">ms</span></div>
                </div>
              {/each}
            </div>
            <div role="img" aria-label={`${t.samplesLabel}: ${result.samples.join(', ')} ms`} style="display:flex; align-items:flex-end; gap:6px; height:48px;">
              {#each result.samples as s}
                <div class="sev-bar is-{verdict.level}" title={`${s}ms`} style="flex:1; min-height:8px; height:{Math.max(8, Math.round((s / stats.max) * 100))}%;"></div>
              {/each}
            </div>
          {/if}
          <div style="font-size:12px; color:var(--color-text-muted);">{t.reachability}: {result.received}/{result.sent}</div>
        </div>
      </div>
    {/if}
  </div>
</div>
