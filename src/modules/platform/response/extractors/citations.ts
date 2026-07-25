// ==========================================================================
// Citation extractor — find inline [n] markers in the text and resolve each to a
// Context Builder KnowledgeCitation (provenance). Unresolved markers are kept but
// flagged, so a "Sources" UI can render only real ones.
// ==========================================================================

import type { KnowledgeCitation } from '@/modules/platform/knowledge/context';
import type { ResponseCitation } from '../types';

const MARKER = /\[(\d{1,3})\]/g;

export function extractCitations(text: string, citations: KnowledgeCitation[] = []): ResponseCitation[] {
  const byIndex = new Map<number, KnowledgeCitation>();
  for (const c of citations) byIndex.set(c.index, c);

  const seen = new Set<number>();
  const out: ResponseCitation[] = [];
  for (const m of text.matchAll(MARKER)) {
    const marker = Number(m[1]);
    if (seen.has(marker)) continue;
    seen.add(marker);

    const src = byIndex.get(marker);
    if (src) {
      out.push({
        marker,
        title: src.title,
        url: src.url,
        entityType: src.entityType,
        entityId: src.entityId,
        relevanceScore: src.relevanceScore,
        resolved: true,
      });
    } else {
      out.push({
        marker,
        title: `Source ${marker}`,
        url: null,
        entityType: 'unknown',
        entityId: null,
        relevanceScore: 0,
        resolved: false,
      });
    }
  }
  return out.sort((a, b) => a.marker - b.marker);
}
