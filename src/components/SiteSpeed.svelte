<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getSiteSpeed } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { readQuery, updateQuery } from '../lib/share-state';
  import { isAbortError, isUserCancelled, USER_CANCELLED_REASON } from '../lib/cancel-discriminator';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getSiteSpeed(lang));
  const c = $derived(getCommon(lang));

  type Rating = "good" | "needs-improvement" | "poor";
  interface Metric { p75: number | null; rating: Rating | null; histogram: Array<{ density: number }>; }
  interface SiteSpeedResult {
    url: string;
    scope: "url" | "origin";
    formFactor: "PHONE" | "DESKTOP";
    collectionPeriod: any;
    metrics: {
      largest_contentful_paint: Metric;
      interaction_to_next_paint: Metric;
      cumulative_layout_shift: Metric;
      first_contentful_paint: Metric;
      experimental_time_to_first_byte: Metric;
    };
    notEnoughData?: boolean;
    configMissing?: boolean;
  }

  let url = $state("");
  let formFactor = $state<"PHONE" | "DESKTOP">("PHONE");
  let loading = $state(false);
  let error = $state("");
  let result = $state<SiteSpeedResult | null>(null);
  let requestId = $state(0);
  let abortController: AbortController | null = null;

  // CW-PT-04 / Theme A (2026-05-03): Hydrate from URL.
  onMount(() => {
    const q = readQuery(["url"]);
    if (q.url) {
      url = q.url;
      check();
    }
  });

  async function check() {
    if (!url.trim()) return;
    requestId++;
    const myId = requestId;
    loading = true; error = ""; result = null;
    updateQuery({ url: url.trim() });
    abortController?.abort();
    abortController = new AbortController();
    const ctrl = abortController;
    const timeoutId = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(`/api/site-speed?lang=${lang}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), formFactor }),
        signal: ctrl.signal,
      });
      if (myId !== requestId) return;
      const data = await res.json();
      if (myId !== requestId) return;
      if (data.configMissing) { error = t.configMissing; return; }
      if (!res.ok) {
        error = data?.error || t.checkFailed;
        return;
      }
      result = data;
    } catch (e: any) {
      if (myId !== requestId) return;
      if (isAbortError(e)) {
        error = isUserCancelled(ctrl.signal) ? "" : c.requestTimeout;
      } else {
        error = t.checkFailed;
      }
    } finally {
      clearTimeout(timeoutId);
      if (myId === requestId) loading = false;
    }
  }

  function cancel() {
    if (!loading) return;
    abortController?.abort(USER_CANCELLED_REASON);
  }

  const METRIC_META = {
    largest_contentful_paint: { label: "LCP", unit: "ms", desc: { en: "Largest Contentful Paint", es: "Largest Contentful Paint" } },
    interaction_to_next_paint: { label: "INP", unit: "ms", desc: { en: "Interaction to Next Paint", es: "Interaction to Next Paint" } },
    cumulative_layout_shift: { label: "CLS", unit: "", desc: { en: "Cumulative Layout Shift", es: "Cumulative Layout Shift" } },
    first_contentful_paint: { label: "FCP", unit: "ms", desc: { en: "First Contentful Paint", es: "First Contentful Paint" } },
    experimental_time_to_first_byte: { label: "TTFB", unit: "ms", desc: { en: "Time to First Byte", es: "Time to First Byte" } },
  } as const;

  function ratingColor(r: Rating | null): string {
    if (r === "good") return "var(--color-green, #22c55e)";
    if (r === "needs-improvement") return "var(--color-yellow, #eab308)";
    if (r === "poor") return "var(--color-red, #ef4444)";
    return "var(--color-text-muted, #64748b)";
  }

  function ratingLabel(r: Rating | null): string {
    if (r === "good") return t.ratingGood;
    if (r === "needs-improvement") return t.ratingNeedsImprovement;
    if (r === "poor") return t.ratingPoor;
    return t.ratingNoData;
  }

  function formatValue(key: keyof typeof METRIC_META, v: number | null): string {
    if (v === null) return "—";
    if (key === "cumulative_layout_shift") return v.toFixed(3);
    return `${Math.round(v)} ms`;
  }

  const fireToolComplete = useToolComplete("site-speed");
  let __ftcFirstRun = true;
  $effect(() => {
    url; formFactor; loading; error; result; requestId;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (error) return;
    if (!result) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="speed-url" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.urlLabel}</label>
      <input id="speed-url" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={url} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && check()} style="width: 100%;" />
      <div style="display: flex; gap: 8px;" role="group" aria-label={t.formFactor}>
        <span style="font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; align-self: center;">{t.formFactor}</span>
        <button type="button" class={formFactor === "PHONE" ? "btn-primary" : "btn-secondary"} style="padding: 6px 14px; font-size: 12px;" onclick={() => { formFactor = "PHONE"; }}>{t.mobile}</button>
        <button type="button" class={formFactor === "DESKTOP" ? "btn-primary" : "btn-secondary"} style="padding: 6px 14px; font-size: 12px;" onclick={() => { formFactor = "DESKTOP"; }}>{t.desktop}</button>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-primary" onclick={check} disabled={loading || !url.trim()} style="flex: 1;">
          {loading ? t.checking : t.check}
        </button>
        {#if loading}
          <button type="button" onclick={cancel} aria-label={c.cancel}
                  style="padding: 0 16px; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 4px; cursor: pointer;">
            {c.cancel}
          </button>
        {/if}
      </div>
      {#if loading}
        <div role="status" aria-live="polite"
             style="font-size: 12px; color: var(--color-text-muted); display: flex; align-items: center; gap: 8px; padding-top: 4px;">
          <span class="pt-spinner" aria-hidden="true"></span>
          <span>{t.checking}</span>
        </div>
      {/if}
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}
    <div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>
  {/if}

  {#if result}
    {#if result.notEnoughData}
      <div class="card" style="border-left: 3px solid var(--color-yellow);">
        <div class="card-body">
          <div style="font-weight: 600;">{t.notEnoughDataTitle}</div>
          <div style="font-size: 13px; color: var(--color-text-muted);">{t.notEnoughDataExplanation}</div>
        </div>
      </div>
    {:else}
      <div style="margin-bottom: 12px; font-size: 12px; color: var(--color-text-muted);">
        {t.scope}: <span style="font-family: monospace;">{result.scope}</span> · {t.formFactor}: <span style="font-family: monospace;">{result.formFactor}</span>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">{t.coreWebVitals}</span></div>
        <div class="card-body">
          {#each ["largest_contentful_paint","interaction_to_next_paint","cumulative_layout_shift"] as const as key}
            {@const m = result.metrics[key]}
            {@const meta = METRIC_META[key]}
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--color-border);">
              <div>
                <div style="font-weight: 700; font-size: 14px;">{meta.label}</div>
                <div style="font-size: 11px; color: var(--color-text-muted);">{lang === 'es' ? meta.desc.es : meta.desc.en}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: {ratingColor(m.rating)};">{formatValue(key, m.p75)}</div>
                <div style="font-size: 10px; color: {ratingColor(m.rating)}; text-transform: uppercase; font-weight: 700;">{ratingLabel(m.rating)}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <div class="card-header"><span class="card-title">{t.otherMetrics}</span></div>
        <div class="card-body">
          {#each ["first_contentful_paint","experimental_time_to_first_byte"] as const as key}
            {@const m = result.metrics[key]}
            {@const meta = METRIC_META[key]}
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--color-border);">
              <div>
                <div style="font-weight: 700; font-size: 14px;">{meta.label}</div>
                <div style="font-size: 11px; color: var(--color-text-muted);">{lang === 'es' ? meta.desc.es : meta.desc.en}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-family: monospace; font-size: 15px; font-weight: 700; color: {ratingColor(m.rating)};">{formatValue(key, m.p75)}</div>
                <div style="font-size: 10px; color: {ratingColor(m.rating)}; text-transform: uppercase; font-weight: 700;">{ratingLabel(m.rating)}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div style="margin-top: 12px; font-size: 11px; color: var(--color-text-muted);">{t.footnote}</div>
    {/if}
  {/if}
  </div>
</div>

<style>
  .pt-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: pt-spinner-spin 0.8s linear infinite;
  }
  @keyframes pt-spinner-spin {
    to { transform: rotate(360deg); }
  }
</style>
