// ==========================================================================
// AI Response service — the reusable facade. Runs the full pipeline:
//
//   normalize → validate → parse(markdown) → extract(citations, entities, links,
//   lead, actions) → assemble StructuredResponse → emit analytics
//
// Pure & isomorphic (no LLM, no network, no Prisma). `processResponse` produces a
// provider-independent StructuredResponse ready for the Experience Engine.
// ==========================================================================

import { normalize } from '../normalizers';
import { validate } from '../validators';
import { parseMarkdown } from '../parsers';
import { extractCitations, extractEntities, extractLinks, detectLead, suggestActions } from '../extractors';
import { emitResponseEvents } from '../analytics';
import { stableId } from '../utils';
import type { ProcessResponseRequest, StructuredResponse } from '../types';

/**
 * Process a raw provider response into a validated, structured response object.
 * `emit` (default true) publishes analytics events; pass false for a dry run.
 */
export function processResponse(request: ProcessResponseRequest, emit = true): StructuredResponse {
  const norm = normalize(request.raw);
  const validation = validate(norm);

  // Extraction runs on RAW text (links need markdown syntax); blocks are stripped.
  const rawText = request.raw?.text ?? '';
  const blocks = parseMarkdown(norm.text);
  const citations = extractCitations(norm.text, request.citations);
  const entities = extractEntities(norm.text);
  const links = extractLinks(rawText);
  const lead = detectLead(request.question, norm.text, entities);
  const actions = suggestActions(lead, links, citations);

  const structured: StructuredResponse = {
    id: stableId(request.correlationId),
    provider: norm.provider,
    model: norm.model,
    fromFallback: norm.fromFallback,
    text: norm.text,
    blocks,
    citations,
    entities,
    links,
    actions,
    lead,
    usage: norm.usage,
    responseTimeMs: norm.responseTimeMs,
    finishReason: norm.finishReason,
    validation,
    metadata: {
      correlationId: request.correlationId ?? null,
      truncated: norm.truncated,
      empty: norm.empty,
      language: null,
      createdAt: null, // stamped by the server action (no Date.now in pure core)
    },
  };

  if (emit) emitResponseEvents(structured);
  return structured;
}
