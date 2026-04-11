<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getUrlParser } from '../i18n/components';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getUrlParser(lang));

  let input = $state("");
  let parsed = $state<{
    href: string; protocol: string; host: string; hostname: string; port: string;
    pathname: string; search: string; hash: string; origin: string;
    params: [string, string][];
  } | null>(null);
  let error = $state("");

  function parse() {
    if (!input.trim()) { parsed = null; error = ""; return; }
    try {
      const url = new URL(input.trim());
      parsed = {
        href: url.href, protocol: url.protocol, host: url.host, hostname: url.hostname,
        port: url.port || t.defaultPort, pathname: url.pathname, search: url.search,
        hash: url.hash, origin: url.origin, params: [...url.searchParams.entries()],
      };
      error = "";
    } catch {
      error = t.invalidUrl;
      parsed = null;
    }
  }

  function handleInput() { parse(); }

  function copySample() { input = "https://example.com:8080/path/to/page?name=john&age=30&tags=a&tags=b#section-2"; parse(); }

  function copy(val: string) { navigator.clipboard.writeText(val); }

  const fields = $derived(parsed ? [
    { label: "href", value: parsed.href },
    { label: "protocol", value: parsed.protocol },
    { label: "origin", value: parsed.origin },
    { label: "hostname", value: parsed.hostname },
    { label: "host", value: parsed.host },
    { label: "port", value: parsed.port },
    { label: "pathname", value: parsed.pathname },
    { label: "search", value: parsed.search || t.none },
    { label: "hash", value: parsed.hash || t.none },
  ] : []);
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="urlparser-url" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.urlLabel}</label>
      <input id="urlparser-url" type="text" bind:value={input} placeholder={t.placeholder} oninput={handleInput} onkeypress={(e) => e.key === 'Enter' && parse()} style="width: 100%;" />
      <div style="display: flex; gap: 8px;">
        <button class="btn-secondary" onclick={copySample} style="font-size: 12px;">{t.sample}</button>
        <button class="btn-secondary" onclick={() => { input = ""; parsed = null; error = ""; }} style="font-size: 12px;">{t.clear}</button>
      </div>
    </div>
  </div>

  {#if error}
    <div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>
  {/if}

  {#if parsed}
    <div class="card">
      <div class="card-header"><span class="card-title">{t.parsedUrl}</span></div>
      <div class="card-body">
        {#each fields as field}
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
            <span style="font-size: 11px; font-weight: 600; color: var(--color-accent-fg); text-transform: uppercase; min-width: 80px;">{field.label}</span>
            <span style="font-family: monospace; font-size: 13px; word-break: break-all; flex: 1; margin: 0 12px;">{field.value}</span>
            <button class="btn-secondary" style="font-size: 11px; padding: 2px 8px;" onclick={() => copy(field.value)}>{t.copy}</button>
          </div>
        {/each}
      </div>
    </div>

    {#if parsed.params.length > 0}
      <div class="card">
        <div class="card-header"><span class="card-title">{t.queryParams} ({parsed.params.length})</span></div>
        <div class="card-body">
          {#each parsed.params as [key, value]}
            <div style="display: flex; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--color-border); font-size: 13px;">
              <span style="font-weight: 600; color: var(--color-accent-fg); font-family: monospace;">{key}</span>
              <span style="color: var(--color-text-muted);">=</span>
              <span style="font-family: monospace; word-break: break-all;">{value}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
