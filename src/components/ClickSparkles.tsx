import { useEffect, useState } from 'react';

type Sparkle = {
  id: number;
  x: number;
  y: number;
  char: string;
};

const SPARKLE_CHARS = ['✨', '💖', '🌸', '⭐', '🎀', '🍬'];

export function ClickSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mediaQuery?.matches) {
      return;
    }
	    const timeouts = new Set<number>();
	    const handleClick = (e: MouseEvent) => {
	      const id = Date.now();
	      const jitterX = (Math.random() - 0.5) * 24; // ±12px
	      const jitterY = (Math.random() - 0.5) * 16; // ±8px
	      const baseRise = -32; // float above cursor
	      const sparkle = {
	        id,
	        x: e.clientX + jitterX,
	        y: e.clientY + baseRise + jitterY,
	        char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
	      };
	      setSparkles((prev) => [...prev, sparkle]);
      const timeoutId = window.setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
        timeouts.delete(timeoutId);
      }, 800);
      timeouts.add(timeoutId);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeouts.clear();
    };
  }, []);

  return (
    <>
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="click-sparkle"
          style={{ left: sparkle.x, top: sparkle.y }}
        >
          {sparkle.char}
        </span>
      ))}
    </>
  );
}
