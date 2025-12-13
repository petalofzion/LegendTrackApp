import { useEffect, useRef, type RefObject } from 'react';

export function useKineticScroll(containerRef: RefObject<HTMLElement | null>) {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const velocity = useRef(0);
  const lastTime = useRef(0);
  const lastY = useRef(0);
  const frameId = useRef<number>(0);

  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore if clicking on interactive elements
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

      // CRITICAL: Prevent default to stop text selection and native drag
      e.preventDefault();

      isDragging.current = true;
      startY.current = e.clientY;
      scrollTop.current = scrollContainer.scrollTop; 
      lastY.current = e.clientY;
      lastTime.current = Date.now();
      velocity.current = 0;
      
      cancelAnimationFrame(frameId.current);
      document.body.style.cursor = 'grabbing';
      
      // Capture on the scroll container itself if possible, or target
      // Capturing on target is fine as long as we prevent default
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch (err) {
        // Ignore capture errors
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();

      const y = e.clientY;
      const dy = y - startY.current;
      
      scrollContainer.scrollTop = scrollTop.current - dy;

      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        const dist = y - lastY.current;
        velocity.current = dist / dt; 
      }
      
      lastY.current = y;
      lastTime.current = now;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
          // Ignore
      }

      const applyMomentum = () => {
        if (Math.abs(velocity.current) < 0.1) return;

        scrollContainer.scrollTop -= velocity.current * 16;
        velocity.current *= 0.95; 

        frameId.current = requestAnimationFrame(applyMomentum);
      };
      
      applyMomentum();
    };

    // Attach to the container itself? No, window is safer for "drag anywhere" 
    // IF the user misses the container (e.g. margin). 
    // BUT we want to drag the background. The background IS the container (.app).
    // Let's attach to the container ref. This is more React-idiomatic.
    // Wait, the user said "click and hold and drag the app up".
    // If we attach to scrollContainer, we only catch clicks ON it.
    // Since .app covers 100vh, this is perfect.
    
    const element = scrollContainer;
    element.addEventListener('pointerdown', handlePointerDown);
    // Move/Up must be on window to catch drags that leave the window/element bounds
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      cancelAnimationFrame(frameId.current);
    };
  }, [containerRef]);
}