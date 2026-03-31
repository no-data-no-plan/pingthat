<script lang="ts">
  interface Props { text: string; }
  let { text }: Props = $props();

  let visible = $state(false);
  let iconEl: HTMLSpanElement | undefined = $state();
  let popupStyle = $state('');

  function show() {
    if (!iconEl) return;
    const rect = iconEl.getBoundingClientRect();
    const x = Math.max(140, Math.min(window.innerWidth - 140, rect.left + rect.width / 2));
    const y = rect.top - 6;
    popupStyle = `top:${y}px;left:${x}px;`;
    visible = true;
  }

  function hide() {
    visible = false;
  }
</script>

<span class="info-tip" onmouseenter={show} onmouseleave={hide}>
  <span class="info-tip-icon" bind:this={iconEl}>?</span>
  {#if visible}
    <span class="info-tip-popup" style={popupStyle}>{text}</span>
  {/if}
</span>

<style>
  .info-tip {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: default;
    margin-left: 4px;
    -webkit-user-select: none;
    user-select: none;
  }

  .info-tip-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    font-size: 9px;
    font-weight: 600;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    transition: color 0.15s, border-color 0.15s;
    pointer-events: none;
  }

  .info-tip-popup {
    position: fixed;
    transform: translate(-50%, -100%);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 400;
    line-height: 1.5;
    color: var(--color-text);
    background: var(--color-surface2);
    border: 1px solid var(--color-border2);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    white-space: normal;
    width: max-content;
    max-width: 260px;
    z-index: 9999;
    pointer-events: none;
  }

  .info-tip:hover .info-tip-icon {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
</style>
