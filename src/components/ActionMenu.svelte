<script lang="ts">
  import { triggerConfetti } from '../utils/confetti';

  interface Props {
    zenMode: boolean;
    toggleZenMode: () => void;
    isTauri: boolean;
    onSelectFile: () => void;
  }

  let { zenMode, toggleZenMode, isTauri, onSelectFile }: Props = $props();

  function handleSaveApiKey() {
    const current = localStorage.getItem('legendtrack_api_key') || '';
    // Standard prompt, synchronous to ensure browser allows it
    const key = prompt("Enter your OpenAI/Anthropic API Key for the Grimoire:", current);
    
    if (key !== null) {
      if (key.trim()) {
        localStorage.setItem('legendtrack_api_key', key.trim());
        triggerConfetti();
      } else {
        localStorage.removeItem('legendtrack_api_key');
      }
    }
  }
</script>

<div class="action-menu" role="group" aria-label="Quick Actions">
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
      onclick={onSelectFile}
      title="Switch Tracker File"
    >
      📂
    </button>
  {/if}

  <!-- Grimoire Key Action -->
  <button
    class="action-button api-button"
    onclick={handleSaveApiKey}
    title="Set Grimoire Key"
  >
    🔮
  </button>
</div>
