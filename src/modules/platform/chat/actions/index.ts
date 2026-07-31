'use server';

// ==========================================================================
// AI Chat server actions — thin ADAPTERS for the chat widget. They own no
// pipeline logic: `sendMessageAction` delegates to the AI Gateway (the single
// pipeline entry point) and maps its structured result to the widget's shape.
// `startChatAction` / `restoreChatAction` are conversation-lifecycle helpers.
// ==========================================================================

import { headers } from 'next/headers';
import { platformEvents } from '@/modules/core/events';
import {
  startConversation as startConversationManager,
  restoreConversation,
  findLatestConversationByVisitor,
} from '@/modules/platform/conversation/manager';
import { execute } from '@/modules/platform/gateway/services';
import { CHAT_CONFIG } from '../config';
import { CHAT_EVENTS } from '../types';
import { toChatMessage, questionsFromPlan } from '../utils';
import type { ChatSession, ChatTurnResult, ChatMessage } from '../types';

type Fail = { success: false; error: string };
const fail = (e: unknown): Fail => ({ success: false, error: e instanceof Error ? e.message : 'Chat failed' });

// ── Start (or resume) the visitor's SINGLE chat ──────────────
// One anonymous visitor = one conversation. If the visitor already has a
// conversation, resume it (and load its messages) instead of creating another —
// preventing duplicate conversations / DB growth. A brand-new visitor gets one.
export async function startChatAction(input: { visitorId?: string; userId?: string; sessionId?: string }) {
  try {
    // Reuse the visitor's existing conversation when we can identify them.
    if (input.visitorId) {
      const existing = await findLatestConversationByVisitor(input.visitorId);
      if (existing) return restoreChatAction(existing.id);
    }

    const conversation = await startConversationManager({
      visitorId: input.visitorId,
      userId: input.userId,
      sessionId: input.sessionId,
      title: 'Chat',
    });
    const session: ChatSession = {
      conversationId: conversation.id,
      messages: [],
      suggestedQuestions: [...CHAT_CONFIG.defaultQuestions],
    };
    return { success: true as const, data: session };
  } catch (e) {
    return fail(e);
  }
}

// ── Restore a previous chat ──────────────────────────────────
export async function restoreChatAction(conversationId: string) {
  try {
    const snap = await restoreConversation(conversationId);
    if (!snap) return fail(new Error('Conversation not found'));

    const messages: ChatMessage[] = snap.recentMessages.messages.map((m) =>
      toChatMessage({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt }),
    );
    platformEvents.emit(CHAT_EVENTS.CONVERSATION_RESTORED, { conversationId, count: messages.length });

    const session: ChatSession = {
      conversationId,
      messages,
      suggestedQuestions: [...CHAT_CONFIG.defaultQuestions],
    };
    return { success: true as const, data: session };
  } catch (e) {
    return fail(e);
  }
}

// ── Send a message ───────────────────────────────────────────
// Delegates to the AI Gateway (Phase 7.7) — the SINGLE place the pipeline runs.
// This action only adapts the gateway's structured result to the widget's shape;
// it duplicates NO pipeline logic.
export async function sendMessageAction(input: { conversationId: string; content: string }) {
  const { conversationId, content } = input;
  try {
    platformEvents.emit(CHAT_EVENTS.MESSAGE_SENT, { conversationId });

    const h = await headers();
    const result = await execute({ question: content, conversationId, channel: 'web', headers: h });

    if (!result.ok) {
      // Gateway messages are always friendly + leak-proof. Surface known,
      // recoverable states (disabled / rate-limited / unavailable) as a normal
      // assistant reply instead of a hard error banner.
      if (result.code === 'unavailable' || result.code === 'rate_limited') {
        const message: ChatMessage = {
          id: `gw_${result.code}`,
          role: 'assistant',
          content: result.message,
          status: 'sent',
          createdAt: null,
          plan: null,
        };
        return { success: true as const, data: { message, plan: null } as ChatTurnResult };
      }
      return fail(new Error(result.message));
    }

    platformEvents.emit(CHAT_EVENTS.MESSAGE_RECEIVED, { conversationId, provider: result.meta.provider });
    const message: ChatMessage = {
      id: result.message.id,
      role: 'assistant',
      content: result.message.content,
      status: 'sent',
      createdAt: result.message.createdAt,
      plan: result.experience,
    };
    const turn: ChatTurnResult = { message, plan: result.experience };
    return { success: true as const, data: turn };
  } catch (e) {
    return fail(e);
  }
}

// Expose the fallback question helper's default for symmetry (client already has it).
export async function chatSuggestedQuestionsAction(plan: Parameters<typeof questionsFromPlan>[0]) {
  return { success: true as const, data: questionsFromPlan(plan, [...CHAT_CONFIG.defaultQuestions]) };
}
