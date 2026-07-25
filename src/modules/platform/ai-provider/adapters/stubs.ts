// ==========================================================================
// Prepared provider adapters — OpenAI, Claude, DeepSeek. Interface-complete
// STUBS: they report `implemented: false`, so the registry never routes to them
// and `generate` cleanly refuses. Implementing one later = fill in `generate`
// (mirror gemini.ts) and flip `implemented: true` + its feature flag. No other
// file changes — that is the point of separating interface from implementation.
// ==========================================================================

import { AIProviderError } from '../types';
import type { AIProvider, AIResponse, ProviderInfo } from '../types';
import { readKey } from './base';

function makeStub(info: ProviderInfo, envNames: string[]): AIProvider {
  return {
    info,
    isConfigured() {
      return Boolean(readKey(...envNames));
    },
    async generate(): Promise<AIResponse> {
      throw new AIProviderError(`Provider "${info.name}" is not implemented yet`, info.name, false);
    },
  };
}

export const openaiProvider = makeStub(
  {
    name: 'openai',
    label: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'o3-mini'],
    streaming: true,
    implemented: false,
  },
  ['OPENAI_API_KEY'],
);

export const claudeProvider = makeStub(
  {
    name: 'claude',
    label: 'Claude',
    defaultModel: 'claude-3-5-sonnet',
    models: ['claude-3-5-sonnet', 'claude-3-5-haiku', 'claude-3-opus'],
    streaming: true,
    implemented: false,
  },
  ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'],
);

export const deepseekProvider = makeStub(
  {
    name: 'deepseek',
    label: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    streaming: true,
    implemented: false,
  },
  ['DEEPSEEK_API_KEY'],
);
