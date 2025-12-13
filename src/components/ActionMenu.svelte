<script lang="ts">
  import { triggerConfetti } from '../utils/confetti';
  import { loadFromFile, selectTrackerFile, loadData } from '../services/tracker';
  import { topics, projects, showApiKeyModal } from '../stores';
  
  interface Props {
    zenMode: boolean;
    toggleZenMode: () => void;
    isTauri: boolean;
    onSelectFile: () => void;
  }

  let { zenMode, toggleZenMode, isTauri, onSelectFile }: Props = $props();
  let isInteracting = $state(false);

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
    isOpen = false;
  }
  
  async function handleFolderClick() {
    isInteracting = true;
    if (isTauri) {
        const path = await selectTrackerFile();
        if (path) {
            try {
                const data = await loadData();
                topics.set(data.topics);
                projects.set(data.projects);
                triggerConfetti();
            } catch (err) {
                console.error(err);
                alert('Failed to load data from ' + path);
            }
        }
        isInteracting = false;
        isOpen = false; // Close menu after selection
    } else {
        fileInput.click();
        isOpen = false; 
    }
  }

  function handleOpenKeyModal() {
    $showApiKeyModal = true;
    isOpen = false; // Close menu so it's clean
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
