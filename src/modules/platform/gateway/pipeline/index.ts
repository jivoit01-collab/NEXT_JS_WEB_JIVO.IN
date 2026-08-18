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
  findLatestConversationByVisitor,
  readState,
  updateState,
  getMessages,
  recallMemory,
  rememberFact,
} from '@/modules/platform/conversation/manager';
import { buildPromptForConversationDetailed } from '@/modules/platform/prompt/services/for-conversation';
import { generate } from '@/modules/platform/ai-provider/services';
import { processResponse } from '@/modules/platform/response';
import { planExperience } from '@/modules/platform/experience';
import { recordExecution } from '@/modules/platform/observability/services';
import { platformEvents } from '@/modules/core/events';
import { GATEWAY_CONFIG } from '../config';
import { SHOP_URL, MARKETPLACES } from '@/lib/constants';
import { getSiteContact, getSiteSocials } from './site-contact';
import { getPagePreviews, shopPreview } from './page-preview';
import { decideGrounding, searchWeb } from '../grounding';
import { moderate, warningFor, BLOCKED_MESSAGE, MAX_ABUSE_STRIKES } from '../moderation';
import {
  classifyTurn,
  entityLabel,
  isPublicUrl,
  SECURITY_REFUSAL,
  type TurnClassification,
} from '../safety';
import type { AIGatewayRequest, AIGatewayResponse, GatewayChannel, GatewayIdentity } from '../types';

export interface PipelineInput {
  request: AIGatewayRequest;
  identity: GatewayIdentity;
  channel: GatewayChannel;
  correlationId: string;
}

/**
 * Ensure a conversation exists (continue the given one, or start a new one).
 *
 * One visitor = ONE conversation: when no conversationId is supplied but we can
 * identify the visitor, resume their existing conversation instead of creating
 * another. Without this, any caller that omits the id (a channel that doesn't
 * persist it, a retry) silently forks a duplicate conversation for the visitor.
 */
async function ensureConversation(input: PipelineInput): Promise<string> {
  if (input.request.conversationId) return input.request.conversationId;

  const visitorId = input.identity.visitorId;
  if (visitorId) {
    const existing = await findLatestConversationByVisitor(visitorId);
    if (existing) return existing.id;
  }

  const conversation = await startConversation({
    visitorId: input.identity.visitorId ?? undefined,
    userId: input.identity.userId ?? undefined,
    sessionId: input.identity.sessionId ?? undefined,
    language: input.request.language,
    // Deliberately untitled: `appendMessage` derives the title from the FIRST
    // user message, and it only does so while the title is empty. A "Chat"
    // placeholder here would permanently mask the real question in the admin list.
    title: undefined,
  });
  return conversation.id;
}

/**
 * Per-turn guidance appended to the prompt's output instructions.
 *
 * This is how a resolved pronoun and the turn's intent reach the model without
 * new templates: "it" is replaced by the actual product name, and a purchase
 * question is told to point at the shop rather than describe a product again.
 */
function buildTurnVariables(
  turn: TurnClassification,
  resolvedLabel: string | null,
  transcript?: string | null,
): Record<string, string> {
  const parts: string[] = [];

  if (resolvedLabel) {
    parts.push(
      `The user is asking about ${resolvedLabel}. Any pronoun ("it", "this") refers to ${resolvedLabel} — answer about that product only, and do not introduce other products.`,
    );
  }

  if (turn.intent === 'purchase') {
    parts.push(
      'This is a PURCHASE question. Answer in 10-30 words saying it can be bought from the Jivo online shop. Do not describe the product again and do not list other products.',
    );
  } else if (turn.intent === 'all_products') {
    parts.push('Give a brief overview of the product range in 30-60 words. Do not list URLs.');
  } else if (turn.intent === 'contact') {
    parts.push(
      'This is a CONTACT question. Answer in 20-50 words. Do not write the phone, email or address — they are shown beneath your answer.',
    );
  } else if (turn.intent === 'social') {
    parts.push(
      "This is a SOCIAL question. Jivo IS on social media and the official links are shown as buttons beneath your answer — that is verified data, so the \"I don't have that information\" rule does NOT apply. " +
        'Reply in one short sentence inviting the user to follow Jivo using the links below. Do NOT write any URLs or handles yourself.',
    );
  } else if (turn.intent === 'company') {
    parts.push(
      'This is a question about the COMPANY (its mission, values, story or people). Answer only from the company context. Do NOT describe or recommend products.',
    );
  } else if (turn.intent === 'conversation') {
    parts.push(
      'This question is about THIS CHAT itself, NOT about Jivo products or the website. ' +
        'The "Conversation so far" block below IS your source — it is verified data, so the ' +
        '"I don\'t have that information" rule does NOT apply here. Read the summary line for ' +
        'counts and elapsed time and answer directly from it.',
    );
    if (transcript) parts.push(`\nConversation so far:\n${transcript}`);
  }

  // Default length policy: 2-4 short sentences unless an intent overrode it.
  parts.push('Keep the answer to 2-4 short sentences.');

  return { turn_guidance: parts.join(' ') };
}

/** Memory key holding a conversation's abuse-strike count. */
const ABUSE_KEY = 'abuse:strikes';

/**
 * Read the strike count from ConversationMemory.
 *
 * Reuses the existing conversation store — no moderation table, and the abusive
 * text itself is never persisted beyond the ConversationMessage the pipeline
 * already writes.
 */
async function readAbuseStrikes(conversationId: string): Promise<number> {
  try {
    const memories = await recallMemory(conversationId);
    const hit = memories.find((m) => m.key === ABUSE_KEY);
    const n = hit ? Number.parseInt(hit.value, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Persist the strike count (upsert on the unique conversation+type+key). */
async function writeAbuseStrikes(conversationId: string, strikes: number): Promise<void> {
  await rememberFact({
    conversationId,
    type: 'LONG_TERM',
    key: ABUSE_KEY,
    value: String(strikes),
    importance: 1, // never evicted before ordinary facts
  });
}

/**
 * A refusal for confidential/administrative requests.
 *
 * Returned WITHOUT calling Knowledge or the provider, and phrased as a refusal
 * ("I can't provide…") rather than a knowledge gap ("I don't have…"), so the
 * assistant never implies the secret merely wasn't retrieved. Carries no cards
 * and no links.
 */
async function canned(args: {
  conversationId: string;
  channel: GatewayChannel;
  correlationId: string;
  question: string;
  /** The exact text to reply with (security refusal, abuse warning, block). */
  text: string;
}): Promise<AIGatewayResponse> {
  const { conversationId, channel, correlationId, question, text } = args;
  const stored = await continueConversation({
    conversationId,
    role: 'ASSISTANT',
    content: text,
  });

  const structured = processResponse(
    {
      raw: {
        provider: 'none',
        model: 'none',
        text,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        responseTimeMs: 0,
        finishReason: 'stop',
        fromFallback: false,
      },
      question,
      correlationId,
    },
    false,
  );

  return {
    ok: true,
    conversationId,
    message: {
      id: stored.id,
      role: 'assistant',
      content: text,
      createdAt: stored.createdAt,
    },
    structured,
    // No experience cards: a refusal must not offer links of any kind.
    experience: {
      id: `canned_${correlationId}`,
      cards: [],
      intents: [],
      metadata: { correlationId, surface: channel, cardCount: 0, truncated: false, createdAt: null },
    },
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

/** Run the full pipeline and return ONE structured gateway response. */
export async function runPipeline(input: PipelineInput): Promise<AIGatewayResponse> {
  const { request, channel, correlationId } = input;
  const conversationId = await ensureConversation(input);

  // 1) Persist the user's message.
  await continueConversation({ conversationId, role: 'USER', content: request.question });

  // 1a) Classify the turn BEFORE any retrieval or provider call. Conversation
  //     state supplies the previous product ("it") and the sticky language, so
  //     no extra Knowledge search is needed to resolve a pronoun.
  const previousState = await readState(conversationId);
  const turn = classifyTurn({
    question: request.question,
    previousEntity: previousState?.currentTopic ?? null,
    previousLanguage: previousState?.currentIntent ?? null,
  });

  // 1a-i) MODERATION GATE — runs before everything else.
  //
  // Strikes live in ConversationMemory (a LONG_TERM fact keyed "abuse:strikes"),
  // reusing the existing conversation store: no new table, no new query beyond
  // the memory the pipeline already reads. A blocked visitor short-circuits here,
  // so an abusive session consumes ZERO AI tokens.
  const strikes = await readAbuseStrikes(conversationId);

  if (strikes >= MAX_ABUSE_STRIKES) {
    return canned({
      conversationId,
      channel,
      correlationId,
      question: request.question,
      text: BLOCKED_MESSAGE,
    });
  }

  const verdict = moderate(request.question);
  if (verdict.abusive) {
    const next = strikes + 1;
    await writeAbuseStrikes(conversationId, next).catch(() => {});
    platformEvents.emit('ai:chat_abuse_detected', {
      conversationId,
      strikes: next,
      blocked: next >= MAX_ABUSE_STRIKES,
      // The matched TERM only — never the visitor's full message.
      matched: verdict.matched,
    });
    return canned({
      conversationId,
      channel,
      correlationId,
      question: request.question,
      text: next >= MAX_ABUSE_STRIKES ? BLOCKED_MESSAGE : warningFor(next),
    });
  }

  // 1b) SECURITY GATE. Confidential requests are refused here — the question
  //     never reaches Knowledge or Gemini, so no prompt-injection can talk the
  //     model into disclosing anything. This is a refusal, not a knowledge gap.
  if (turn.security) {
    return canned({
      conversationId,
      channel,
      correlationId,
      question: request.question,
      text: SECURITY_REFUSAL,
    });
  }

  // 1c) Persist the resolved entity + language so the NEXT turn can inherit them
  //     ("Where can I buy it?" → still Canola). One small row update, no new table.
  if (turn.entity !== previousState?.currentTopic || turn.language !== previousState?.currentIntent) {
    await updateState(conversationId, {
      currentTopic: turn.entity ?? previousState?.currentTopic ?? null,
      currentIntent: turn.language ?? previousState?.currentIntent ?? null,
    }).catch(() => {});
  }

  // 2) Build the grounded prompt (Conversation memory + Knowledge Context). The
  //    detailed builder also returns the context it used — provenance for
  //    observability, from the SAME single retrieval (no duplicate work).
  //
  //    The RETRIEVAL question is expanded with the resolved entity so a pronoun
  //    question ("where can I buy it?") retrieves the right product's documents.
  //    The Knowledge base is written in ENGLISH, so a question asked in another
  //    language (or using a pronoun) retrieves nothing on its own. Appending the
  //    resolved entity's English label gives retrieval a term it can match, while
  //    the answer itself is still generated in the user's language.
  const resolvedLabel = entityLabel(turn.entity);
  const retrievalQuestion = resolvedLabel
    ? `${request.question} ${resolvedLabel}`
    : request.question;

  // Intent-scoped retrieval. Restricting the COLLECTION is what stops a company
  // question from being answered with product copy that merely shares keywords —
  // the collections already exist ("our-essence", "products", "company"), so this
  // is a filter, not a second search.
  // A CONVERSATION turn answers from the chat itself, so it needs the transcript.
  // Fetched ONLY for that intent — every other turn skips this query entirely.
  let transcript: string | null = null;
  if (turn.intent === 'conversation') {
    try {
      const page = await getMessages(conversationId);
      const ordered = page.messages.slice().reverse(); // getMessages is newest-first
      const lines = ordered.map(
        (m, i) => `${i + 1}. ${m.role}: ${m.content.slice(0, 200)}`,
      );

      // Pre-compute the facts a model cannot reliably derive from raw ISO
      // timestamps (elapsed minutes, counts) so it only has to phrase them.
      const first = ordered[0]?.createdAt;
      const last = ordered[ordered.length - 1]?.createdAt;
      const summary: string[] = [`Messages exchanged: ${ordered.length}`];
      if (first && last) {
        const mins = Math.max(
          0,
          Math.round((new Date(last).getTime() - new Date(first).getTime()) / 60000),
        );
        summary.push(
          mins < 1 ? 'Elapsed: less than a minute' : `Elapsed: about ${mins} minute(s)`,
          `Started: ${first}`,
        );
      }
      transcript = `${summary.join(' | ')}\n${lines.join('\n')}`;
    } catch {
      transcript = null;
    }
  }

  const collectionKeys =
    turn.intent === 'company'
      ? ['our-essence', 'company', 'home']
      : turn.intent === 'product_page' || turn.intent === 'all_products'
        ? ['products']
        : undefined;

  const { prompt, context } = await buildPromptForConversationDetailed({
    conversationId,
    question: retrievalQuestion,
    templateId: request.templateId,
    provider: request.provider,
    // An explicitly requested language (Hinglish) overrides the caller's default.
    language: turn.language ?? request.language,
    // A CONVERSATION question ("how long have we been chatting?") is answered
    // from the conversation itself — searching Knowledge would only inject
    // irrelevant product copy.
    // CONVERSATION answers from the chat; SOCIAL answers from the footer links.
    // Neither has anything to gain from a Knowledge search.
    skipKnowledge:
      request.skipKnowledge || turn.intent === 'conversation' || turn.intent === 'social',
    collectionKeys,
    variables: buildTurnVariables(turn, resolvedLabel, transcript),
  });

  // 2a) Grounding decision. Jivo Knowledge always answers first; the open web is
  //     consulted only for non-Jivo questions Knowledge could not answer, and
  //     only when WEB_GROUNDING_ENABLED is set. A Gemini key alone does NOT
  //     provide live search, so this is the seam where a real provider plugs in.
  const grounding = decideGrounding({
    question: request.question,
    retrievedDocs: context?.statistics.documentsUsed ?? 0,
  });
  if (grounding.useWeb) {
    const webResults = await searchWeb(retrievalQuestion).catch(() => []);
    if (process.env.NODE_ENV !== 'production' && webResults.length === 0) {
      console.warn('[AI Gateway] web grounding enabled but no search provider is configured.');
    }
  }

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

    // 4) Structure the response. The context's citations are passed in so each
    //    [n] marker resolves to a REAL Knowledge document (title + CMS url) —
    //    that is what turns markers into internal links instead of raw "[1]".
    // PUBLIC URL SAFETY FILTER. Every citation URL is checked against the
    // allowlist BEFORE it can become a link/card. A document whose URL is
    // internal keeps its text (it may still ground the answer) but loses the
    // link, so an internal path can never reach a visitor even if it somehow
    // ended up in the Knowledge base.
    const safeSources = context?.sources.map((s) =>
      isPublicUrl(s.url) ? s : { ...s, url: null },
    );

    const rawStructured = processResponse({
      raw: ai,
      question: request.question,
      correlationId,
      citations: safeSources,
    });

    // Any URL the MODEL wrote is filtered too — it could invent an internal path
    // or an off-brand host. Same allowlist, applied to links and their actions.
    // Shadowed deliberately: everything downstream sees only the filtered object,
    // so no later edit can accidentally reintroduce an unfiltered URL.
    const structured = {
      ...rawStructured,
      links: rawStructured.links.filter((l) => isPublicUrl(l.href)),
      actions: rawStructured.actions.filter((a) => a.type !== 'open_link' || isPublicUrl(a.target)),
    };

    // 5) Plan the experience (cards). Verified CMS contact details are supplied
    //    so the Contact card shows real values rather than anything the model
    //    might have written (it is told not to write them at all).
    const experience = planExperience({
      response: structured,
      question: request.question,
      surface: channel,
      correlationId,
      feedbackEntity: { entityType: 'conversation', entityId: conversationId },
      siteContact: await getSiteContact(),
      turnIntent: turn.intent,
      shopUrl: SHOP_URL,
      // CMS SEO metadata for link previews — read from the database, never by
      // fetching the public page.
      pagePreviews: await getPagePreviews(),
      shopPreview: shopPreview(SHOP_URL),
      socialLinks: turn.intent === 'social' ? await getSiteSocials() : undefined,
      marketplaces: turn.intent === 'purchase' || turn.intent === 'all_products' ? [...MARKETPLACES] : undefined,
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
