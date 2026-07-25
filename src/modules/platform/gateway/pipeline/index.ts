import 'server-only';

// ==========================================================================
// The AI pipeline — the ONE place the full flow runs. Every AI surface (chat
// action, future mobile/WhatsApp route handlers) delegates here, so business
// logic is never duplicated.
//
//   Conversation (ensure) → Prompt (memory + Knowledge + Context) → Provider
//   → Response (structure) → Experience (plan) → Conversation (persist)
//
// The AI Provider is key-gated; if it is unavailable the pipeline returns a
// graceful fallback message (still stored + logged) rather than throwing.
// ==========================================================================

import {
  startConversation,
  continueConversation,
} from '@/modules/platform/conversation/manager';
import { buildPromptForConversationDetailed } from '@/modules/platform/prompt/services/for-conversation';
import { generate } from '@/modules/platform/ai-provider/services';
import { processResponse } from '@/modules/platform/response';
import { planExperience } from '@/modules/platform/experience';
import { recordExecution } from '@/modules/platform/observability/services';
import { GATEWAY_CONFIG } from '../config';
import type { AIGatewayRequest, AIGatewayResponse, GatewayChannel, GatewayIdentity } from '../types';

export interface PipelineInput {
  request: AIGatewayRequest;
  identity: GatewayIdentity;
  channel: GatewayChannel;
  correlationId: string;
}

/** Ensure a conversation exists (continue the given one, or start a new one). */
async function ensureConversation(input: PipelineInput): Promise<string> {
  if (input.request.conversationId) return input.request.conversationId;
  const conversation = await startConversation({
    visitorId: input.identity.visitorId ?? undefined,
    userId: input.identity.userId ?? undefined,
    sessionId: input.identity.sessionId ?? undefined,
    language: input.request.language,
    title: 'Chat',
  });
  return conversation.id;
}

/** Run the full pipeline and return ONE structured gateway response. */
export async function runPipeline(input: PipelineInput): Promise<AIGatewayResponse> {
  const { request, channel, correlationId } = input;
  const conversationId = await ensureConversation(input);

  // 1) Persist the user's message.
  await continueConversation({ conversationId, role: 'USER', content: request.question });

  // 2) Build the grounded prompt (Conversation memory + Knowledge Context). The
  //    detailed builder also returns the context it used — provenance for
  //    observability, from the SAME single retrieval (no duplicate work).
  const { prompt, context } = await buildPromptForConversationDetailed({
    conversationId,
    question: request.question,
    templateId: request.templateId,
    provider: request.provider,
    language: request.language,
    skipKnowledge: request.skipKnowledge,
  });

  // Provenance shared by every observability write below.
  const provenance = {
    correlationId,
    conversationId,
    visitorId: input.identity.visitorId,
    userId: input.identity.userId,
    channel,
    promptTemplate: prompt.template.id,
    promptVersion: prompt.template.version,
    contextStrategy: context?.metadata.strategy ?? null,
    retrievedDocs: context?.statistics.documentsUsed ?? 0,
    knowledgeVersion: null as number | null,
  };

  // 3) Call the AI provider. Graceful fallback if unavailable/erroring.
  try {
    const ai = await generate({
      prompt,
      provider: request.provider,
      allowFallback: true,
      signal: request.signal,
      correlationId,
    });

    // 4) Structure the response.
    const structured = processResponse({ raw: ai, question: request.question, correlationId });

    // 5) Plan the experience (cards).
    const experience = planExperience({
      response: structured,
      question: request.question,
      surface: channel,
      correlationId,
      feedbackEntity: { entityType: 'conversation', entityId: conversationId },
    });

    // 6) Persist the assistant message.
    const stored = await continueConversation({
      conversationId,
      role: 'ASSISTANT',
      content: structured.text,
      tokens: structured.usage.totalTokens,
      responseTime: ai.responseTimeMs,
      confidence: structured.validation.quality,
    });

    // 7) Record execution metadata (best-effort; never blocks the answer).
    await recordExecution({
      ...provenance,
      messageId: stored.id,
      provider: ai.provider,
      model: ai.model,
      fromFallback: ai.fromFallback,
      responseTimeMs: ai.responseTimeMs,
      promptTokens: structured.usage.promptTokens,
      completionTokens: structured.usage.completionTokens,
      totalTokens: structured.usage.totalTokens,
      experienceCards: experience.cards.length,
      success: true,
      quality: structured.validation.quality,
    });

    return {
      ok: true,
      conversationId,
      message: { id: stored.id, role: 'assistant', content: structured.text, createdAt: stored.createdAt },
      structured,
      experience,
      meta: {
        channel,
        provider: ai.provider,
        fromFallback: ai.fromFallback,
        responseTimeMs: ai.responseTimeMs,
        fromCacheOrFallbackMessage: false,
        correlationId,
      },
    };
  } catch (providerErr) {
    // Surface the REAL provider error in development; keep the friendly fallback
    // for production. This is why the widget shows "…being set up right now".
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[AI Gateway] provider call failed — returning fallback. Real error:',
        providerErr instanceof Error ? `${providerErr.name}: ${providerErr.message}` : providerErr,
      );
    }

    // Provider unavailable → friendly fallback (still stored + surfaced as ok).
    const text = GATEWAY_CONFIG.unavailableMessage;
    const stored = await continueConversation({ conversationId, role: 'ASSISTANT', content: text });
    const structured = processResponse({ raw: {
      provider: 'none', model: 'none', text, usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      responseTimeMs: 0, finishReason: 'error', fromFallback: false,
    }, question: request.question, correlationId }, false);

    // Record the failed execution too (for debugging + failure-rate metrics).
    await recordExecution({
      ...provenance,
      messageId: stored.id,
      provider: 'none',
      model: null,
      fromFallback: false,
      responseTimeMs: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      experienceCards: 0,
      success: false,
      errorType: providerErr instanceof Error ? providerErr.name : 'provider_unavailable',
    });

    return {
      ok: true,
      conversationId,
      message: { id: stored.id, role: 'assistant', content: text, createdAt: stored.createdAt },
      structured,
      experience: null,
      meta: {
        channel,
        provider: 'none',
        fromFallback: false,
        responseTimeMs: 0,
        fromCacheOrFallbackMessage: true,
        correlationId,
      },
    };
  }
}
