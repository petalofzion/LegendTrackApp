import type { Topic, Project } from '../types';
import { get } from 'svelte/store';
import { topics, projects } from '../stores';

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
};

/**
 * Base configuration for the AI Service
 */
export type AiConfig = {
  provider: 'ollama' | 'openai' | 'anthropic';
  model: string;
  baseUrl?: string;
  apiKey?: string; // Optional for local
};

const DEFAULT_CONFIG: AiConfig = {
  provider: 'ollama',
  model: 'llama3', // or mistral, etc.
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

  async chat(userMessage: string, systemContext: string): Promise<AiResponse> {
    if (this.config.provider === 'ollama') {
      return this.chatOllama(userMessage, systemContext);
    }
    throw new Error(`Provider ${this.config.provider} not implemented yet.`);
  }

  private async chatOllama(userMessage: string, systemContext: string): Promise<AiResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: userMessage }
          ],
          stream: false, // For now, simple non-streaming
          // format: 'json' // If we want forced JSON for tools later
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.message?.content || "I'm not sure what to say.",
      };
    } catch (err) {
      console.error('AI Service Error:', err);
      return { text: "My crystal ball is foggy... (Is Ollama running?)" };
    }
  }
}

export const ai = new AiService();
