// ==========================================================================
// Prompt Assembly Pipeline — pure, modular, provider-agnostic.
//
//   resolveTemplate → collectVariables → renderSections → assemble
//                    → estimate → enforceBudget → toMessages
//
// Each step is a small pure function so the pipeline is easy to reason about,
// test and extend. No I/O, no LLM, no Prisma.
// ==========================================================================

import type { BuiltPrompt, PromptRequest, PromptSection, PromptTemplate } from '../types';
import { PROMPT_CONFIG } from '../config';
import { estimateTokens, interpolate, joinSections, trimToTokens } from '../utils';

/** Merge template defaults + request variables + built-in vars (question, language). */
export function collectVariables(request: PromptRequest, template: PromptTemplate): Record<string, string> {
  return {
    ...template.defaults,
    language: request.language ?? template.defaults?.language ?? 'English',
    question: request.question,
    ...request.variables,
  };
}

/** Render the SYSTEM half: system prompt + business rules. */
export function renderSystem(template: PromptTemplate, vars: Record<string, string>): string {
  const rules = template.businessRules.length
    ? `Business rules:\n${template.businessRules.map((r) => `- ${interpolate(r, vars)}`).join('\n')}`
    : null;
  return joinSections([interpolate(template.system, vars), rules]);
}

/** Format injected conversation memory (bounded, importance-first). */
export function renderMemory(request: PromptRequest): string | null {
  const memory = request.memory ?? [];
  if (!memory.length) return null;
  const items = [...memory]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, PROMPT_CONFIG.maxMemoryItems)
    .map((m) => `- (${m.type.toLowerCase()}) ${m.key}: ${m.value}`);
  return `What you remember about the user:\n${items.join('\n')}`;
}

/** Format the injected knowledge context (already prompt-ready from Context Builder). */
export function renderKnowledge(request: PromptRequest): string | null {
  const ctx = request.context?.context?.trim();
  return ctx ? `Knowledge context:\n${ctx}` : null;
}

/** Render the USER half: memory + knowledge + question + output instructions. */
export function renderUser(
  request: PromptRequest,
  template: PromptTemplate,
  vars: Record<string, string>,
): { text: string; sections: PromptSection[] } {
  const memory = renderMemory(request);
  const knowledge = renderKnowledge(request);
  const output = template.outputInstructions.trim()
    ? `Output instructions:\n${interpolate(template.outputInstructions, vars)}`
    : null;
  const question = `User question:\n${request.question.trim()}`;

  const sections: PromptSection[] = [];
  if (memory) sections.push('memory');
  if (knowledge) sections.push('knowledge');
  sections.push('user');
  if (output) sections.push('output');

  return { text: joinSections([memory, knowledge, question, output]), sections };
}

/**
 * Assemble the full BuiltPrompt from a resolved template. Enforces the token
 * budget by trimming the (expendable) knowledge/memory block, never the question.
 */
export function assemble(request: PromptRequest, template: PromptTemplate): BuiltPrompt {
  const vars = collectVariables(request, template);
  const system = renderSystem(template, vars);
  const { text: user, sections } = renderUser(request, template, vars);

  const maxTokens = request.maxTokens ?? PROMPT_CONFIG.maxPromptTokens;
  const budgetForUser = Math.max(256, maxTokens - estimateTokens(system) - PROMPT_CONFIG.reserveForAnswerTokens);
  const { text: trimmedUser, truncated } = trimToTokens(user, budgetForUser);

  const allSections: PromptSection[] = ['system', ...(template.businessRules.length ? (['businessRules'] as const) : []), ...sections];
  const estimatedTokens = estimateTokens(system) + estimateTokens(trimmedUser);

  return {
    system,
    user: trimmedUser,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: trimmedUser },
    ],
    template: { id: template.id, version: template.version },
    estimatedTokens,
    truncated,
    metadata: {
      provider: request.provider ?? null,
      sections: allSections,
      language: vars.language,
      hasContext: Boolean(request.context?.context?.trim()),
      memoryCount: request.memory?.length ?? 0,
    },
  };
}
