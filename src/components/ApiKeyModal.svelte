<script lang="ts">
  import { showApiKeyModal } from '../stores';
  import { triggerConfetti } from '../utils/confetti';
  import { fade, scale, slide } from 'svelte/transition';
  import CuteSelect from './CuteSelect.svelte';

  let apiKey = $state('');
  let model = $state('');
  let customModelInput = $state('');
  let showTuning = $state(false);

  // Constants
  const OPENAI_MODELS = ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  const ANTHROPIC_MODELS = ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'];
  const ALL_DEFAULTS = new Set([...OPENAI_MODELS, ...ANTHROPIC_MODELS]);

  // Derived State
  let detectedProvider = $derived.by(() => {
    if (apiKey.startsWith('sk-ant')) return 'Anthropic';
    if (apiKey.startsWith('sk-')) return 'OpenAI';
    return 'Unknown';
  });

  let modelOptions = $derived.by(() => {
    let base = [];
    if (detectedProvider === 'Anthropic') base = ANTHROPIC_MODELS;
    else if (detectedProvider === 'OpenAI') base = OPENAI_MODELS;
    else base = [...OPENAI_MODELS, ...ANTHROPIC_MODELS]; // Show all if unknown

    return [...base, 'Custom...'];
  });

  // Load existing data
  if (typeof localStorage !== 'undefined') {
    apiKey = localStorage.getItem('legendtrack_api_key') || '';
    const storedModel = localStorage.getItem('legendtrack_api_model');
    
    if (storedModel) {
        if (ALL_DEFAULTS.has(storedModel)) {
            model = storedModel;
        } else {
            model = 'Custom...';
            customModelInput = storedModel;
            showTuning = true; // Auto-open if custom
        }
    } else {
        // Default to Gold Standards if nothing saved
        model = 'gpt-4o'; // Just a visual default, detection overrides if key changes
    }
  }

  // Auto-switch visual default if provider changes and current model mismatches
  $effect(() => {
      if (detectedProvider === 'Anthropic' && model.startsWith('gpt')) {
          model = ANTHROPIC_MODELS[0];
      }
      if (detectedProvider === 'OpenAI' && model.startsWith('claude')) {
          model = OPENAI_MODELS[0];
      }
  });

  function save() {
    if (apiKey.trim()) {
      localStorage.setItem('legendtrack_api_key', apiKey.trim());
      
      const finalModel = model === 'Custom...' ? customModelInput.trim() : model;
      if (finalModel) {
          localStorage.setItem('legendtrack_api_model', finalModel);
      } else {
          localStorage.removeItem('legendtrack_api_model');
      }

      triggerConfetti();
    } else {
      localStorage.removeItem('legendtrack_api_key');
      localStorage.removeItem('legendtrack_api_model');
    }
    $showApiKeyModal = false;
  }

  function close() {
    $showApiKeyModal = false;
  }
</script>

{#if $showApiKeyModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop" onclick={close} transition:fade={{ duration: 200 }}>
    <div 
      class="modal-card" 
      onclick={(e) => e.stopPropagation()} 
      transition:scale={{ duration: 300, start: 0.9 }}
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-header">
        <h2>✨ Grimoire Key ✨</h2>
        <button class="close-btn" onclick={close}>×</button>
      </div>
      
      <p class="modal-desc">
        To awaken the spirit in the machine, whisper your secret API key here...
      </p>

      <div class="input-group">
        <input 
          type="password" 
          bind:value={apiKey} 
          placeholder="sk-..." 
          class="cute-input"
          onkeydown={(e) => e.key === 'Enter' && save()}
        />
        {#if detectedProvider !== 'Unknown'}
            <span class="provider-badge" transition:fade>{detectedProvider}</span>
        {/if}
      </div>

      <button class="tuning-toggle" onclick={() => showTuning = !showTuning}>
        {showTuning ? 'Hide Tuning' : 'Tune Spirit? 🔮'}
      </button>

      {#if showTuning}
        <div class="tuning-panel" transition:slide={{ duration: 200 }}>
            <label>Spirit Model</label>
            <CuteSelect 
                value={model} 
                options={modelOptions} 
                onChange={(v) => model = v} 
            />
            
            {#if model === 'Custom...'}
                <input 
                    type="text" 
                    bind:value={customModelInput} 
                    placeholder="e.g. gpt-4-turbo-preview" 
                    class="cute-input custom-model"
                />
            {/if}
        </div>
      {/if}

      <div class="modal-actions">
        <button class="cute-btn cancel" onclick={close}>Nevermind...</button>
        <button class="cute-btn save" onclick={save}>Awaken! 💖</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(45, 20, 60, 0.4);
    backdrop-filter: blur(8px);
    display: grid;
    place-items: center;
    z-index: 5000;
  }

  .modal-card {
    background: linear-gradient(145deg, #fff9fc, #fff0f7);
    padding: 2rem;
    border-radius: 30px;
    width: 90%;
    max-width: 420px;
    box-shadow: 
      0 20px 60px rgba(160, 100, 180, 0.35),
      0 0 0 4px rgba(255, 255, 255, 0.8) inset;
    border: 3px solid #ffcae6;
    text-align: center;
    animation: floaty 6s ease-in-out infinite alternate;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  h2 {
    font-family: 'Fredoka', cursive;
    color: #f06ea9;
    font-size: 1.8rem;
    margin: 0;
    text-shadow: 2px 2px 0px #fff;
    flex-grow: 1;
    text-align: center;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #ff9fdc;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    position: absolute;
    right: 1.5rem;
    top: 1.5rem;
  }
  .close-btn:hover { color: #f06ea9; transform: scale(1.1); }

  .modal-desc {
    color: #8c7ba3;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .input-group {
      position: relative;
      margin-bottom: 1rem;
  }

  .provider-badge {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: #f3e5f5;
      color: #8e24aa;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      pointer-events: none;
      border: 1px solid #d1c4e9;
  }

  .cute-input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.8rem 1.2rem;
    border-radius: 999px;
    border: 3px solid #ffdef0;
    background: #fff;
    font-family: 'Nunito', sans-serif;
    color: #6b5b95;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s;
    box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
  }

  .cute-input:focus {
    border-color: #f06ea9;
    box-shadow: 0 0 0 4px rgba(240, 110, 169, 0.15);
    transform: scale(1.02);
  }

  .tuning-toggle {
      background: none;
      border: none;
      color: #9fa0b5;
      font-size: 0.85rem;
      cursor: pointer;
      text-decoration: underline;
      margin-bottom: 1rem;
      font-weight: 600;
  }
  .tuning-toggle:hover { color: #f06ea9; }

  .tuning-panel {
      background: rgba(255, 255, 255, 0.6);
      border-radius: 20px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border: 2px dashed #f06ea9;
      text-align: left;
  }

  .tuning-panel label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      color: #8c7ba3;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
  }

  .custom-model {
      margin-top: 0.8rem;
      font-size: 0.9rem;
      padding: 0.6rem 1rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .cute-btn {
    border: none;
    border-radius: 999px;
    padding: 0.8rem 1.8rem;
    font-family: 'Fredoka', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .cute-btn:hover { transform: translateY(-3px) scale(1.05); }
  .cute-btn:active { transform: scale(0.95); }

  .cute-btn.save {
    background: linear-gradient(135deg, #ff9fdc, #f06ea9);
    color: white;
    box-shadow: 0 8px 20px rgba(240, 110, 169, 0.3);
  }

  .cute-btn.cancel {
    background: #f0f0f5;
    color: #9fa0b5;
  }

  @keyframes floaty {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-5px); }
  }
</style>