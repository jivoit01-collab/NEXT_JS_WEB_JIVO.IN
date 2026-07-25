// ==========================================================================
// Prompt Builder validations — zod for the request options (question + options).
// The `context`/`memory` come from the trusted Knowledge/Conversation platforms.
// ==========================================================================

import { z } from 'zod';

export const promptOptionsSchema = z.object({
  question: z.string().trim().min(1).max(4000),
  templateId: z.string().max(100).optional(),
  provider: z.string().max(50).optional(),
  variables: z.record(z.string(), z.string()).optional(),
  language: z.string().max(10).optional(),
  maxTokens: z.number().int().min(256).max(2_000_000).optional(),
});

export type PromptOptionsInput = z.infer<typeof promptOptionsSchema>;
