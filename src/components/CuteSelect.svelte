<script lang="ts">
  import { onMount } from 'svelte';

  type Option = string | { label: string; value: string };

  interface Props {
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    disabled?: boolean;
  }

  let { value, options, onChange, disabled = false }: Props = $props();

  let isOpen = $state(false);
  let containerRef: HTMLDivElement;

  // Derived state for normalized options
  let normalizedOptions = $derived(
    options.map((opt) => (typeof opt === 'string' ? { label: opt, value: opt } : opt))
  );

  let selectedOption = $derived(normalizedOptions.find((opt) => opt.value === value));
  let displayLabel = $derived(selectedOption ? selectedOption.label : value || 'Select...');

  function handleClickOutside(event: MouseEvent) {
    if (containerRef && !containerRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  function handleSelect(val: string) {
    if (disabled) return;
    try {
      onChange(val);
    } catch (e) {
      console.error('Select change error:', e);
    }
    isOpen = false;
  }

  function toggleOpen(event: MouseEvent) {
    if (disabled) return;
    event.stopPropagation();
    isOpen = !isOpen;
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div
  class="cute-select-container"
  class:open={isOpen}
  class:disabled={disabled}
  bind:this={containerRef}
>
  <button
    type="button"
    class="cute-select-trigger"
    onclick={toggleOpen}
    {disabled}
  >
    <span class="current-value">{displayLabel}</span>
    <span class="arrow">▼</span>
  </button>

  {#if isOpen}
    <div class="cute-select-menu">
      {#each normalizedOptions as option (option.value)}
        <button
          type="button"
          class="cute-option"
          class:selected={option.value === value}
          onclick={() => handleSelect(option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
