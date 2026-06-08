<script lang="ts">
  import type { Level } from '../../lib/severity';
  import type { Letter } from '../../lib/grade';

  interface Props {
    letter: Letter;
    level: Level;
    ratio?: string;      // e.g. "4/6"; omitted for SSL
    ariaLabel?: string;  // full localized accessible name
  }
  let { letter, level, ratio = '', ariaLabel = '' }: Props = $props();
</script>

<div class="grade-badge is-{level}" role="img" aria-label={ariaLabel || `Grade ${letter}`}>
  <span class="grade-letter" aria-hidden="true">{letter}</span>
  {#if ratio}<span class="grade-chip" aria-hidden="true">{ratio}</span>{/if}
</div>

<style>
  .grade-badge { position: relative; width: 58px; height: 58px; border-radius: 12px; display: grid; place-items: center; flex: none; border: 1px solid; }
  .grade-letter { font-weight: 800; font-size: 30px; line-height: 1; color: var(--color-bg); }
  .grade-chip { position: absolute; top: -7px; right: -7px; background: var(--color-bg); border: 1px solid;
    border-radius: 999px; font-size: 10px; font-weight: 700; padding: 2px 6px; font-family: 'JetBrains Mono', monospace; }

  .grade-badge.is-ok   { background: var(--color-ok);   border-color: var(--color-ok-edge); }
  .grade-badge.is-warn { background: var(--color-warn); border-color: var(--color-warn-edge); }
  .grade-badge.is-bad  { background: var(--color-bad);  border-color: var(--color-bad-edge); }
  .grade-badge.is-info { background: var(--color-info); border-color: var(--color-info-edge); }

  .grade-badge.is-ok   .grade-chip { color: var(--color-ok);   border-color: var(--color-ok-edge); }
  .grade-badge.is-warn .grade-chip { color: var(--color-warn); border-color: var(--color-warn-edge); }
  .grade-badge.is-bad  .grade-chip { color: var(--color-bad);  border-color: var(--color-bad-edge); }
  .grade-badge.is-info .grade-chip { color: var(--color-info); border-color: var(--color-info-edge); }
</style>
