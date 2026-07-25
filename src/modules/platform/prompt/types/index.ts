// ==========================================================================
// Prompt Builder Platform — types (the contract).
//
// Assembles the FINAL prompt from Conversation memory + Knowledge Context +
// User Question, using reusable, versioned templates. It knows NOTHING about any
// LLM — a future provider consumes a BuiltPrompt (optionally via a provider
// formatter), never the reverse.
// ==========================================================================

import type { KnowledgeContext } from '@/modules/platform/knowledge/context';
import type { ConversationMemoryDTO } from '@/modules/platform/conversation';

/** The ordered sections a prompt is assembled from. */
export type PromptSection = 'system' | 'businessRules' | 'memory' | 'knowledge' | 'user' | 'output';

/** Provider-neutral chat message. */
export interface PromptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * A reusable, VERSIONED prompt template. Separates System Prompt, Business Rules
 * and Output Instructions so each can evolve independently. Text supports
 * `{{variable}}` interpolation.
 */
export interface PromptTemplate {
  id: string;
  name: string;
  version: number;
  description: string;
  system: string;
  businessRules: string[];
  outputInstructions: string;
  /** Optional default variables merged with request variables. */
  defaults?: Record<string, string>;
}

/** Input to the Prompt Builder. `context`/`memory` come from the other platforms. */
export interface PromptRequest {
  question: string;
  context?: KnowledgeContext;
  memory?: ConversationMemoryDTO[];
  templateId?: string;
  /** Provider name — only used to pick a formatter; no LLM is called. */
  provider?: string;
  variables?: Record<string, string>;
  language?: string;
  /** Token ceiling for the whole prompt (overrides config). */
  maxTokens?: number;
}

/** The assembled prompt — provider-neutral. A future provider renders this. */
export interface BuiltPrompt {
  /** System prompt + business rules. */
  system: string;
  /** User prompt: memory + knowledge context + question + output instructions. */
  user: string;
  /** Provider-neutral chat form (system + user). */
  messages: PromptMessage[];
  template: { id: string; version: number };
  estimatedTokens: number;
  truncated: boolean;
  metadata: {
    provider: string | null;
    sections: PromptSection[];
    language: string;
    hasContext: boolean;
    memoryCount: number;
  };
}

/**
 * A provider formatter turns a BuiltPrompt into a provider's request shape
 * (OpenAI messages, Gemini contents, Claude messages, …). Interface + registry
 * only — no provider is implemented this phase. `generic` works for any chat API.
 */
export interface ProviderFormatter {
  provider: string;
  format: (prompt: BuiltPrompt) => { messages: PromptMessage[]; system?: string };
}

// ── Events (Core Event Bus — placeholder analytics) ──────────
export const PROMPT_EVENTS = {
  BUILT: 'prompt:built',
  TEMPLATE_USED: 'prompt:template_used',
  VERSION_USED: 'prompt:version_used',
  TRUNCATED: 'prompt:truncated',
  FORMATTED: 'prompt:formatted',
} as const;

export type PromptEventName = (typeof PROMPT_EVENTS)[keyof typeof PROMPT_EVENTS];
