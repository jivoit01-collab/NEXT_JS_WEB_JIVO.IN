// ==========================================================================
// Card helpers — shared factory so every builder produces consistent, ordered,
// stable-id'd cards. Pure.
// ==========================================================================

import { CARD_ORDER } from '../config';
import { clamp01, stableId } from '../utils';
import type { CardData, CardKind, ExperienceCard, PlanContext } from '../types';

/** Make a card with a stable id (derived from correlation + kind + salt). */
export function makeCard(
  kind: CardKind,
  source: string,
  data: CardData,
  ctx: PlanContext,
  opts: { orderBump?: number; confidence?: number; salt?: string } = {},
): ExperienceCard {
  return {
    id: `card_${kind}_${stableId(ctx.correlationId, `${kind}:${opts.salt ?? ''}`)}`,
    kind,
    order: CARD_ORDER[kind] + (opts.orderBump ?? 0),
    confidence: clamp01(opts.confidence ?? 1),
    source,
    data,
  };
}
