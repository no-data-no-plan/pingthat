<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { Lang } from "../i18n/index";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();

  let open = $state(false);

  const labels = $derived(
    lang === "es"
      ? {
          title: "Atajos de teclado",
          close: "Cerrar",
          dismiss: "Pulsa Esc para cerrar",
          shortcuts: [
            { keys: ["?"], desc: "Mostrar este panel" },
            { keys: ["Ctrl", "K"], desc: "Buscar herramientas" },
            { keys: ["/"], desc: "Buscar herramientas" },
            { keys: ["Esc"], desc: "Cerrar panel o limpiar búsqueda" },
          ],
        }
      : {
          title: "Keyboard shortcuts",
          close: "Close",
          dismiss: "Press Esc to close",
          shortcuts: [
            { keys: ["?"], desc: "Show this panel" },
            { keys: ["Ctrl", "K"], desc: "Search tools" },
            { keys: ["/"], desc: "Search tools" },
            { keys: ["Esc"], desc: "Close panel or clear search" },
          ],
        }
  );

  function isTypingTarget(t: EventTarget | null): boolean {
    if (!(t instanceof HTMLElement)) return false;
    const tag = t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (t.isContentEditable) return true;
    return false;
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // Don't intercept while user is typing into a real input
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      open = true;
      return;
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      open = false;
      return;
    }
    if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // Same input-guard as ?: only fires on a "page" focus context.
      if (isTypingTarget(e.target)) return;
      // Forward to a focusable search input when one exists. Common
      // selectors used across the AY tool pages + home.
      const search = document.querySelector<HTMLInputElement>(
        "input[id=sidebar-search], input[type=search], input[placeholder*=Search]",
      );
      if (search) {
        e.preventDefault();
        search.focus();
        search.select();
      }
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKey);
  });
  onDestroy(() => {
    document.removeEventListener("keydown", handleKey);
  });
</script>

{#if open}
  <div
    class="shortcut-modal-backdrop"
    role="presentation"
    onclick={() => (open = false)}
    onkeydown={(e) => { if (e.key === "Escape") open = false; }}
  >
    <div
      class="shortcut-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-modal-title"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="shortcut-modal-head">
        <h2 id="shortcut-modal-title">{labels.title}</h2>
        <button type="button" class="shortcut-modal-close" onclick={() => (open = false)} aria-label={labels.close}>×</button>
      </div>
      <ul class="shortcut-list">
        {#each labels.shortcuts as item}
          <li>
            <span class="shortcut-keys">
              {#each item.keys as k, i}
                {#if i > 0}<span class="shortcut-sep">+</span>{/if}<kbd>{k}</kbd>
              {/each}
            </span>
            <span class="shortcut-desc">{item.desc}</span>
          </li>
        {/each}
      </ul>
      <p class="shortcut-foot">{labels.dismiss}</p>
    </div>
  </div>
{/if}

<style>
  .shortcut-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  .shortcut-modal {
    background: var(--color-bg-secondary, #1a1a1d);
    border: 1px solid var(--color-border, #2a2a2d);
    border-radius: 8px;
    max-width: 420px;
    width: 100%;
    padding: 1.25rem 1.5rem;
    color: var(--color-text-primary, #e8e8e8);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
  .shortcut-modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  h2 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
  }
  .shortcut-modal-close {
    background: transparent;
    border: none;
    color: var(--color-text-muted, #888);
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.4rem;
    border-radius: 4px;
  }
  .shortcut-modal-close:hover {
    color: var(--color-text-primary, #e8e8e8);
  }
  .shortcut-modal-close:focus-visible {
    outline: 2px solid var(--color-accent, #c8f04a);
    outline-offset: 2px;
  }
  .shortcut-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .shortcut-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.85rem;
  }
  .shortcut-keys {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    flex-shrink: 0;
  }
  kbd {
    display: inline-block;
    padding: 0.15rem 0.45rem;
    background: var(--color-bg-tertiary, #2a2a2d);
    border: 1px solid var(--color-border, #3a3a3d);
    border-radius: 4px;
    font-family: ui-monospace, "SF Mono", Consolas, monospace;
    font-size: 0.8rem;
    color: var(--color-text-primary, #e8e8e8);
    min-width: 1.5rem;
    text-align: center;
  }
  .shortcut-sep {
    color: var(--color-text-muted, #888);
    font-size: 0.75rem;
  }
  .shortcut-desc {
    color: var(--color-text-muted, #aaa);
    text-align: right;
    flex: 1;
  }
  .shortcut-foot {
    font-size: 0.7rem;
    color: var(--color-text-muted, #888);
    margin: 0;
    text-align: center;
    border-top: 1px solid var(--color-border, #2a2a2d);
    padding-top: 0.75rem;
  }
</style>
