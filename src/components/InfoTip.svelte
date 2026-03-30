<script lang="ts">
  interface Props { text: string; }
  let { text }: Props = $props();
</script>

<span class="info-tip">
  <span class="info-tip-icon">?</span>
  <span class="info-tip-popup">{text}</span>
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
    display: none;
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 400;
    line-height: 1.5;
    color: var(--color-text-primary);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    white-space: normal;
    width: max-content;
    max-width: 260px;
    z-index: 50;
    pointer-events: none;
  }

  .info-tip:hover .info-tip-icon {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }

  .info-tip:hover .info-tip-popup {
    display: block;
  }
</style>
