<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import type { Level } from '../lib/severity';
  import { getPortScan } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidDomain, getValidationError } from '../lib/validation';
  import type { PortScanResult, PortScanEntry } from '../lib/api-types';
  import { readQuery, updateQuery } from '../lib/share-state';
  import { useToolComplete } from "../lib/tool-complete.svelte";
  import StatusBadge from './ui/StatusBadge.svelte';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getPortScan(lang));
  const c = $derived(getCommon(lang));

  let host = $state("");
  let customPorts = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<PortScanResult | null>(null);
  let requestId = $state(0);

  // CW-PT-04 / Theme A (2026-05-02): Hydrate from URL so chains preserve
  // host context. Accepts ?domain= as well as ?host= for cross-tool handoff.
  onMount(() => {
    const q = readQuery(["host", "domain"]);
    const incoming = q.host || q.domain;
    if (incoming) {
      host = incoming;
      scan();
    }
  });

  type PortStatus = "open" | "closed" | "filtered" | "unverifiable";

  function portLevel(status: PortStatus): Level {
    if (status === "open") return "info";
    if (status === "closed") return "ok";
    if (status === "filtered") return "warn";
    return "ok"; // unverifiable: neutral, treated as ok (dot won't mislead)
  }

  function statusLabel(status: PortStatus): string {
    if (status === "open") return t.statusOpen;
    if (status === "closed") return t.statusClosed;
    if (status === "unverifiable") return t.statusUnverifiable;
    return t.statusFiltered;
  }

  function parsePorts(input: string): number[] | null {
    if (!input.trim()) return null; // use defaults
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    if (parts.length > 5) return [];
    const ports: number[] = [];
    for (const part of parts) {
      const n = parseInt(part, 10);
      if (isNaN(n) || n < 1 || n > 65535) return [];
      ports.push(n);
    }
    return ports;
  }

  async function scan() {
    if (!host.trim()) return;
    if (!isValidDomain(host.trim())) {
      error = getValidationError('domain', lang as 'en' | 'es');
      result = null;
      return;
    }

    const ports = parsePorts(customPorts);
    if (ports !== null && ports.length === 0) {
      error = t.invalidPorts;
      result = null;
      return;
    }

    updateQuery({ host: host.trim() });
    requestId++;
    const myId = requestId;
    loading = true; error = ""; result = null;

    const payload: Record<string, unknown> = { host: host.trim() };
    if (ports) payload.ports = ports;

    try {
      const res = await fetch(`/api/port-scan?lang=${lang}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(60000),
      });
      if (myId !== requestId) return;
      if (!res.ok) {
        let msg = t.scanFailed;
        try { const d = await res.json(); if (d?.error) msg = d.error; } catch {}
        error = msg;
        return;
      }
      const data = await res.json();
      if (myId !== requestId) return;
      if (data.error) { error = data.error; } else { result = data; }
    } catch (e: any) {
      if (myId !== requestId) return;
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') {
        error = c.requestTimeout;
      } else {
        error = t.scanFailed;
      }
    } finally {
      if (myId === requestId) loading = false;
    }
  }

  function summary(results: PortScanEntry[]): { open: number; closed: number; filtered: number; unverifiable: number } {
    let open = 0, closed = 0, filtered = 0, unverifiable = 0;
    for (const r of results) {
      if (r.status === "open") open++;
      else if (r.status === "closed") closed++;
      else if (r.status === "unverifiable") unverifiable++;
      else filtered++;
    }
    return { open, closed, filtered, unverifiable };
  }

  const summaryLevel = $derived.by<Level>(() => {
    if (!result) return 'info';
    const s = summary(result.results);
    return s.open > 0 ? 'info' : 'ok';
  });

  const fireToolComplete = useToolComplete("port-scan");
  let __ftcFirstRun = true;
  $effect(() => {
    host; customPorts; loading; error; result; requestId;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (error) { fireToolComplete('error'); return; }
    if (!result) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="port-host" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.hostLabel}</label>
      <input id="port-host" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={host} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && !e.isComposing && !loading && scan()} style="width: 100%;" />

      <label for="port-custom" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.customPortsLabel}</label>
      <input id="port-custom" type="text" bind:value={customPorts} placeholder={t.customPortsPlaceholder} onkeydown={(e) => e.key === 'Enter' && !e.isComposing && !loading && scan()} style="width: 100%;" />
      <div style="font-size: 11px; color: var(--color-text-muted);">{t.customPortsHint}</div>

      <button class="btn-primary" onclick={scan} disabled={loading || !host.trim()}>
        {loading ? t.scanning : t.scan}
      </button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}<div class="card sev-accent is-bad"><div class="card-body" style="color: var(--color-bad);">{error}</div></div>{/if}

  {#if result}
    {@const stats = summary(result.results)}
    <div class="card-header" style="padding: 12px 16px;">
      <span class="card-title">{t.results} &mdash; {result.host}</span>
    </div>

    <!-- Summary -->
    <div class="card sev-accent is-{summaryLevel}" style="margin-bottom: 16px;">
      <div class="card-body" style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-end;">
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: var(--color-info);">{stats.open}</div>
          <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">{t.statusOpen}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: var(--color-ok);">{stats.closed}</div>
          <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">{t.statusClosed}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: var(--color-warn);">{stats.filtered}</div>
          <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">{t.statusFiltered}</div>
        </div>
        {#if stats.unverifiable > 0}
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: var(--color-text-muted);">{stats.unverifiable}</div>
          <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">{t.statusUnverifiable}</div>
        </div>
        {/if}
        <div style="margin-left: auto;">
          <StatusBadge level={summaryLevel} size="sm" {lang} />
        </div>
      </div>
    </div>

    <!-- Results table -->
    <div class="card">
      <div class="card-body" style="padding: 0; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--color-border, #e5e7eb);">
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">{t.colPort}</th>
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">{t.colService}</th>
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">{t.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {#each result.results as entry}
              <tr style="border-bottom: 1px solid var(--color-border, #e5e7eb);">
                <td style="padding: 8px 16px; font-family: monospace; font-weight: 600;">{entry.port}</td>
                <td style="padding: 8px 16px; color: var(--color-text-muted);">{entry.service}</td>
                <td style="padding: 8px 16px;">
                  <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600;">
                    <StatusBadge level={portLevel(entry.status)} dotOnly size="sm" label={statusLabel(entry.status)} {lang} />
                    {statusLabel(entry.status)}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-top: 16px;">
      <div class="card-body" style="font-size: 12px; color: var(--color-text-muted);">
        {t.disclaimer}
      </div>
    </div>
  {/if}
  </div>
</div>
