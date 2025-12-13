export function kineticScroll(node: HTMLElement) {
  let isDragging = false;
  let startY = 0;
  let scrollTop = 0;
  let velocity = 0;
  let lastTime = 0;
  let lastY = 0;
  let frameId = 0;

  function handlePointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (
      target.closest('.mascot-container') ||
      target.closest('.graph-wrapper') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('.action-menu')
    ) {
      return;
    }

    e.preventDefault();

    isDragging = true;
    startY = e.clientY;
    scrollTop = node.scrollTop;
    lastY = e.clientY;
    lastTime = Date.now();
    velocity = 0;

    cancelAnimationFrame(frameId);
    document.body.style.cursor = 'grabbing';

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    e.preventDefault();

    const y = e.clientY;
    const dy = y - startY;

    node.scrollTop = scrollTop - dy;

    const now = Date.now();
    const dt = now - lastTime;
    if (dt > 0) {
      const dist = y - lastY;
      velocity = dist / dt;
    }

    lastY = y;
    lastTime = now;
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = '';

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const applyMomentum = () => {
      if (Math.abs(velocity) < 0.1) return;
      node.scrollTop -= velocity * 16;
      velocity *= 0.95;
      frameId = requestAnimationFrame(applyMomentum);
    };

    applyMomentum();
  }

  node.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);

  return {
    destroy() {
      node.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      cancelAnimationFrame(frameId);
    },
  };
}
