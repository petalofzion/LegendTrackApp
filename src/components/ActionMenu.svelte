<script lang="ts">
  interface Props {
    zenMode: boolean;
    toggleZenMode: () => void;
    isTauri: boolean;
    onSelectFile: () => void;
  }

  let { zenMode, toggleZenMode, isTauri, onSelectFile }: Props = $props();
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
      tabindex={-1}
    >
      📂
    </button>
  {/if}
</div>
