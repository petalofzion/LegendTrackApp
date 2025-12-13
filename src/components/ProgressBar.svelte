<script lang="ts">
  interface Props {
    counts: Record<string, number>;
    total: number;
  }

  let { counts, total }: Props = $props();

  let percent = $derived.by(() => {
    if (total === 0) return 0;
    const mastered = counts['Mastered'] || 0;
    const stable = counts['Stable'] || 0;
    const inProgress = counts['In Progress'] || 0;
    const score = mastered * 1 + stable * 0.75 + inProgress * 0.25;
    return Math.round((score / total) * 100);
  });
</script>

{#if total > 0}
  <div class="progress-container">
    <div class="progress-label">
      <span>Level {Math.floor(percent / 10) + 1}</span>
      <span>{percent}% EXP</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style:width="{percent}%"></div>
      <div class="progress-glimmer" style:width="{percent}%"></div>
    </div>
  </div>
{/if}
