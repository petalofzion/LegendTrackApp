<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Topic } from '../types';
  import { serializeContext, ai } from '../services/ai';

  type MascotMood = 'idle' | 'happy' | 'excited' | 'sleepy' | 'tickled' | 'bonked' | 'patted' | 'hugged' | 'thinking';
  type MascotPosition = { x: number; y: number };

  interface Props {
    mood?: 'idle' | 'happy';
    customMessage?: string | null;
    triggerKey?: string | null;
    zenMode?: boolean;
    focusedTopic?: Topic | null;
    toggleZenMode?: () => void;
    onClearFocus?: () => void;
  }

  let { 
    mood = 'idle', 
    customMessage = null, 
    triggerKey = null, 
    zenMode = false, 
    focusedTopic = null,
    toggleZenMode,
    onClearFocus
  }: Props = $props();

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

  const GIF_COLLECTIONS: Record<string, string[]> = {
    idle: [
      'https://media.tenor.com/aBQS2J83jfIAAAAi/lina.gif',
      'https://media.tenor.com/B3uqC9kIDXMAAAAi/cute-shine.gif',
      'https://media.tenor.com/Zm0_IipQgygAAAAi/we-bare-bears-polar-bear.gif',
      'https://media.tenor.com/PaYEcjSLOp8AAAAi/miku.gif',
      'https://media.tenor.com/WILOSfQPu-AAAAAi/my-melodoy.gif',
    ],
    zen_idle: [
      'https://media.tenor.com/Nu4z3OigzBsAAAAj/love.gif',
      'https://media.tenor.com/-mzxLLeBM20AAAAj/heart.gif',
      'https://media.tenor.com/FpJqZFzHWiUAAAAj/ño.gif',
      'https://media.tenor.com/pR71dKbKC5MAAAAi/anime-sweet.gif',
      'https://media.tenor.com/ouQzDmgC9CwAAAAi/miku-vocaloid.gif',
      'https://media.tenor.com/ZbWenQG7CL8AAAAj/mythikore-anime-girl.gif',
    ],
    happy: [
      'https://media.tenor.com/J_rcorOu8_UAAAAi/kuromi-happy.gif',
      'https://media.tenor.com/tJzeN0ztRNcAAAAi/hello-kitty-hello-kiyty.gif',
      'https://media.tenor.com/nzITIBWEtzAAAAAi/cute.gif',
    ],
    zen_happy: [
      'https://media.tenor.com/-Da7-Xl_gGEAAAAj/anime-dancing.gif',
      'https://media.tenor.com/nVWK_eK2DUAAAAAi/hiiragi-kagami-kagami-hiiragi.gif',
      'https://media.tenor.com/kWgpUWMtrjcAAAAi/evil-evil-lums.gif',
      'https://media.tenor.com/nmbg1iV82bwAAAAi/akari-dance.gif',
      'https://media.tenor.com/rMIo6HqaZdoAAAAi/honkai-star-rail-anime.gif',
      'https://media.tenor.com/HqEhm5f-sqUAAAAj/chika-fujiwara.gif',
    ],
    excited: [
      'https://media.tenor.com/Rp0U7bdOhSUAAAAi/anime.gif',
      'https://media.tenor.com/9nKcOUBEhcQAAAAi/cat-roll.gif',
    ],
    sleepy: [
      'https://media.tenor.com/qwxYmUVn4pIAAAAi/sleeping-cat.gif',
    ],
    zen_sleepy: [
      'https://media.tenor.com/ylJUUkdoHj4AAAAj/kotqcnee.gif',
      'https://media.tenor.com/CGTB9wlnCI0AAAAi/mobile-legends-bang-bang.gif',
      'https://media.tenor.com/IjX29sgxJVAAAAAi/sleeping-cute.gif',
    ],
    tickled: [
      'https://media.tenor.com/uZNHR3i3uoUAAAAi/cute-anime.gif',
      'https://media.tenor.com/bR-rVkqeEucAAAAi/to-funny.gif',
      'https://media.tenor.com/EBQrxbcjeJEAAAAi/anime-girl.gif',
    ],
    bonked: [
      'https://media.tenor.com/FvrlXTu7R2YAAAAi/bonk-kawaii.gif',
      'https://media.tenor.com/IA52vxQn1BUAAAAj/anime-eto.gif',
      'https://media.tenor.com/R67vwlRz6bcAAAAi/chika-bonk.gif',
    ],
    patted: [
      'https://media.tenor.com/IEbt2-AqtnkAAAAj/anime-flappy.gif',
      'https://media.tenor.com/W9meTTiZtugAAAAi/anime-heart.gif',
      'https://media.tenor.com/z8n-3I77BXEAAAAi/korone-pat.gif',
    ],
    hugged: [
      'https://media.tenor.com/zxe5TogaDzMAAAAi/hug-anime-hug.gif',
    ],
    thinking: [
        'https://media.tenor.com/M6q2oV1hD-sAAAAi/loading.gif',
        'https://media.tenor.com/RvCdcZ_XlQAAAAAi/anime-thinking.gif',
    ]
  };

  const MASCOT_STORAGE_KEY = 'legendtrack-mascot-position';
  const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const isValidStoredPosition = (value: unknown): value is MascotPosition => {
    if (!value || typeof value !== 'object') return false;
    const record = value as Record<string, unknown>;
    return typeof record.x === 'number' && typeof record.y === 'number';
  };

  function getInitialPosition(): MascotPosition {
    if (typeof window === 'undefined') {
      return { x: 24, y: 24 };
    }
    return {
      x: window.innerWidth - 200,
      y: window.innerHeight - 220,
    };
  }

  // State
  let currentMessage = $state<string | null>(null);
  let topicExplanation = $state<string | null>(null);
  let internalMood = $state<MascotMood>('idle');
  let currentGifIndex = $state(0);
  let displayBubble = $state(false);
  let position = $state<MascotPosition>(getInitialPosition());
  let isDragging = $state(false);
  
  // Chat State
  let chatOpen = $state(false);
  let userQuery = $state('');
  let isThinking = $state(false);
  let chatHistory = $state<Array<{role: 'user' | 'ai', text: string}>>([]);

  let containerRef: HTMLDivElement;
  let chatHistoryRef = $state<HTMLDivElement>(); // Ref for scrolling logic

  let bubbleTimer: ReturnType<typeof setTimeout> | null = null;
  let messageTimer: ReturnType<typeof setTimeout> | null = null;
  let moodTimer: ReturnType<typeof setTimeout> | null = null;
  let explanationTimer: ReturnType<typeof setTimeout> | null = null;
  let idleInterval: ReturnType<typeof setInterval> | null = null;
  let chatterInterval: ReturnType<typeof setInterval> | null = null;
  let sleepTalkInterval: ReturnType<typeof setInterval> | null = null;
  
  const bubbleFadeMs = 170;

  // Dragging state
  let dragMeta = { startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false };
  let skipClick = false;
  let dragging = false;
  let pointerId: number | null = null;

  // Reactive derived values
  let displayMessage = $derived(customMessage || currentMessage);
  let bubbleVisible = $derived(Boolean(customMessage) || (displayBubble && Boolean(currentMessage)));

  let collectionKey = $derived.by(() => {
    let key: string = internalMood;
    if (zenMode) {
      if (internalMood === 'idle') key = 'zen_idle';
      if (internalMood === 'happy') key = 'zen_happy';
      if (internalMood === 'sleepy') key = 'zen_sleepy';
    }
    return key;
  });

  let currentGif = $derived.by(() => {
    const collection = GIF_COLLECTIONS[collectionKey] || GIF_COLLECTIONS['idle'];
    // Fallback to idle if collection is missing/empty
    const validCollection = (collection && collection.length > 0) ? collection : GIF_COLLECTIONS['idle'];
    const safeIndex = currentGifIndex % validCollection.length;
    return validCollection[safeIndex];
  });

  // Helper to change mood safely and reset GIF index
  function setMood(newMood: MascotMood) {
    internalMood = newMood;
    // When mood changes, pick a random GIF from the new collection immediately
    // so we don't flash a stale GIF from the old mood
    let key: string = newMood;
    if (zenMode) {
        if (newMood === 'happy') key = 'zen_happy';
        if (newMood === 'idle') key = 'zen_idle';
        if (newMood === 'sleepy') key = 'zen_sleepy';
    }
    if (GIF_COLLECTIONS[key]) {
      currentGifIndex = Math.floor(Math.random() * GIF_COLLECTIONS[key].length);
    } else {
      currentGifIndex = 0;
    }
  }

  // Helper to set temporary mood with auto-revert
  function setTemporaryMood(newMood: MascotMood, duration: number) {
    if (moodTimer) clearTimeout(moodTimer);
    
    setMood(newMood);

    moodTimer = setTimeout(() => {
      setMood('idle');
      moodTimer = null;
    }, duration);
  }

  // Helpers
  function clampToViewport(next: MascotPosition) {
    if (typeof window === 'undefined') return next;
    const padding = 16;
    const width = containerRef?.offsetWidth ?? 200;
    const height = containerRef?.offsetHeight ?? 200;
    const maxX = Math.max(padding, window.innerWidth - width - padding);
    const maxY = Math.max(padding, window.innerHeight - height - padding);
    return {
      x: clampValue(next.x, padding, maxX),
      y: clampValue(next.y, padding, maxY),
    };
  }

  function moveMascot(raw: MascotPosition, persist = false) {
    const clamped = clampToViewport(raw);
    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(clamped));
      } catch {}
    }
    if (position.x !== clamped.x || position.y !== clamped.y) {
      position = clamped;
    }
  }

  function scheduleBubbleHide(duration: number) {
    if (messageTimer) clearTimeout(messageTimer);
    if (bubbleTimer) clearTimeout(bubbleTimer);
    
    messageTimer = setTimeout(() => {
      displayBubble = false;
      bubbleTimer = setTimeout(() => {
        currentMessage = null;
        bubbleTimer = null;
      }, bubbleFadeMs);
      messageTimer = null;
    }, duration);
  }

  function setTemporaryMessage(msg: string | null, duration: number) {
    if (bubbleTimer) clearTimeout(bubbleTimer);
    if (messageTimer) clearTimeout(messageTimer);

    if (!msg) {
      displayBubble = false;
      bubbleTimer = setTimeout(() => {
        currentMessage = null;
        bubbleTimer = null;
      }, bubbleFadeMs);
      return;
    }

    currentMessage = msg;
    displayBubble = true;
    scheduleBubbleHide(duration);
  }

  async function handleChatSubmit() {
    if (!userQuery.trim()) return;
    
    isThinking = true;
    setMood('thinking');
    const question = userQuery;
    chatHistory = [...chatHistory, { role: 'user', text: question }];
    userQuery = ''; // Clear input immediately
    
    try {
        const context = serializeContext();
        const response = await ai.chat(question, context);
        chatHistory = [...chatHistory, { role: 'ai', text: response.text }];
        setTemporaryMood('happy', 4000);
    } catch (e) {
        chatHistory = [...chatHistory, { role: 'ai', text: "My crystal ball is foggy... (Error)" }];
        setTemporaryMood('sleepy', 3000);
    } finally {
        isThinking = false;
    }
  }

  // --- Drag Handling ---
  function handlePointerDown(event: PointerEvent) {
    if ((event.target as HTMLElement).closest('.mascot-chat-bubble')) return; // Ignore chat bubble
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.cancelable) event.preventDefault();

    dragMeta.startX = event.clientX;
    dragMeta.startY = event.clientY;
    dragMeta.offsetX = event.clientX - position.x;
    dragMeta.offsetY = event.clientY - position.y;
    dragMeta.moved = false;
    skipClick = false;
    isDragging = true;
    dragging = true;
    pointerId = event.pointerId;

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
  }

  function handleGlobalPointerMove(event: PointerEvent) {
    if (!dragging) return;
    if (pointerId !== null && event.pointerId !== pointerId) return;
    if (event.cancelable) event.preventDefault();

    const rawPosition = {
      x: event.clientX - dragMeta.offsetX,
      y: event.clientY - dragMeta.offsetY,
    };
    
    const distance = Math.hypot(event.clientX - dragMeta.startX, event.clientY - dragMeta.startY);
    if (!dragMeta.moved) {
      if (distance <= 4) return;
      dragMeta.moved = true;
      skipClick = true;
    }
    moveMascot(rawPosition);
  }

  function handleGlobalPointerUp(event: PointerEvent) {
    if (!dragging) return;
    if (pointerId !== null && event.pointerId !== pointerId) return;
    
    dragging = false;
    pointerId = null;
    if (event.cancelable) event.preventDefault();
    
    window.removeEventListener('pointermove', handleGlobalPointerMove);
    window.removeEventListener('pointerup', handleGlobalPointerUp);
    window.removeEventListener('pointercancel', handleGlobalPointerUp);
    isDragging = false;

    if (dragMeta.moved) {
      moveMascot({
        x: event.clientX - dragMeta.offsetX,
        y: event.clientY - dragMeta.offsetY,
      }, true);
      requestAnimationFrame(() => {
        skipClick = false;
      });
    } else {
      skipClick = false;
    }
    dragMeta = { startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false };
  }

  function handleMascotClick(event: MouseEvent) {
    if (skipClick) {
      skipClick = false;
      return;
    }

    if ((event.target as HTMLElement).closest('.mascot-chat-bubble')) return; // Ignore click inside chat

    // Modifier keys
    if (event.shiftKey && toggleZenMode) {
        toggleZenMode();
        return;
    }

    // Always trigger interaction (Bonk/Tickle) to keep it alive
    triggerInteraction();

    // Toggle Chat visibility
    const nextState = !chatOpen;
    chatOpen = nextState;
    
    if (nextState) {
        // If opening chat, clear any focused topic (Exclusive mode)
        if (onClearFocus) onClearFocus();
        
        // Focus input
        setTimeout(() => {
            const el = containerRef?.querySelector('textarea');
            el?.focus();
        }, 50);
    }
  }

  function triggerInteraction() {
    if (internalMood === 'sleepy') {
      if (zenMode) {
        setTemporaryMessage("Purrr... zzz... 💕", 2500);
      } else {
        setTemporaryMood('hugged', 4500);
        setTemporaryMessage("Grr... you woke me! Now you get penalty hugs! 😽💕", 4500);
      }
      return;
    }

    if (zenMode) {
      setTemporaryMessage("So soft... ☁️", 2500);
      return;
    }

    const roll = Math.random();
    let reactionType: MascotMood = 'tickled';
    let reactionText = "Eep! Too ticklish! >_< ";

    if (roll < 0.33) {
      reactionType = 'tickled';
      const texts = ["Eep! Too ticklish! >_<", "Hehe stop it! 💕", "Kyaa! No touchy!"];
      reactionText = texts[Math.floor(Math.random() * texts.length)];
    } else if (roll < 0.66) {
      reactionType = 'bonked';
      const texts = ["Ouchie! Bonk! 💢", "Why you bonk? T_T", "Bonk! Go to code jail!"];
      reactionText = texts[Math.floor(Math.random() * texts.length)];
    } else {
      reactionType = 'patted';
      const texts = ["Purr... headpats! 🌸", "So cozy... UwU", "Yay! Huggies! 🤗", "More pats pls! 💕"];
      reactionText = texts[Math.floor(Math.random() * texts.length)];
    }

    setTemporaryMood(reactionType, 2500);
    setTemporaryMessage(reactionText, 2500);
  }

  // --- Effects ---

  onMount(() => {
    // Initial position logic
    let starting: MascotPosition | null = null;
    try {
      const stored = localStorage.getItem(MASCOT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isValidStoredPosition(parsed)) starting = parsed;
      }
    } catch {}
    moveMascot(starting ?? getInitialPosition());

    function handleResize() {
      position = clampToViewport(position);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
      if (moodTimer) clearTimeout(moodTimer);
      if (messageTimer) clearTimeout(messageTimer);
      if (bubbleTimer) clearTimeout(bubbleTimer);
      if (explanationTimer) clearTimeout(explanationTimer);
      if (idleInterval) clearInterval(idleInterval);
      if (chatterInterval) clearInterval(chatterInterval);
      if (sleepTalkInterval) clearInterval(sleepTalkInterval);
    };
  });

  // Topic Explanation Effect
  $effect(() => {
    if (!focusedTopic) {
        topicExplanation = null;
        return;
    }

    // If chat is open, suppress the description bubble but keep highlighting in graph (handled by parent)
    if (chatOpen) {
        topicExplanation = null;
        return;
    }

    // Normal behavior: Show description
    setTemporaryMood('happy', 8000);
    const desc = focusedTopic.description || "A mysterious topic with no description yet!";
    const explanation = `✨ ${focusedTopic.topicName} ✨\n\n${desc}`;
    topicExplanation = explanation;
    
    if (explanationTimer) clearTimeout(explanationTimer);
    explanationTimer = setTimeout(() => {
      topicExplanation = null;
      explanationTimer = null;
    }, 12000);
  });
  
  // Auto-scroll effect
  $effect(() => {
    if (chatHistory.length || isThinking) {
        // Wait for DOM update
        setTimeout(() => {
            if (chatHistoryRef) {
                chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
            }
        }, 0);
    }
  });

  // Sync prop mood
  $effect(() => {
    if (mood !== 'idle') {
      setTemporaryMood(mood, 4000);
      if (mood === 'happy') {
        const happyMsgs = zenMode ? ZEN_HAPPY_MESSAGES : HAPPY_MESSAGES;
        const happyMsg = happyMsgs[Math.floor(Math.random() * happyMsgs.length)];
        setTemporaryMessage(happyMsg, 4000);
      }
    }
  });

  // Idle Animation Cycle (Managed Effect)
  $effect(() => {
    if (idleInterval) clearInterval(idleInterval);
    
    // Only run idle cycle if we are actually idle
    if (internalMood === 'idle') {
      idleInterval = setInterval(() => {
        // Double check inside interval
        if (internalMood !== 'idle') return;

        // Cycle GIF
        const key = zenMode ? 'zen_idle' : 'idle';
        if (GIF_COLLECTIONS[key]) {
            currentGifIndex = (currentGifIndex + 1) % GIF_COLLECTIONS[key].length;
        }

        // Sleepy chance
        const chance = zenMode ? 0.9 : 0.8;
        const duration = zenMode ? 12000 : 8000;
        if (Math.random() > chance) {
             setTemporaryMood('sleepy', duration); 
             if (!zenMode) {
                const sleepyMsg = SLEEPY_MESSAGES[Math.floor(Math.random() * SLEEPY_MESSAGES.length)];
                setTemporaryMessage(sleepyMsg, duration);
             }
        }
      }, zenMode ? 15000 : 8000); 
    }
  });

  // Sleep Talking (Managed Effect)
  $effect(() => {
    if (sleepTalkInterval) clearInterval(sleepTalkInterval);

    if (internalMood === 'sleepy') {
      sleepTalkInterval = setInterval(() => {
          if (Math.random() > 0.75) {
               if (zenMode) {
                  setTemporaryMessage("...zzz... 💕", 3000);
              } else {
                  const sleepyMsg = SLEEPY_MESSAGES[Math.floor(Math.random() * SLEEPY_MESSAGES.length)];
                  setTemporaryMessage(sleepyMsg, 3000);
              }
          }
      }, zenMode ? 4000 : 2000);
    }
  });

  // Chatter (Managed Effect)
  $effect(() => {
    if (chatterInterval) clearInterval(chatterInterval);

    if (internalMood !== 'sleepy') {
      chatterInterval = setInterval(() => {
        const chance = zenMode ? 0.6 : 0.7;
        if (Math.random() > chance) { 
            const messages = zenMode ? ZEN_MESSAGES : MESSAGES;
            const msg = messages[Math.floor(Math.random() * messages.length)];
            setTemporaryMessage(msg, 4000);
        }
      }, zenMode ? 20000 : 12000);
    }
  });

</script>

<div
  class="mascot-container"
  class:dragging={isDragging}
  bind:this={containerRef}
  style:left="{position.x}px"
  style:top="{position.y}px"
  onpointerdown={handlePointerDown}
>
  <div class="mascot-bubble" class:visible={bubbleVisible}>
    {#if displayMessage}<span>{displayMessage}</span>{/if}
  </div>
  
  <div class="mascot-desc-bubble" class:visible={!!topicExplanation}>
    {#if topicExplanation}<span>{topicExplanation}</span>{/if}
  </div>

  <div class="mascot-chat-bubble" class:visible={chatOpen}>
     <div class="chat-header">
        <span>Grimoire</span>
        <button class="chat-close" onclick={(e) => { e.stopPropagation(); chatOpen = false; }}>×</button>
     </div>
     <div class="chat-history" bind:this={chatHistoryRef}>
        {#each chatHistory as msg}
           <div class="chat-row" class:user={msg.role === 'user'}>
              <span class="chat-text">{msg.text}</span>
           </div>
        {/each}
        {#if isThinking}
           <div class="chat-row ai thinking">...writing...</div>
        {/if}
     </div>
     <div class="chat-input-row">
        <!-- svelte-ignore a11y_autofocus -->
        <textarea 
           bind:value={userQuery} 
           placeholder="Ask..." 
           rows="1"
           onkeydown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleChatSubmit();
               }
           }}
        ></textarea>
        <button class="chat-send-btn" onclick={(e) => { e.stopPropagation(); handleChatSubmit(); }}>➤</button>
     </div>
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <img
    src={currentGif}
    alt="Mascot"
    class="mascot-image"
    onmouseenter={() => {
        if (internalMood === 'idle' && !zenMode) {
            if (moodTimer) clearTimeout(moodTimer);
            setMood('excited');
        }
    }}
    onmouseleave={() => {
        if (internalMood === 'excited') setMood('idle');
    }}
    onclick={handleMascotClick}
  />
</div>