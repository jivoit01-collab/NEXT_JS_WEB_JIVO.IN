// ==========================================================================
// Conversation validations — zod schemas for action/service boundaries.
// ==========================================================================

import { z } from 'zod';

const memoryTypeSchema = z.enum([
  'PREFERENCE',
  'PROFILE',
  'SHOPPING',
  'HEALTH',
  'BUSINESS',
  'TEMPORARY',
  'LONG_TERM',
]);

const roleSchema = z.enum(['USER', 'ASSISTANT', 'SYSTEM', 'TOOL']);

export const startConversationSchema = z.object({
  visitorId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  title: z.string().max(200).optional(),
  language: z.string().max(10).optional(),
  modelProvider: z.string().max(50).optional(),
});

export const appendMessageSchema = z.object({
  conversationId: z.string().min(1),
  role: roleSchema,
  content: z.string().trim().min(1).max(20000),
  messageType: z.enum(['TEXT', 'IMAGE', 'AUDIO', 'TOOL_CALL', 'EVENT']).optional(),
  tokens: z.number().int().min(0).optional(),
  responseTime: z.number().int().min(0).optional(),
  confidence: z.number().min(0).max(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const stateUpdateSchema = z.object({
  currentIntent: z.string().nullable().optional(),
  currentTopic: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  lastMessageId: z.string().nullable().optional(),
  contextVersion: z.number().int().optional(),
  knowledgeVersion: z.number().int().optional(),
  estimatedTokens: z.number().int().optional(),
  streamingEnabled: z.boolean().optional(),
  modelProvider: z.string().nullable().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export const memoryInputSchema = z.object({
  conversationId: z.string().min(1),
  type: memoryTypeSchema,
  key: z.string().min(1).max(200),
  value: z.string().min(1).max(10000),
  importance: z.number().min(0).max(1).optional(),
  ttlMs: z.number().int().min(0).optional(),
});

export const messagePageSchema = z.object({
  conversationId: z.string().min(1),
  cursor: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

export const linkFeedbackSchema = z.object({
  messageId: z.string().min(1),
  feedbackId: z.string().min(1),
});

export type StartConversationInputValidated = z.infer<typeof startConversationSchema>;
export type AppendMessageInputValidated = z.infer<typeof appendMessageSchema>;
export type StateUpdateInputValidated = z.infer<typeof stateUpdateSchema>;
export type MemoryInputValidated = z.infer<typeof memoryInputSchema>;
