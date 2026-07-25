// ==========================================================================
// Prompt Builder service — the reusable facade. Pure & isomorphic.
//
//   buildPrompt(request) → BuiltPrompt
//
// Resolves a versioned template, runs the assembly pipeline, emits placeholder
// analytics events, and (optionally) formats for a provider. NO LLM is called.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import type { BuiltPrompt, PromptRequest } from '../types';
import { PROMPT_EVENTS } from '../types';
import { PROMPT_CONFIG } from '../config';
import { getPromptTemplate } from '../templates';
import { getProviderFormatter } from '../providers';
import { assemble } from '../builders';

/**
 * Build the final prompt from Conversation memory + Knowledge Context + the User
 * Question, using a reusable versioned template. Emits analytics events. Pure.
 */
export function buildPrompt(request: PromptRequest): BuiltPrompt {
  const templateId = request.templateId ?? PROMPT_CONFIG.defaultTemplateId;
  const template = getPromptTemplate(templateId) ?? getPromptTemplate(PROMPT_CONFIG.defaultTemplateId);
  if (!template) {
    throw new Error(`Prompt template "${templateId}" not found and no default is registered.`);
  }

  const built = assemble(request, template);

  // ── Placeholder analytics (Core Event Bus) ──────────────────
  platformEvents.emit(PROMPT_EVENTS.TEMPLATE_USED, { templateId: template.id });
  platformEvents.emit(PROMPT_EVENTS.VERSION_USED, { templateId: template.id, version: template.version });
  platformEvents.emit(PROMPT_EVENTS.BUILT, {
    templateId: template.id,
    version: template.version,
    provider: built.metadata.provider,
    estimatedTokens: built.estimatedTokens,
    hasContext: built.metadata.hasContext,
    memoryCount: built.metadata.memoryCount,
    sections: built.metadata.sections,
  });
  if (built.truncated) {
    platformEvents.emit(PROMPT_EVENTS.TRUNCATED, {
      templateId: template.id,
      estimatedTokens: built.estimatedTokens,
    });
  }

  return built;
}

/**
 * Build a prompt AND format it for a (future) provider — returns the neutral
 * BuiltPrompt plus the provider-shaped payload. Still calls no LLM.
 */
export function buildPromptForProvider(request: PromptRequest) {
  const built = buildPrompt(request);
  const formatter = getProviderFormatter(request.provider);
  const formatted = formatter.format(built);
  platformEvents.emit(PROMPT_EVENTS.FORMATTED, {
    provider: formatter.provider,
    templateId: built.template.id,
  });
  return { built, formatter: formatter.provider, formatted };
}
