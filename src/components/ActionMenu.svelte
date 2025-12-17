<script lang="ts">
  import { triggerConfetti } from '../utils/confetti';
  import { loadFromFile } from '../services/tracker';
  import { topics, projects, showApiKeyModal, nexusMode, covenMode } from '../stores';
  
  interface Props {
    zenMode: boolean;
    toggleZenMode: () => void;
    isTauri: boolean;
    onSelectFile: () => void;
  }

  let { zenMode, toggleZenMode, isTauri, onSelectFile }: Props = $props();
  let isInteracting = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      try {
        const data = await loadFromFile(file);
        topics.set(data.topics);
        projects.set(data.projects);
        triggerConfetti();
      } catch (err) {
        console.error(err);
        alert('Failed to load file: ' + err);
      }
    }
    isInteracting = false;
  }
  
  async function handleFolderClick() {
    if (isTauri) {
        isInteracting = true;
        try {
            await onSelectFile();
        } finally {
            isInteracting = false;
        }
    } else {
        fileInput?.click();
    }
  }

  function handleOpenKeyModal() {
    $showApiKeyModal = true;
  }
</script>

<!-- Note: We use 'isOpen' implicitly via CSS hover, but 'isInteracting' helps lock it open for file dialogs -->
<!-- However, since we removed the JS-based isOpen logic for hover, we rely on CSS. -->
<!-- Wait, the previous ActionMenu used a mix. -->
<!-- Let's stick to the CSS-hover + .interacting class logic which works well. -->

<div class="action-menu" class:interacting={isInteracting} role="group" aria-label="Quick Actions">
  <!-- Main Trigger (Zen Mode) -->
  <button
    class="action-button zen-button"
    onclick={toggleZenMode}
    title={zenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
  >
    {zenMode ? '🌸' : '🧘‍♀️'}
  </button>

  <!-- Nexus Toggle -->
  <button
    class="action-button nexus-button"
    onclick={() => $nexusMode = !$nexusMode}
    title="Toggle Nexus Mode (Keystones)"
    tabindex={-1}
  >
    {$nexusMode ? '👑' : '💎'}
  </button>

  <!-- Coven Toggle -->
  <button
    class="action-button coven-button"
    onclick={() => $covenMode = !$covenMode}
    title="Toggle Coven Mode (Clusters)"
    tabindex={-1}
  >
    {$covenMode ? '✨' : '🕸️'}
  </button>

  <!-- Secondary Action (File Select) - Only in Tauri -->
  {#if isTauri}
    <button
      class="action-button file-button"
      onclick={handleFolderClick}
      title="Switch Tracker File"
      tabindex={-1}
    >
      📂
    </button>
  {/if}

  <!-- Grimoire Key Action -->
  <button
    class="action-button api-button"
    onclick={handleOpenKeyModal}
    title="Set Grimoire Key"
    tabindex={-1}
  >
    🔮
  </button>
  
  {#if !isTauri}
    <input
      type="file"
      accept=".xlsx"
      class="hidden"
      bind:this={fileInput}
      onchange={handleFileSelect}
    />
  {/if}
</div>

<style>
  /* Nexus Button Styling */
  .nexus-button {
    z-index: 2;
    opacity: 0;
    transform: scale(0.5);
    border-color: #c0a3e5;
    color: #7e57c2;
  }

  .action-menu:hover .nexus-button,
  .action-menu.interacting .nexus-button {
    opacity: 1;
    transform: translateY(-80px) translateX(60px) scale(1);
    box-shadow: 0 8px 25px rgba(179, 157, 219, 0.3);
  }

  .action-menu:hover .nexus-button:hover,
  .action-menu.interacting .nexus-button:hover {
    transform: translateY(-80px) translateX(60px) scale(1.1) rotate(10deg);
    background: #f3e5f5;
  }

  /* Coven Button Styling */
  .coven-button {
    z-index: 3;
    opacity: 0;
    transform: scale(0.5);
    border-color: #ffc4dd;
    color: #ff5ca8;
  }

  .action-menu:hover .coven-button,
  .action-menu.interacting .coven-button {
    opacity: 1;
    transform: translateY(-140px) translateX(45px) scale(1);
    box-shadow: 0 8px 25px rgba(255, 182, 217, 0.3);
  }

  .action-menu:hover .coven-button:hover,
  .action-menu.interacting .coven-button:hover {
    transform: translateY(-140px) translateX(45px) scale(1.1) rotate(-8deg);
    background: #fff0f5;
  }
</style>
