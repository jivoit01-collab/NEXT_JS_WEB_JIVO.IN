'use server';

// ==========================================================================
// Prompt Builder server actions — admin-guarded PREVIEW surface. Lets the admin
// preview the assembled prompt for a template + question (e.g. a prompt-studio).
// No public surface, no LLM. Reuses the Auth Platform guard.
// ==========================================================================

import { requireAdminGuard } from '@/modules/core/shared';
import { buildPromptForConversation } from '../services/for-conversation';
import { buildPrompt } from '../services';
import { listPromptTemplates } from '../templates';
import { listProviderFormatters } from '../providers';
import { promptOptionsSchema } from '../validations';
import type { PromptOptionsInput } from '../validations';

type Fail = { success: false; error: string };
const fail = (e: unknown): Fail => ({ success: false, error: e instanceof Error ? e.message : 'Failed' });

/** Preview an assembled prompt from raw options (no conversation, no knowledge). */
export async function previewPromptAction(input: PromptOptionsInput) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    const opts = promptOptionsSchema.parse(input);
    return { success: true as const, data: buildPrompt(opts) };
  } catch (e) {
    return fail(e);
  }
}

/** Preview the full grounded prompt for a real conversation turn. */
export async function previewConversationPromptAction(
  input: PromptOptionsInput & { conversationId: string; skipKnowledge?: boolean },
) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    const opts = promptOptionsSchema.parse(input);
    return {
      success: true as const,
      data: await buildPromptForConversation({
        ...opts,
        conversationId: input.conversationId,
        skipKnowledge: input.skipKnowledge,
      }),
    };
  } catch (e) {
    return fail(e);
  }
}

/** List registered templates (id, name, version, description) — admin picker. */
export async function listPromptTemplatesAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return {
    success: true as const,
    data: {
      templates: listPromptTemplates().map((t) => ({
        id: t.id,
        name: t.name,
        version: t.version,
        description: t.description,
      })),
      providers: listProviderFormatters(),
    },
  };
}
