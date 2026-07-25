// ==========================================================================
// AI Gateway validations — zod for the request envelope. Runtime types (signal,
// headers) are validated separately; this covers the serializable input a mobile
// / WhatsApp / admin client would send.
// ==========================================================================

import { z } from 'zod';
import { GATEWAY_CONFIG } from '../config';

export const gatewayRequestSchema = z.object({
  question: z.string().trim().min(1).max(GATEWAY_CONFIG.maxQuestionLength),
  conversationId: z.string().max(100).optional(),
  channel: z.enum(['web', 'mobile', 'admin', 'whatsapp', 'api']).optional(),
  visitorId: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),
  language: z.string().max(10).optional(),
  templateId: z.string().max(100).optional(),
  provider: z.string().max(50).optional(),
  skipKnowledge: z.boolean().optional(),
});

export type GatewayRequestInput = z.infer<typeof gatewayRequestSchema>;
