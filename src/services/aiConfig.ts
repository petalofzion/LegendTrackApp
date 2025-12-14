import { invoke } from '@tauri-apps/api/core';
import { get, writable } from 'svelte/store';

export type AiModePreference = 'api' | 'local';

export type AiCredentialPayload = {
  mode: AiModePreference;
  apiKey: string;
  apiModel: string;
  localBase: string;
  localModel: string;
  localPrompt: string;
};

export const DEFAULT_LOCAL_BASE = 'http://localhost:11434';
export const DEFAULT_LOCAL_MODEL = 'llama3';
const DEFAULT_API_MODEL = 'gpt-4o';
const FALLBACK_STORAGE_KEY = 'legendtrack_ai_credentials';

const DEFAULT_CREDENTIALS: AiCredentialPayload = {
  mode: 'api',
  apiKey: '',
  apiModel: DEFAULT_API_MODEL,
  localBase: DEFAULT_LOCAL_BASE,
  localModel: DEFAULT_LOCAL_MODEL,
  localPrompt: '',
};

const isTauriEnv = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

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
  };
}

async function fetchCredentials(): Promise<AiCredentialPayload> {
  if (isTauriEnv) {
    try {
      const response = await invoke<Partial<AiCredentialPayload>>('get_ai_credentials');
      return normalizeCredentials(response);
    } catch (err) {
      console.error('Failed to load AI credentials from backend', err);
      return DEFAULT_CREDENTIALS;
    }
  }
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
  } else if (typeof localStorage !== 'undefined') {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(normalized));
  }
}

export function hasHostedApiKey(creds: AiCredentialPayload): boolean {
  return creds.mode === 'api' && Boolean(creds.apiKey.trim());
}
