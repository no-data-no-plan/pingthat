<script lang="ts">
  import type { Snippet } from 'svelte';
  import { levelIcon, type Level } from '../../lib/severity';

  interface Props {
    level: Level;
    title: string;
    explanation?: string;
    children?: Snippet;
  }
  let { level, title, explanation = '', children }: Props = $props();
  const icon = $derived(levelIcon(level));
</script>

<div class="sev-banner is-{level}" role="group">
  <span class="sev-banner-ico" aria-hidden="true">{icon}</span>
  <div class="sev-banner-text">
    <div class="sev-banner-title">{title}</div>
    {#if explanation}<div class="sev-banner-exp">{explanation}</div>{/if}
  </div>
  {#if children}<div class="sev-banner-badge">{@render children()}</div>{/if}
</div>

<style>
  .sev-banner { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 10px; border: 1px solid var(--color-border); }
  /* solid left bar (NOT the -edge token, which fails 1.4.11 in isolation) */
  .sev-banner.is-ok   { background: var(--color-ok-dim);   border-left: 3px solid var(--color-ok); }
  .sev-banner.is-warn { background: var(--color-warn-dim); border-left: 3px solid var(--color-warn); }
  .sev-banner.is-bad  { background: var(--color-bad-dim);  border-left: 3px solid var(--color-bad); }
  .sev-banner.is-info { background: var(--color-info-dim); border-left: 3px solid var(--color-info); }
  .sev-banner-ico { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 700; flex: none; color: var(--color-bg); }
  .sev-banner.is-ok   .sev-banner-ico { background: var(--color-ok); }
  .sev-banner.is-warn .sev-banner-ico { background: var(--color-warn); }
  .sev-banner.is-bad  .sev-banner-ico { background: var(--color-bad); }
  .sev-banner.is-info .sev-banner-ico { background: var(--color-info); }
  .sev-banner-title { font-size: 14px; font-weight: 600; color: var(--color-text); }
  .sev-banner-exp { font-size: 12px; color: var(--color-text-muted); margin-top: 3px; }
  .sev-banner-badge { margin-left: auto; }
</style>
