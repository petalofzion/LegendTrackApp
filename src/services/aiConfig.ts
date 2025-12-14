export type AiModePreference = 'api' | 'local';

export const STORAGE_KEYS = {
  apiKey: 'legendtrack_api_key',
  apiModel: 'legendtrack_api_model',
  mode: 'legendtrack_ai_mode',
  localBase: 'legendtrack_local_base',
  localModel: 'legendtrack_local_model',
  localPrompt: 'legendtrack_local_prompt',
} as const;

export const DEFAULT_LOCAL_BASE = 'http://localhost:11434';
export const DEFAULT_LOCAL_MODEL = 'llama3';
