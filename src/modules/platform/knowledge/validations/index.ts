// ==========================================================================
// Knowledge validations — zod schemas for actions/services boundaries.
// ==========================================================================

import { z } from 'zod';

export const searchModeSchema = z.enum(['keyword', 'semantic', 'hybrid']);

export const searchFiltersSchema = z
  .object({
    collectionKeys: z.array(z.string()).optional(),
    sourceKeys: z.array(z.string()).optional(),
    entityTypes: z.array(z.string()).optional(),
    language: z.string().optional(),
    status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED', 'DELETED']).optional(),
  })
  .optional();

export const searchQuerySchema = z.object({
  query: z.string().trim().min(1, 'Query is required').max(500),
  mode: searchModeSchema.optional(),
  filters: searchFiltersSchema,
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
});

export const retrievalRequestSchema = z.object({
  question: z.string().trim().min(1).max(1000),
  filters: searchFiltersSchema,
  topK: z.number().int().min(1).max(50).optional(),
  mode: searchModeSchema.optional(),
});

export const listDocumentsSchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
  sourceKey: z.string().optional(),
  collectionKey: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED', 'DELETED']).optional(),
  search: z.string().optional(),
});

export const syncSourceSchema = z.object({
  sourceKey: z.string().min(1),
  type: z.enum(['FULL', 'INCREMENTAL', 'REINDEX', 'SINGLE']).optional(),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type RetrievalRequestInput = z.infer<typeof retrievalRequestSchema>;
export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;
export type SyncSourceInput = z.infer<typeof syncSourceSchema>;
