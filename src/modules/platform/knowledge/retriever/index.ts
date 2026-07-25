import 'server-only';

// ==========================================================================
// Retriever — question → top knowledge documents. NO LLM.
//
// This is the single seam every AI feature (Chatbot, Search, Recommendations,
// Voice, WhatsApp, …) calls. It returns the ranked documents PLUS a ready-to-use
// `context` string the caller can drop into an LLM prompt — but the retriever
// never talks to any LLM itself. It also publishes analytics events.
// ==========================================================================

import { platformEvents } from '@/modules/core/events';
import { search } from '../search';
import { KNOWLEDGE_CONFIG } from '../config';
import { makeExcerpt } from '../utils';
import { KNOWLEDGE_EVENTS, type RetrievalRequest, type RetrievalResult } from '../types';

/** Build the prompt-ready context block from ranked documents (no LLM). */
function buildContext(docs: RetrievalResult['documents']): string {
  return docs
    .map((d, i) => {
      const src = d.document.url ? ` (${d.document.url})` : '';
      return `[${i + 1}] ${d.document.title}${src}\n${makeExcerpt(d.document.content, 600)}`;
    })
    .join('\n\n');
}

/** Retrieve the top-K documents for a question. Reusable, LLM-agnostic. */
export async function retrieve(request: RetrievalRequest): Promise<RetrievalResult> {
  const started = Date.now();
  const topK = Math.min(request.topK ?? KNOWLEDGE_CONFIG.defaultTopK, KNOWLEDGE_CONFIG.maxTopK);

  const result = await search({
    query: request.question,
    mode: request.mode,
    filters: request.filters,
    limit: topK,
  });

  const documents = result.results.slice(0, topK);
  const tookMs = Date.now() - started;

  // Analytics: one SEARCH event + one DOCUMENT_USED per returned doc.
  platformEvents.emit(KNOWLEDGE_EVENTS.SEARCH, {
    query: request.question,
    mode: result.mode,
    resultCount: documents.length,
    tookMs,
  });
  for (const d of documents) {
    platformEvents.emit(KNOWLEDGE_EVENTS.DOCUMENT_USED, {
      documentId: d.document.id,
      sourceId: d.document.sourceId,
      score: d.score,
    });
  }

  return {
    question: request.question,
    documents,
    context: buildContext(documents),
    mode: result.mode,
    tookMs,
  };
}
