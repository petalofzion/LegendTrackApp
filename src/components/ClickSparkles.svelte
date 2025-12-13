<script lang="ts">
  import { onMount } from 'svelte';

  type Sparkle = {
    id: number;
    x: number;
    y: number;
    char: string;
  };

  const SPARKLE_CHARS = ['✨', '💖', '🌸', '⭐', '🎀', '🍬'];
  let sparkles = $state<Sparkle[]>([]);

  onMount(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mediaQuery?.matches) {
      return;
    }

    const timeouts = new Set<number>();

    function handleClick(e: MouseEvent) {
      const id = Date.now();
      const jitterX = (Math.random() - 0.5) * 24;
      const jitterY = (Math.random() - 0.5) * 16;
      const baseRise = -32;
      
      const sparkle = {
        id,
        x: e.clientX + jitterX,
        y: e.clientY + baseRise + jitterY,
        char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
      };
      
      sparkles = [...sparkles, sparkle];

      const timeoutId = window.setTimeout(() => {
        sparkles = sparkles.filter((s) => s.id !== id);
        timeouts.delete(timeoutId);
      }, 800);
      timeouts.add(timeoutId);
    }

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeouts.clear();
    };
  });
</script>

{#each sparkles as sparkle (sparkle.id)}
  <span class="click-sparkle" style:left="{sparkle.x}px" style:top="{sparkle.y}px">
    {sparkle.char}
  </span>
{/each}
