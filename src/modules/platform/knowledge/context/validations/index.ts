// ==========================================================================
// Context Builder validations — zod for the request options.
// (The `documents` array comes from the trusted Retriever, so only the scalar
// options are validated here.)
// ==========================================================================

import { z } from 'zod';

export const contextStrategySchema = z.enum([
  'compact',
  'balanced',
  'detailed',
  'citation',
  'product',
  'faq',
  'recipe',
]);

export const contextOptionsSchema = z.object({
  strategy: contextStrategySchema.optional(),
  model: z.string().max(100).optional(),
  tokenBudget: z.number().int().min(128).max(2_000_000).optional(),
});

export type ContextOptionsInput = z.infer<typeof contextOptionsSchema>;
