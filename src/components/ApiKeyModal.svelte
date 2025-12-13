<script lang="ts">
  import { showApiKeyModal } from '../stores';
  import { triggerConfetti } from '../utils/confetti';
  import { fade, scale } from 'svelte/transition';

  let apiKey = $state('');

  // Load existing key on mount
  if (typeof localStorage !== 'undefined') {
    apiKey = localStorage.getItem('legendtrack_api_key') || '';
  }

  function save() {
    if (apiKey.trim()) {
      localStorage.setItem('legendtrack_api_key', apiKey.trim());
      triggerConfetti();
    } else {
      localStorage.removeItem('legendtrack_api_key');
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
        <br>
        <span class="sub-text">(OpenAI or Anthropic keys accepted!)</span>
      </p>

      <input 
        type="password" 
        bind:value={apiKey} 
        placeholder="sk-..." 
        class="cute-input"
        onkeydown={(e) => e.key === 'Enter' && save()}
      />

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

  .sub-text {
    font-size: 0.85rem;
    opacity: 0.8;
    font-style: italic;
  }

  .cute-input {
    width: 100%;
    box-sizing: border-box; /* Fix spill */
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
    margin-bottom: 2rem;
  }

  .cute-input:focus {
    border-color: #f06ea9;
    box-shadow: 0 0 0 4px rgba(240, 110, 169, 0.15);
    transform: scale(1.02);
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
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