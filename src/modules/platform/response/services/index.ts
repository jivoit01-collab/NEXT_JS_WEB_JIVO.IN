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
import { stableId, stripCitationMarkers } from '../utils';
import { RESPONSE_CONFIG } from '../config';
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
  // Citations are resolved FIRST, from the text that still carries [n] markers —
  // that is what maps each claim to a real Knowledge document (title + URL).
  let citations = extractCitations(norm.text, request.citations);

  // The model does not always emit [n] markers, even when it answered straight
  // from the context. Without them nothing resolves to a page, so a grounded
  // product answer would show no link at all. Fall back to the documents that
  // were actually retrieved — they are the same sources the answer came from.
  // No extra retrieval: these were already fetched to build the prompt.
  // …but NOT when the assistant just said it has no information. Attaching page
  // links to "I don't have that information yet" implies those pages answer the
  // question, which is exactly the false grounding we are avoiding.
  const disclaimed = /don't have that information|couldn't find that information/i.test(norm.text);

  if (citations.length === 0 && !disclaimed && request.citations?.length) {
    citations = request.citations.slice(0, RESPONSE_CONFIG.maxFallbackCitations).map((c) => ({
      marker: c.index,
      title: c.title,
      url: c.url,
      entityType: c.entityType,
      entityId: c.entityId,
      relevanceScore: c.relevanceScore,
      resolved: true,
    }));
  }
  const entities = extractEntities(norm.text);
  const links = extractLinks(rawText);
  const lead = detectLead(request.question, norm.text, entities);
  const actions = suggestActions(lead, links, citations);

  // …then the markers are stripped from everything the USER sees. Provenance
  // lives on `citations` (rendered as proper links/cards by the Experience
  // Platform), so raw "[1]" never reaches the chat UI.
  const displayText = stripCitationMarkers(norm.text);
  const blocks = parseMarkdown(displayText);

  const structured: StructuredResponse = {
    id: stableId(request.correlationId),
    provider: norm.provider,
    model: norm.model,
    fromFallback: norm.fromFallback,
    text: displayText,
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
