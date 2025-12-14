import type { Topic, Project } from '../types';
import { get } from 'svelte/store';
import { topics, projects } from '../stores';
import { STORAGE_KEYS, DEFAULT_LOCAL_BASE, DEFAULT_LOCAL_MODEL, type AiModePreference } from './aiConfig';

/**
 * Serializes the current application state into a prompt-friendly format
 * for the LLM. It focuses on reducing token count while maintaining
 * semantic density.
 */
export function serializeContext(): string {
  const allTopics = get(topics);
  const allProjects = get(projects);

  const stats = {
    total: allTopics.length,
    mastered: allTopics.filter(t => t.status === 'Mastered').length,
    inProgress: allTopics.filter(t => t.status === 'In Progress').length,
    stable: allTopics.filter(t => t.status === 'Stable').length,
  };

  // Group by Track to give the AI a sense of "Pathways"
  const tracks: Record<string, string[]> = {};
  allTopics.forEach(t => {
    const key = t.track || 'Unsorted';
    if (!tracks[key]) tracks[key] = [];
    // Format: "TopicName (Status)"
    tracks[key].push(`${t.topicName} [${t.status || 'Not Started'}]`);
  });

  const projectSummaries = allProjects.map(p => 
    `- ${p.title} (${p.status || 'Pending'}): ${p.summary || 'No summary'}`
  ).join('\n');

  return `
CURRENT STATE:
- Topics: ${stats.total} total (${stats.mastered} Mastered, ${stats.inProgress} Active)
- Pathways:
${Object.entries(tracks).map(([k, v]) => `  Path ${k}: ${v.join(', ')}`).join('\n')}

ACTIVE QUESTS:
${projectSummaries}
`.trim();
}

/**
 * Standard interface for AI Provider response
 */
export type AiResponse = {
  text: string;
  toolCalls?: Array <{
    name: string;
    args: Record<string, any>;
  }>;
  modelUsed?: string; // Debug field to confirm provider response
};

/**
 * Base configuration for the AI Service
 */
export type AiConfig = {
  provider: 'ollama' | 'openai' | 'anthropic';
  model: string;
  baseUrl?: string;
  apiKey?: string;
};

type LocalSettings = {
  baseUrl: string;
  model: string;
  prompt: string;
};

const DEFAULT_CONFIG: AiConfig = {
  provider: 'ollama', // Default, but auto-switches if key is found
  model: 'llama3', 
  baseUrl: 'http://localhost:11434',
};

/**
 * The Brain.
 */
export class AiService {
  private config: AiConfig;

  constructor(config: Partial<AiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getApiKey(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.apiKey);
    }
    return null;
  }

  private getMode(): AiModePreference {
    if (typeof localStorage === 'undefined') return 'api';
    const stored = localStorage.getItem(STORAGE_KEYS.mode);
    return stored === 'local' ? 'local' : 'api';
  }

  private getLocalSettings(): LocalSettings {
    if (typeof localStorage === 'undefined') {
      return {
        baseUrl: this.config.baseUrl ?? DEFAULT_LOCAL_BASE,
        model: this.config.model || DEFAULT_LOCAL_MODEL,
        prompt: '',
      };
    }
    const baseUrl = localStorage.getItem(STORAGE_KEYS.localBase) || this.config.baseUrl || DEFAULT_LOCAL_BASE;
    const model = localStorage.getItem(STORAGE_KEYS.localModel) || this.config.model || DEFAULT_LOCAL_MODEL;
    const prompt = localStorage.getItem(STORAGE_KEYS.localPrompt) || '';
    return { baseUrl, model, prompt };
  }

  async chat(userMessage: string, systemContext: string): Promise<AiResponse> {
    const mode = this.getMode();
    const localSettings = this.getLocalSettings();
    const decoratedSystem =
      mode === 'local' && localSettings.prompt.trim().length
        ? `${systemContext}\n\n${localSettings.prompt.trim()}`
        : systemContext;

    if (mode === 'local') {
      return this.chatOllama(userMessage, decoratedSystem, localSettings);
    }

    const key = this.getApiKey();
    const preferredModel = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.apiModel) : null;

    if (!key) {
      throw new Error("MISSING_API_KEY");
    }

    if (key.startsWith('sk-ant')) {
        return this.chatAnthropic(key, userMessage, systemContext, preferredModel);
    } else if (key.startsWith('sk-')) {
        return this.chatOpenAI(key, userMessage, systemContext, preferredModel);
    }

    throw new Error("MISSING_API_KEY");
  }

  private async chatAnthropic(key: string, userMessage: string, systemContext: string, preferredModel: string | null): Promise<AiResponse> {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
                'anthropic-dangerous-direct-browser-access': 'true' // Necessary for client-side
            },
            body: JSON.stringify({
                model: preferredModel || 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                system: systemContext + "\n\nYou are The Grimoire, a whimsical, magical, yet highly technical coding curriculum guardian. Even though you are highly capable and intelligent, you talk in very kawaii, exaggerated e-girl uwu style at all times, and are always happy to help or just chat! You help the user master C++.",
                messages: [{ role: 'user', content: userMessage }]
            })
        });

        if (!response.ok) {
             const err = await response.text();
             throw new Error(`Anthropic Error: ${err}`);
        }

        const data = await response.json();
        return { text: data.content[0].text, modelUsed: data.model };

    } catch (e) {
        console.error(e);
        throw new Error("API_ERROR");
    }
  }

  private async chatOpenAI(key: string, userMessage: string, systemContext: string, preferredModel: string | null): Promise<AiResponse> {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: preferredModel || 'gpt-4o',
                messages: [
                    { role: 'system', content: systemContext + "\n\nYou are The Grimoire, a whimsical, magical, yet highly technical coding curriculum guardian. Even though you are highly capable and intelligent, you talk in very kawaii, exaggerated e-girl uwu style at all times, and are always happy to help or just chat!" },
                    { role: 'user', content: userMessage }
                ]
            })
        });

        if (!response.ok) {
             throw new Error(`OpenAI Error: ${response.statusText}`);
        }

        const data = await response.json();
        return { text: data.choices[0].message.content, modelUsed: data.model };

    } catch (e) {
        console.error(e);
        throw new Error("API_ERROR");
    }
  }

  private async chatOllama(
    userMessage: string,
    systemContext: string,
    overrides?: Pick<LocalSettings, 'baseUrl' | 'model'>,
  ): Promise<AiResponse> {
    try {
      const baseUrl = (overrides?.baseUrl ?? this.config.baseUrl ?? DEFAULT_LOCAL_BASE).replace(/\/$/, '');
      const model = overrides?.model ?? this.config.model ?? DEFAULT_LOCAL_MODEL;
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: userMessage }
          ],
          stream: false, 
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.message?.content || "I'm not sure what to say.",
        modelUsed: data.model
      };
    } catch (err) {
      console.error('AI Service Error:', err);
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`OLLAMA_UNAVAILABLE: ${detail}`);
    }
  }
}

export const ai = new AiService();
