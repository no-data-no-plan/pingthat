<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getIpv6Check } from '../i18n/components';
  import { readQuery, updateQuery } from '../lib/share-state';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getIpv6Check(lang));

  interface HostResult { host: string; ipv4: string[]; ipv6: string[]; }
  interface ServiceResult { label: string; records: string[]; hasIpv6: number; total: number; }
  interface CheckState {
    apex: HostResult;
    www: HostResult | null;
    nameservers: ServiceResult;
    mail: ServiceResult;
    score: number;
    maxScore: number;
  }

  let domain = $state("");
  let state = $state<CheckState | null>(null);
  let loading = $state(false);
  let error = $state("");
  let requestId = $state(0);

  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  async function doh(name: string, type: string): Promise<Array<{ data: string }>> {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error("DNS query failed");
    const j = await res.json();
    return (j.Answer || []).filter((a: any) => a.name.replace(/\.$/, "") === name.replace(/\.$/, ""));
  }

  async function lookupHost(host: string): Promise<HostResult> {
    const [a, aaaa] = await Promise.all([doh(host, "A"), doh(host, "AAAA")]);
    return { host, ipv4: a.map((r) => r.data), ipv6: aaaa.map((r) => r.data) };
  }

  async function lookupService(records: string[], label: string): Promise<ServiceResult> {
    const settled = await Promise.all(records.map((h) => doh(h, "AAAA").catch(() => [])));
    const hasIpv6 = settled.filter((s) => s.length > 0).length;
    return { label, records, hasIpv6, total: records.length };
  }

  // CW-PT-04 / Theme A (2026-05-02): Hydrate from URL.
  onMount(() => {
    const q = readQuery(["domain"]);
    if (q.domain) {
      domain = q.domain;
      runCheck();
    }
  });

  async function runCheck() {
    if (!domain.trim()) return;
    requestId++;
    const myId = requestId;
    loading = true; error = ""; state = null;

    const target = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!domainRegex.test(target)) {
      error = t.invalidDomain;
      loading = false;
      return;
    }
    updateQuery({ domain: target });

    try {
      const apex = await lookupHost(target);
      if (myId !== requestId) return;

      const www = target.startsWith("www.") ? null : await lookupHost(`www.${target}`).catch(() => null);
      if (myId !== requestId) return;

      const [nsAns, mxAns] = await Promise.all([
        doh(target, "NS").catch(() => []),
        doh(target, "MX").catch(() => []),
      ]);
      if (myId !== requestId) return;

      const nsHosts = nsAns.map((r) => r.data.replace(/\.$/, "")).filter(Boolean);
      const mxHosts = mxAns
        .map((r) => {
          const parts = r.data.split(/\s+/);
          return (parts[1] || parts[0] || "").replace(/\.$/, "");
        })
        .filter(Boolean);

      const [nameservers, mail] = await Promise.all([
        lookupService(nsHosts, "NS"),
        lookupService(mxHosts, "MX"),
      ]);
      if (myId !== requestId) return;

      let score = 0;
      if (apex.ipv6.length > 0) score++;
      if (www === null || www.ipv6.length > 0 || (www && www.ipv4.length === 0)) score++;
      if (nameservers.total > 0 && nameservers.hasIpv6 === nameservers.total) score++;
      if (mail.total === 0 || mail.hasIpv6 > 0) score++;

      state = { apex, www, nameservers, mail, score, maxScore: 4 };
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

  function scoreColor(score: number): string {
    if (score >= 3) return "var(--color-green, #22c55e)";
    if (score >= 2) return "var(--color-yellow, #eab308)";
    return "var(--color-red, #ef4444)";
  }

  function scoreLabel(score: number): string {
    if (score >= 4) return t.ratingFullReady;
    if (score >= 3) return t.ratingGood;
    if (score >= 2) return t.ratingPartial;
    if (score >= 1) return t.ratingMinimal;
    return t.ratingNone;
  }

  const fireToolComplete = useToolComplete("ipv6-check");
  let __ftcFirstRun = true;
  $effect(() => {
    domain; state; loading; error; requestId;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="ipv6-domain" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input id="ipv6-domain" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={domain} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && runCheck()} style="width: 100%;" />
      <button class="btn-primary" onclick={runCheck} disabled={loading || !domain.trim()}>
        {loading ? t.checking : t.check}
      </button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}
    <div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>
  {/if}

  {#if state}
    <div class="card" style="border-left: 3px solid {scoreColor(state.score)}; margin-bottom: 16px;">
      <div class="card-body" style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
        <div style="font-size: 32px; font-weight: 700; color: {scoreColor(state.score)};">{state.score}/{state.maxScore}</div>
        <div>
          <div style="font-weight: 600;">{scoreLabel(state.score)}</div>
          <div style="font-size: 12px; color: var(--color-text-muted);">{t.scoreExplanation}</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header"><span class="card-title">{t.hostResolution}</span></div>
      <div class="card-body" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--color-border);">
              <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colHost}</th>
              <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">IPv4</th>
              <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">IPv6</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--color-border);">
              <td style="padding: 6px; font-family: monospace;">{state.apex.host}</td>
              <td style="padding: 6px; font-family: monospace; color: var(--color-text-muted);">{state.apex.ipv4.join(", ") || "—"}</td>
              <td style="padding: 6px; font-family: monospace; color: {state.apex.ipv6.length > 0 ? 'var(--color-green)' : 'var(--color-red)'};">{state.apex.ipv6.join(", ") || t.noAaaa}</td>
            </tr>
            {#if state.www}
              <tr style="border-bottom: 1px solid var(--color-border);">
                <td style="padding: 6px; font-family: monospace;">{state.www.host}</td>
                <td style="padding: 6px; font-family: monospace; color: var(--color-text-muted);">{state.www.ipv4.join(", ") || "—"}</td>
                <td style="padding: 6px; font-family: monospace; color: {state.www.ipv6.length > 0 || state.www.ipv4.length === 0 ? 'var(--color-green)' : 'var(--color-yellow)'};">{state.www.ipv6.join(", ") || (state.www.ipv4.length === 0 ? "—" : t.noAaaa)}</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header"><span class="card-title">{t.infrastructure}</span></div>
      <div class="card-body space-y-2">
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--color-border);">
          <div>
            <div style="font-weight: 600; font-size: 13px;">{t.nameservers}</div>
            <div style="font-size: 11px; color: var(--color-text-muted); font-family: monospace;">{state.nameservers.records.join(", ") || "—"}</div>
          </div>
          <div style="font-family: monospace; font-weight: 600; color: {state.nameservers.total === 0 ? 'var(--color-text-muted)' : state.nameservers.hasIpv6 === state.nameservers.total ? 'var(--color-green)' : state.nameservers.hasIpv6 > 0 ? 'var(--color-yellow)' : 'var(--color-red)'};">
            {state.nameservers.hasIpv6}/{state.nameservers.total}
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
          <div>
            <div style="font-weight: 600; font-size: 13px;">{t.mailServers}</div>
            <div style="font-size: 11px; color: var(--color-text-muted); font-family: monospace;">{state.mail.records.join(", ") || t.noMail}</div>
          </div>
          <div style="font-family: monospace; font-weight: 600; color: {state.mail.total === 0 ? 'var(--color-text-muted)' : state.mail.hasIpv6 === state.mail.total ? 'var(--color-green)' : state.mail.hasIpv6 > 0 ? 'var(--color-yellow)' : 'var(--color-red)'};">
            {state.mail.total === 0 ? "—" : `${state.mail.hasIpv6}/${state.mail.total}`}
          </div>
        </div>
      </div>
    </div>
  {/if}
  </div>
</div>
