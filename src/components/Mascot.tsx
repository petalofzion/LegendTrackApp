import { useEffect, useState, useRef, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type MascotMood = 'idle' | 'happy' | 'excited' | 'sleepy' | 'tickled' | 'bonked' | 'patted' | 'hugged';

const MESSAGES = [
  "You're doing great! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
  "Don't forget to hydrate! 💧",
  "One step at a time! 🐾",
  "Believe in the me that believes in you! 🐇",
  "Coding is magic! ✨",
  "Keep spiraling upward! 🌀",
  "So proud of your progress! 💖",
  "Need a break? Have a cookie! 🍪",
  "Everything is going to be daijoubu! 🌸",
];

const ZEN_MESSAGES = [
  "Soft paws... quiet mind... 🐾",
  "Cozy vibes only... uwu 💤",
  "Just floating... ☁️",
  "No stress, just naps... 🌙",
  "Slow blinks... ( ◡‿◡ )",
  "Peaceful potato mode... 🥔",
  "Gentle heart... soft code... 💖",
  "Shhh... we are resting... 🤫",
];

const SLEEPY_MESSAGES = [
  "Zzz... 💤",
  "Nap time... 🌙",
  "Dreaming of bugs... 🐛",
  "Five more minutes... 🛌",
  "Charging up... 🔋",
];

const HAPPY_MESSAGES = [
  "Yay! Good choice! 🌟",
  "Ooh, that's a fun one! 💖",
  "Learning is magic! 📚✨",
  "Sparkles for you! ✨",
  "Nice pick! (ﾉ◕ヮ◕)ﾉ",
  "Let's learn! 🫧🍬",
];

const ZEN_HAPPY_MESSAGES = [
  "Ooh... calming choice... 🍵",
  "Soft yay... (ﾉ´ヮ`)ﾉ",
  "Gentle sparkles... ✨",
  "Happy stillness... 🌸",
  "So soothing... uwu",
];

// Arrays of GIFs for variety
const GIF_COLLECTIONS: Record<string, string[]> = {
  idle: [
    'https://media.tenor.com/aBQS2J83jfIAAAAi/lina.gif', // Hello Kitty Heart Dance
    'https://media.tenor.com/B3uqC9kIDXMAAAAi/cute-shine.gif', // Cute Shine
    'https://media.tenor.com/Zm0_IipQgygAAAAi/we-bare-bears-polar-bear.gif', // Bear
    'https://media.tenor.com/PaYEcjSLOp8AAAAi/miku.gif', // Miku
    'https://media.tenor.com/WILOSfQPu-AAAAAi/my-melodoy.gif', // My Melody
  ],
  zen_idle: [
    'https://media.tenor.com/Nu4z3OigzBsAAAAj/love.gif', // Kuromi Sitting
    'https://media.tenor.com/-mzxLLeBM20AAAAj/heart.gif', // Sparkle Heart Potion
    'https://media.tenor.com/FpJqZFzHWiUAAAAj/ño.gif', // Cat Playing with Heart
    'https://media.tenor.com/pR71dKbKC5MAAAAi/anime-sweet.gif', // Strawberry Treat
    'https://media.tenor.com/ouQzDmgC9CwAAAAi/miku-vocaloid.gif', // Miku Idle Sway
    'https://media.tenor.com/ZbWenQG7CL8AAAAj/mythikore-anime-girl.gif', // Reading Upside Down
  ],
  happy: [
    'https://media.tenor.com/J_rcorOu8_UAAAAi/kuromi-happy.gif', // Kuromi Happy
    'https://media.tenor.com/tJzeN0ztRNcAAAAi/hello-kitty-hello-kiyty.gif', // Hello Kitty
    'https://media.tenor.com/nzITIBWEtzAAAAAi/cute.gif', // Generic Cute
  ],
  zen_happy: [
    'https://media.tenor.com/-Da7-Xl_gGEAAAAj/anime-dancing.gif', // Clapping Dance
    'https://media.tenor.com/nVWK_eK2DUAAAAAi/hiiragi-kagami-kagami-hiiragi.gif', // Hip Sway Dance
    'https://media.tenor.com/kWgpUWMtrjcAAAAi/evil-evil-lums.gif', // Bounce Dance Red
    'https://media.tenor.com/nmbg1iV82bwAAAAi/akari-dance.gif', // Finger Guns Dance
    'https://media.tenor.com/rMIo6HqaZdoAAAAi/honkai-star-rail-anime.gif', // Sway Cheer Chibi
    'https://media.tenor.com/HqEhm5f-sqUAAAAj/chika-fujiwara.gif', // Chika Dance
  ],
  excited: [
    'https://media.tenor.com/Rp0U7bdOhSUAAAAi/anime.gif', // Jumping Chibi
    'https://media.tenor.com/9nKcOUBEhcQAAAAi/cat-roll.gif', // Cat Roll
  ],
  sleepy: [
    'https://media.tenor.com/qwxYmUVn4pIAAAAi/sleeping-cat.gif', // Sleeping Cat
  ],
  zen_sleepy: [
    'https://media.tenor.com/ylJUUkdoHj4AAAAj/kotqcnee.gif', // Kotqcnee Sleep
    'https://media.tenor.com/CGTB9wlnCI0AAAAi/mobile-legends-bang-bang.gif', // Bang Bang Sleep
    'https://media.tenor.com/IjX29sgxJVAAAAAi/sleeping-cute.gif', // Generic Cute Sleep
  ],
  tickled: [
    'https://media.tenor.com/uZNHR3i3uoUAAAAi/cute-anime.gif', // Oh noess / Nervous
    'https://media.tenor.com/bR-rVkqeEucAAAAi/to-funny.gif', // Laughing
    'https://media.tenor.com/EBQrxbcjeJEAAAAi/anime-girl.gif', // Giggle
  ],
  bonked: [
    'https://media.tenor.com/FvrlXTu7R2YAAAAi/bonk-kawaii.gif', // Kawaii Bonk
    'https://media.tenor.com/IA52vxQn1BUAAAAj/anime-eto.gif', // Eto... Bonk
    'https://media.tenor.com/R67vwlRz6bcAAAAi/chika-bonk.gif', // Chika Bonk
  ],
  patted: [
    'https://media.tenor.com/IEbt2-AqtnkAAAAj/anime-flappy.gif', // Flappy Pat
    'https://media.tenor.com/W9meTTiZtugAAAAi/anime-heart.gif', // Heart Pat
    'https://media.tenor.com/z8n-3I77BXEAAAAi/korone-pat.gif', // Korone Pat
  ],
  hugged: [
    'https://media.tenor.com/zxe5TogaDzMAAAAi/hug-anime-hug.gif', // Special Sleepy Hug
  ]
};

type MascotPosition = { x: number; y: number };

const MASCOT_STORAGE_KEY = 'legendtrack-mascot-position';
const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isValidStoredPosition = (value: unknown): value is MascotPosition => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.x === 'number' && typeof record.y === 'number';
};

function getInitialPosition(): MascotPosition {
  if (typeof window === 'undefined') {
    return { x: 24, y: 24 };
  }
  // Aim for bottom-right corner but leave breathing room near the edges.
  return {
    x: window.innerWidth - 200,
    y: window.innerHeight - 220,
  };
}

interface MascotProps {
  mood?: 'idle' | 'happy';
  customMessage?: string | null;
  triggerKey?: string | null;
  zenMode?: boolean;
}

export function Mascot({ mood = 'idle', customMessage, triggerKey, zenMode = false }: MascotProps) {
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [internalMood, setInternalMood] = useState<MascotMood>('idle');
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragMeta = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false });
  const skipClickRef = useRef(false);
  const [position, setPosition] = useState<MascotPosition>(() => getInitialPosition());
  const [isDragging, setIsDragging] = useState(false);

  // Refs to track active timers for cleanup
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clampToViewport = useCallback(
    (next: MascotPosition) => {
      if (typeof window === 'undefined') {
        return next;
      }
      const padding = 16;
      const width = containerRef.current?.offsetWidth ?? 200;
      const height = containerRef.current?.offsetHeight ?? 200;
      const maxX = Math.max(padding, window.innerWidth - width - padding);
      const maxY = Math.max(padding, window.innerHeight - height - padding);
      return {
        x: clampValue(next.x, padding, maxX),
        y: clampValue(next.y, padding, maxY),
      };
    },
    [],
  );

  const moveMascot = useCallback(
    (raw: MascotPosition, persist = false) => {
      setPosition((prev) => {
        const clamped = clampToViewport(raw);
        if (persist && typeof window !== 'undefined') {
          try {
            localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(clamped));
          } catch {
            // Ignore quota/unavailable storage errors.
          }
        }
        if (prev.x === clamped.x && prev.y === clamped.y) {
          return prev;
        }
        return clamped;
      });
    },
    [clampToViewport],
  );

  // Helper to safely set mood with auto-reset
  const setTemporaryMood = (newMood: MascotMood, duration: number) => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
    setInternalMood(newMood);
    
    // Choose random GIF from the collection for this mood immediately
    // Handle special zen logic for happy/idle/sleepy
    let collectionKey: string = newMood;
    if (zenMode) {
        if (newMood === 'happy') collectionKey = 'zen_happy';
        if (newMood === 'idle') collectionKey = 'zen_idle';
        if (newMood === 'sleepy') collectionKey = 'zen_sleepy';
    }

    if (GIF_COLLECTIONS[collectionKey]) {
        setCurrentGifIndex(Math.floor(Math.random() * GIF_COLLECTIONS[collectionKey].length));
    }

    moodTimer.current = setTimeout(() => {
        setInternalMood('idle');
        moodTimer.current = null;
    }, duration);
  };

  // Helper to safely set message with auto-clear
  const setTemporaryMessage = (msg: string | null, duration: number) => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
      setCurrentMessage(msg);
      if (msg) {
          messageTimer.current = setTimeout(() => {
              setCurrentMessage(null);
              messageTimer.current = null;
          }, duration);
      }
  };

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (moodTimer.current) clearTimeout(moodTimer.current);
          if (messageTimer.current) clearTimeout(messageTimer.current);
      };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let starting: MascotPosition | null = null;
    try {
      const stored = localStorage.getItem(MASCOT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isValidStoredPosition(parsed)) {
          starting = parsed;
        }
      }
    } catch {
      starting = null;
    }
    const fallback = starting ?? getInitialPosition();
    moveMascot(fallback);
  }, [moveMascot]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setPosition((prev) => clampToViewport(prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampToViewport]);

  // Sync prop mood to internal state but allow overrides
  useEffect(() => {
    if (mood !== 'idle') {
      setTemporaryMood(mood, 4000);
      // Trigger happy message if mood is happy
      if (mood === 'happy') {
          const happyMsgs = zenMode ? ZEN_HAPPY_MESSAGES : HAPPY_MESSAGES;
          const happyMsg = happyMsgs[Math.floor(Math.random() * happyMsgs.length)];
          setTemporaryMessage(happyMsg, 4000);
      }
    }
  }, [mood, triggerKey, zenMode]);

  // Cycle idle animations periodically for liveliness
  useEffect(() => {
    if (internalMood === 'idle') {
      const intervalDuration = zenMode ? 15000 : 8000; // Slower pace in Zen Mode
      
      const interval = setInterval(() => {
        // Change GIF
        const collectionKey = zenMode ? 'zen_idle' : 'idle';
        const collection = GIF_COLLECTIONS[collectionKey];
        if (collection) {
            setCurrentGifIndex((prev) => (prev + 1) % collection.length);
        }
        
        // Occasionally act sleepy?
        // Zen Mode: Lower chance (90% skip), Longer duration (12s)
        const chance = zenMode ? 0.9 : 0.8;
        const duration = zenMode ? 12000 : 8000;

        if (Math.random() > chance) {
             setTemporaryMood('sleepy', duration); 
             // Only set message for normal mode, zen mode handles it quietly or via sleep talk
             if (!zenMode) {
                const sleepyMsg = SLEEPY_MESSAGES[Math.floor(Math.random() * SLEEPY_MESSAGES.length)];
                setTemporaryMessage(sleepyMsg, duration);
             }
        }
      }, intervalDuration); 

      return () => clearInterval(interval);
    }
  }, [internalMood, zenMode]);

  // Specific logic for sleep-talking (mumbling while asleep)
  useEffect(() => {
      if (internalMood === 'sleepy') {
          // Check every 2 seconds if we should mumble a sleep message
          // Zen Mode: Less frequent mumbling
          const checkInterval = zenMode ? 4000 : 2000;
          
          const sleepTalkInterval = setInterval(() => {
              if (Math.random() > 0.75) { // 25% chance to mumble
                  if (zenMode) {
                      setTemporaryMessage("...zzz... 💕", 3000); // Zen mumble is simpler
                  } else {
                      const sleepyMsg = SLEEPY_MESSAGES[Math.floor(Math.random() * SLEEPY_MESSAGES.length)];
                      setTemporaryMessage(sleepyMsg, 3000); // Show for 3s
                  }
              }
          }, checkInterval);
          
          return () => clearInterval(sleepTalkInterval);
      }
  }, [internalMood, zenMode]);

  // Random chatter (only if not sleepy)
  useEffect(() => {
    if (internalMood === 'sleepy') return;

    const intervalDuration = zenMode ? 20000 : 12000; // Less frequent chatter in Zen Mode
    const chance = zenMode ? 0.6 : 0.7; // Lower chance in Zen Mode

    const interval = setInterval(() => {
      if (Math.random() > chance) { 
        const messages = zenMode ? ZEN_MESSAGES : MESSAGES;
        const msg = messages[Math.floor(Math.random() * messages.length)];
        setTemporaryMessage(msg, 4000);
      }
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [internalMood, zenMode]);

  const displayMessage = customMessage || currentMessage;
  
  // Safe access to GIF
  let collectionKey: string = internalMood;
  if (zenMode) {
      if (internalMood === 'idle') collectionKey = 'zen_idle';
      if (internalMood === 'happy') collectionKey = 'zen_happy';
      if (internalMood === 'sleepy') collectionKey = 'zen_sleepy';
  }
  
  const collection = GIF_COLLECTIONS[collectionKey] || GIF_COLLECTIONS['idle'];
  const safeIndex = currentGifIndex % collection.length;
  const currentGif = collection[safeIndex];

  // Logic to pick reaction type on click
  const handleMascotClick = () => {
      if (skipClickRef.current) {
          skipClickRef.current = false;
          return;
      }
      // Special Interaction: Clicking while sleeping triggers a hug
      if (internalMood === 'sleepy') {
          if (zenMode) {
              // Zen Sleep Click: Gentle Purr, no waking up
              setTemporaryMessage("Purrr... zzz... 💕", 2500);
              // Don't change mood, stay sleepy
          } else {
              // Normal Sleep Click: Wake up hug
              setTemporaryMood('hugged', 4500); // Longer duration for the long hug gif
              setTemporaryMessage("Grr... you woke me! Now you get penalty hugs! 😽💕", 4500);
          }
          return;
      }

      if (zenMode) {
          // Gentler interactions in Zen Mode
          setTemporaryMessage("So soft... ☁️", 2500);
          return;
      }

      // Normal Click Interactions
      const roll = Math.random();
      let reactionType: MascotMood = 'tickled';
      let reactionText = "Eep! Too ticklish! >_<";

      if (roll < 0.33) {
          // Tickle (33%)
          reactionType = 'tickled';
          const texts = ["Eep! Too ticklish! >_<", "Hehe stop it! 💕", "Kyaa! No touchy!"];
          reactionText = texts[Math.floor(Math.random() * texts.length)];
      } else if (roll < 0.66) {
          // Bonk (33%)
          reactionType = 'bonked';
          const texts = ["Ouchie! Bonk! 💢", "Why you bonk? T_T", "Bonk! Go to code jail!"];
          reactionText = texts[Math.floor(Math.random() * texts.length)];
      } else {
          // Pat (33%)
          reactionType = 'patted';
          const texts = ["Purr... headpats! 🌸", "So cozy... UwU", "Yay! Huggies! 🤗", "More pats pls! 💕"];
          reactionText = texts[Math.floor(Math.random() * texts.length)];
      }

      setTemporaryMood(reactionType, 2500);
      setTemporaryMessage(reactionText, 2500);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const meta = dragMeta.current;
      meta.startX = event.clientX;
      meta.startY = event.clientY;
      meta.offsetX = event.clientX - position.x;
      meta.offsetY = event.clientY - position.y;
      meta.moved = false;
      setIsDragging(true);
      skipClickRef.current = false;
      event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const meta = dragMeta.current;
      const rawPosition = {
          x: event.clientX - meta.offsetX,
          y: event.clientY - meta.offsetY,
      };
      const distance = Math.hypot(event.clientX - meta.startX, event.clientY - meta.startY);
      if (!meta.moved) {
          if (distance <= 4) {
              return;
          }
          meta.moved = true;
          skipClickRef.current = true;
      }
      moveMascot(rawPosition);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setIsDragging(false);
      const meta = dragMeta.current;
      if (meta.moved) {
          moveMascot(
              {
                  x: event.clientX - meta.offsetX,
                  y: event.clientY - meta.offsetY,
              },
              true,
          );
          setTimeout(() => {
              skipClickRef.current = false;
          }, 0);
      } else {
          skipClickRef.current = false;
      }
      dragMeta.current = { startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false };
  };
  
  return (
    <div
      className={`mascot-container ${isDragging ? 'dragging' : ''}`}
      ref={containerRef}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {displayMessage && (
        <div className="mascot-bubble">
          {displayMessage}
        </div>
      )}
      <img
        src={currentGif}
        alt="Mascot"
        className="mascot-image"
        onMouseEnter={() => {
            // Only get excited if we are NOT sleepy AND not in Zen Mode
            if (internalMood === 'idle' && !zenMode) {
                if (moodTimer.current) clearTimeout(moodTimer.current);
                setInternalMood('excited');
                // Pick random excited GIF
                setCurrentGifIndex(Math.floor(Math.random() * GIF_COLLECTIONS['excited'].length));
            }
        }}
        onMouseLeave={() => {
            // Only go back to idle if we were excited
            if (internalMood === 'excited') {
                setInternalMood('idle');
            }
        }}
        onClick={handleMascotClick}
      />
    </div>
  );
}
