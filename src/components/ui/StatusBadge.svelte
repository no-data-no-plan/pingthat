<script lang="ts">
  import type { Lang } from '../../i18n/index';
  import { levelIcon, levelAria, type Level } from '../../lib/severity';

  interface Props {
    level: Level;
    label?: string;
    size?: 'md' | 'sm';
    dotOnly?: boolean;
    lang?: Lang;
  }
  let { level, label = '', size = 'md', dotOnly = false, lang = 'en' }: Props = $props();
  const icon = $derived(levelIcon(level));
  const aria = $derived(levelAria(level, lang));
</script>

{#if dotOnly}
  <span class="sev-dot is-{level} size-{size}" aria-hidden="true"></span>
  <span class="sr-only">{label || aria}</span>
{:else}
  <span class="sev-badge is-{level} size-{size}">
    <span class="sev-led" aria-hidden="true"></span>
    <span class="sev-icon" aria-hidden="true">{icon}</span>
    <span class="sev-label">{label || aria}</span>
  </span>
{/if}

<style>
  .sev-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; padding: 3px 9px; border-radius: 999px; border: 1px solid; }
  .sev-badge.size-sm { font-size: 10px; padding: 2px 7px; }
  .sev-led { width: 8px; height: 8px; border-radius: 50%; flex: none; }
  .sev-icon { font-weight: 700; }
  .sev-label { white-space: nowrap; }
  .sev-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
  .sev-dot.size-sm { width: 7px; height: 7px; }

  .sev-badge.is-ok   { color: var(--color-ok);   background: var(--color-ok-dim);   border-color: var(--color-ok-edge); }
  .sev-badge.is-warn { color: var(--color-warn); background: var(--color-warn-dim); border-color: var(--color-warn-edge); }
  .sev-badge.is-bad  { color: var(--color-bad);  background: var(--color-bad-dim);  border-color: var(--color-bad-edge); }
  .sev-badge.is-info { color: var(--color-info); background: var(--color-info-dim); border-color: var(--color-info-edge); }

  .sev-badge.is-ok   .sev-led { background: var(--color-ok); }
  .sev-badge.is-warn .sev-led { background: var(--color-warn); }
  .sev-badge.is-bad  .sev-led { background: var(--color-bad); }
  .sev-badge.is-info .sev-led { background: var(--color-info); }

  .sev-dot.is-ok   { background: var(--color-ok); }
  .sev-dot.is-warn { background: var(--color-warn); }
  .sev-dot.is-bad  { background: var(--color-bad); }
  .sev-dot.is-info { background: var(--color-info); }
</style>
