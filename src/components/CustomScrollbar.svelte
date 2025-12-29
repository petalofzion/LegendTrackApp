<!--
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let { target }: { target: HTMLElement | null } = $props();

  let trackRef: HTMLDivElement;
  let thumbRef: HTMLDivElement;
  
  let thumbHeight = $state(0);
  let thumbTop = $state(0);
  let isDragging = $state(false);
  let startY = 0;
  let startScrollTop = 0;

  // Sync scroll -> thumb
  const handleScroll = () => {
    if (!target || !trackRef) return;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const trackHeight = trackRef.clientHeight;
    
    // Calc ratio
    const scrollRatio = scrollTop / (scrollHeight - clientHeight);
    const maxThumbTop = trackHeight - thumbHeight;
    
    thumbTop = scrollRatio * maxThumbTop;
  };

  // Sync resize -> thumb size
  const handleResize = () => {
    if (!target || !trackRef) return;
    const { clientHeight, scrollHeight } = target;
    const trackHeight = trackRef.clientHeight;
    
    // If content fits, hide thumb (height 0 or hidden)
    if (scrollHeight <= clientHeight) {
        thumbHeight = 0;
        return;
    }

    const ratio = clientHeight / scrollHeight;
    thumbHeight = Math.max(30, trackHeight * ratio); // Min height 30px
    handleScroll(); // Update pos
  };

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    startY = e.clientY;
    startScrollTop = target!.scrollTop;
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    document.body.style.userSelect = 'none';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !target || !trackRef) return;
    
    const deltaY = e.clientY - startY;
    const trackHeight = trackRef.clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;
    const scrollSpace = target.scrollHeight - target.clientHeight;
    
    // Convert px delta to scroll delta
    const pxRatio = deltaY / maxThumbTop;
    target.scrollTop = startScrollTop + (pxRatio * scrollSpace);
  };

  const onMouseUp = () => {
    isDragging = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    document.body.style.userSelect = '';
  };

  const onTrackClick = (e: MouseEvent) => {
      if (e.target === thumbRef || !target) return;
      // Jump to position
      const rect = trackRef.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const percent = clickY / rect.height;
      target.scrollTop = percent * (target.scrollHeight - target.clientHeight);
  };

  $effect(() => {
    if (target) {
      target.addEventListener('scroll', handleScroll);
      const observer = new ResizeObserver(handleResize);
      observer.observe(target);
      observer.observe(target.firstElementChild as Element || target); // Watch content too
      
      handleResize();

      return () => {
        target.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      };
    }
  });

</script>

<div 
  bind:this={trackRef}
  class="custom-scrollbar-track"
  onclick={onTrackClick}
  role="scrollbar"
  aria-controls="scroll-target"
  aria-valuenow={thumbTop}
>
  <div 
    bind:this={thumbRef}
    class="custom-scrollbar-thumb"
    class:active={isDragging}
    style="height: {thumbHeight}px; transform: translateY({thumbTop}px);"
    onmousedown={onMouseDown}
    role="button"
    tabindex="0"
  ></div>
</div>

<style>
  .custom-scrollbar-track {
    position: absolute;
    top: 6px;
    right: 6px;
    bottom: 6px;
    width: 14px;
    z-index: 9999; /* Above everything */
    /* background: rgba(255, 255, 255, 0.2); Optional track bg */
    border-radius: 99px;
    cursor: var(--cursor-paw) !important; /* Force Paw */
  }

  .custom-scrollbar-thumb {
    width: 100%;
    background-color: #f06ea9;
    background-image: linear-gradient(135deg, #ffe6f2 0%, #ff9fdc 30%, #f06ea9 100%);
    border-radius: 20px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    background-clip: padding-box;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.1);
    cursor: var(--cursor-paw) !important; /* Force Paw */
    transition: background-color 0.2s, border-color 0.2s, width 0.2s;
  }

  .custom-scrollbar-thumb:hover, .custom-scrollbar-thumb.active {
    background-image: linear-gradient(135deg, #fff0f8 0%, #ffbde4 30%, #ff5ca8 100%);
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 4px 10px rgba(240, 110, 169, 0.3);
  }
</style>
-->