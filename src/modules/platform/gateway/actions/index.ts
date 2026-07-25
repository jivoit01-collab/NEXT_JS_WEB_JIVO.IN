'use server';

// ==========================================================================
// AI Gateway server action — the web/admin client entry point. It forwards the
// request headers (for IP-based rate limiting when there's no session) and calls
// the single `execute` gateway. No pipeline logic here.
// ==========================================================================

import { headers } from 'next/headers';
import { execute } from '../services';
import type { AIGatewayResult, GatewayChannel } from '../types';

export interface GatewayActionInput {
  question: string;
  conversationId?: string;
  channel?: GatewayChannel;
  visitorId?: string;
  sessionId?: string;
  language?: string;
  templateId?: string;
  provider?: string;
  skipKnowledge?: boolean;
}

/** Execute an AI request from a server-action client (web/admin). */
export async function aiGatewayAction(input: GatewayActionInput): Promise<AIGatewayResult> {
  const h = await headers();
  return execute({ ...input, headers: h });
}
