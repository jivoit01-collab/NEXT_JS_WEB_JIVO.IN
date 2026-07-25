'use server';

// ==========================================================================
// Conversation server actions — admin-guarded (no public chat surface exists
// yet; a future Chat UI will add its own visitor-scoped, rate-limited entry
// points via the manager). Reuses the Auth Platform guard.
// ==========================================================================

import { requireAdminGuard } from '@/modules/core/shared';
import {
  startConversation,
  continueConversation,
  endConversation,
  restoreConversation,
  rememberFact,
  recallMemory,
  getMessages,
  getConversationStats,
  recentConversations,
} from '../services';
import { startConversationSchema, appendMessageSchema, memoryInputSchema, messagePageSchema } from '../validations';
import type {
  StartConversationInput,
  AppendMessageInput,
  MemoryInput,
} from '../types';

type Fail = { success: false; error: string };
const fail = (e: unknown): Fail => ({ success: false, error: e instanceof Error ? e.message : 'Failed' });

export async function startConversationAction(input: StartConversationInput) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    return { success: true as const, data: await startConversation(startConversationSchema.parse(input)) };
  } catch (e) {
    return fail(e);
  }
}

export async function continueConversationAction(input: AppendMessageInput) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    return { success: true as const, data: await continueConversation(appendMessageSchema.parse(input)) };
  } catch (e) {
    return fail(e);
  }
}

export async function endConversationAction(conversationId: string) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    await endConversation(conversationId);
    return { success: true as const, data: { conversationId } };
  } catch (e) {
    return fail(e);
  }
}

export async function restoreConversationAction(conversationId: string) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true as const, data: await restoreConversation(conversationId) };
}

export async function getMessagesAction(input: { conversationId: string; cursor?: string; pageSize?: number }) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  const { conversationId, cursor, pageSize } = messagePageSchema.parse(input);
  return { success: true as const, data: await getMessages(conversationId, cursor, pageSize) };
}

export async function rememberFactAction(input: MemoryInput) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  try {
    return { success: true as const, data: await rememberFact(memoryInputSchema.parse(input)) };
  } catch (e) {
    return fail(e);
  }
}

export async function recallMemoryAction(conversationId: string) {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true as const, data: await recallMemory(conversationId) };
}

export async function conversationStatsAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true as const, data: await getConversationStats() };
}

export async function recentConversationsAction() {
  const guard = await requireAdminGuard();
  if (guard) return guard;
  return { success: true as const, data: await recentConversations() };
}
