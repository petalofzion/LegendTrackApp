import { invoke } from '@tauri-apps/api/core';
import { get, writable } from 'svelte/store';
import { Store } from '@tauri-apps/plugin-store';
import { obfuscate, deobfuscate } from './crypto';

export type AiModePreference = 'api' | 'local';
export type StoragePreference = 'local' | 'secure';

export type AiCredentialPayload = {
  mode: AiModePreference;
  apiKey: string;
  apiModel: string;
  localBase: string;
  localModel: string;
  localPrompt: string;
  storage: StoragePreference;
};

export const DEFAULT_LOCAL_BASE = 'http://localhost:11434';
export const DEFAULT_LOCAL_MODEL = 'llama3';
const DEFAULT_API_MODEL = 'gpt-4o';
const FALLBACK_STORAGE_KEY = 'legendtrack_ai_credentials';
const STORE_FILENAME = 'legendtrack_settings.json';

const DEFAULT_CREDENTIALS: AiCredentialPayload = {
  mode: 'api',
  apiKey: '',
  apiModel: DEFAULT_API_MODEL,
  localBase: DEFAULT_LOCAL_BASE,
  localModel: DEFAULT_LOCAL_MODEL,
  localPrompt: '',
  storage: 'local',
};

const isTauriEnv = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Lazy store initialization
let store: Store | null = null;
async function getStore() {
  if (!store && isTauriEnv) {
    store = await Store.load(STORE_FILENAME);
  }
  return store;
}

export const aiCredentials = writable<AiCredentialPayload>(DEFAULT_CREDENTIALS);
let loadPromise: Promise<AiCredentialPayload> | null = null;

function normalizeCredentials(partial: Partial<AiCredentialPayload> | null | undefined): AiCredentialPayload {
  const payload = partial ?? {};
  return {
    mode: payload.mode ?? DEFAULT_CREDENTIALS.mode,
    apiKey: payload.apiKey?.trim() ?? '',
    apiModel: payload.apiModel?.trim() || DEFAULT_API_MODEL,
    localBase: payload.localBase?.trim() || DEFAULT_LOCAL_BASE,
    localModel: payload.localModel?.trim() || DEFAULT_LOCAL_MODEL,
    localPrompt: payload.localPrompt?.trim() ?? '',
    storage: payload.storage ?? 'local',
  };
}

async function fetchCredentials(): Promise<AiCredentialPayload> {
  if (isTauriEnv) {
    try {
      // 1. Try to load from local file store first (Primary path)
      const s = await getStore();
      if (s) {
        const localData = await s.get<Partial<AiCredentialPayload>>(FALLBACK_STORAGE_KEY);
        
        // 2. Check if we need to escalate to Keychain
        if (localData && localData.storage === 'secure') {
          console.log('Secure storage flag found, accessing Keychain...');
          const secureResponse = await invoke<Partial<AiCredentialPayload>>('get_ai_credentials');
          // Merge: use secure data, but keep the 'secure' flag from local
          return normalizeCredentials({ ...localData, ...secureResponse, storage: 'secure' });
        } else if (localData) {
          // 3. Found local data (Option A), return it directly
          if (localData.apiKey) {
            localData.apiKey = await deobfuscate(localData.apiKey);
          }
          return normalizeCredentials(localData);
        }
      }
      // 4. If no local data found, return defaults (do NOT auto-check keychain)
      return DEFAULT_CREDENTIALS;

    } catch (err) {
      console.error('Failed to load AI credentials from store', err);
      return DEFAULT_CREDENTIALS;
    }
  }

  // Web Fallback
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(FALLBACK_STORAGE_KEY);
      if (stored) {
        return normalizeCredentials(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to parse fallback AI credentials', err);
    }
  }
  return DEFAULT_CREDENTIALS;
}

export async function loadAiCredentials(): Promise<AiCredentialPayload> {
  const creds = await fetchCredentials();
  aiCredentials.set(creds);
  loadPromise = Promise.resolve(creds);
  return creds;
}

export function ensureAiCredentialsLoaded(): Promise<AiCredentialPayload> {
  if (!loadPromise) {
    loadPromise = loadAiCredentials();
  }
  return loadPromise;
}

export async function getAiCredentials(): Promise<AiCredentialPayload> {
  await ensureAiCredentialsLoaded();
  return get(aiCredentials);
}

export function getAiCredentialsSync(): AiCredentialPayload {
  return get(aiCredentials);
}

export async function saveAiCredentials(payload: AiCredentialPayload): Promise<void> {
  const normalized = normalizeCredentials(payload);
  aiCredentials.set(normalized);
  loadPromise = Promise.resolve(normalized);

  if (isTauriEnv) {
    const s = await getStore();
    if (!s) return;

    if (normalized.storage === 'secure') {
      // Option B: Save actual secrets to Keychain
      await invoke('save_ai_credentials', {
        payload: {
          mode: normalized.mode,
          apiKey: normalized.apiKey || undefined,
          apiModel: normalized.apiModel || undefined,
          localBase: normalized.localBase || undefined,
          localModel: normalized.localModel || undefined,
          localPrompt: normalized.localPrompt || undefined,
        },
      });
      // Save "Marker" to local store so we know to check keychain next time
      // We strip the sensitive key from the local store
      const markerPayload = { ...normalized, apiKey: '' }; 
      await s.set(FALLBACK_STORAGE_KEY, markerPayload);
    } else {
      // Option A: Save everything to local file (Simple Obfuscation)
      const safeKey = await obfuscate(normalized.apiKey);
      await s.set(FALLBACK_STORAGE_KEY, { ...normalized, apiKey: safeKey });
    }
    await s.save(); // Persist to disk
  } else if (typeof localStorage !== 'undefined') {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(normalized));
  }
}

export function hasHostedApiKey(creds: AiCredentialPayload): boolean {
  return creds.mode === 'api' && Boolean(creds.apiKey.trim());
}
