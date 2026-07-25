// ==========================================================================
// AI Response Platform — types (the contract).
//
// A pure transformation layer that turns a raw provider AIResponse into ONE
// validated, normalized, structured response object the Experience Engine can
// render. It calls NO LLM and talks to NO external API — the AI Provider Platform
// already did that. It knows nothing about any single provider (provider-neutral).
// ==========================================================================

import type { AIResponse, TokenUsage } from '@/modules/platform/ai-provider';
import type { KnowledgeCitation } from '@/modules/platform/knowledge/context';

// ── Input ────────────────────────────────────────────────────
/** What the platform needs to process a response. `raw` is the provider output. */
export interface ProcessResponseRequest {
  raw: AIResponse;
  /** Citations from the Context Builder — used to resolve inline [n] markers. */
  citations?: KnowledgeCitation[];
  /** Correlation (e.g. conversationId/messageId) for analytics. */
  correlationId?: string;
  /** The user's original question — improves lead/intent detection. */
  question?: string;
}

// ── Extracted pieces ─────────────────────────────────────────
export interface ResponseCitation {
  marker: number; // the [n] used in text
  title: string;
  url: string | null;
  entityType: string;
  entityId: string | null;
  relevanceScore: number;
  /** True when the marker resolved to a known Context Builder citation. */
  resolved: boolean;
}

export type EntityKind = 'email' | 'phone' | 'url' | 'money' | 'product' | 'date';

export interface ResponseEntity {
  kind: EntityKind;
  value: string;
  /** Normalized form (e.g. digits-only phone, lowercased email). */
  normalized: string;
}

export interface ResponseLink {
  href: string;
  label: string;
  external: boolean;
}

export type ActionType =
  | 'view_product'
  | 'contact_support'
  | 'book_consultation'
  | 'open_link'
  | 'ask_followup'
  | 'subscribe';

/** A suggested next step the Experience Engine can render as a button/chip. */
export interface SuggestedAction {
  type: ActionType;
  label: string;
  /** Optional target (url, productId, entityId, …). */
  target?: string;
  /** 0..1 confidence this action is relevant. */
  confidence: number;
}

/** A detected sales/contact opportunity for CRM / lead capture (future). */
export interface LeadSignal {
  isLead: boolean;
  /** 0..1 strength of the opportunity. */
  score: number;
  /** Why it was flagged (matched intents). */
  reasons: string[];
  wantsContact: boolean;
  /** Contact details the user volunteered, if any. */
  contact: { email?: string; phone?: string };
}

// ── Validation ───────────────────────────────────────────────
export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  code: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidationResult {
  valid: boolean; // false only when a blocking `error` is present
  issues: ValidationIssue[];
  /** 0..1 heuristic quality/confidence score. */
  quality: number;
}

// ── Safe-parsed markdown ─────────────────────────────────────
export type BlockType = 'paragraph' | 'heading' | 'list' | 'ordered-list' | 'code' | 'quote';

export interface ContentBlock {
  type: BlockType;
  /** Plain text (markdown tokens stripped) — safe to render. */
  text: string;
  /** For lists: the individual items. */
  items?: string[];
  /** For headings: level 1..6. For code: language. */
  meta?: { level?: number; language?: string };
}

// ── The structured response (for the Experience Engine) ──────
export interface StructuredResponse {
  /** Stable-ish id derived from correlation (no RNG). */
  id: string;
  provider: string;
  model: string;
  fromFallback: boolean;

  /** Normalized plain text (safe, trimmed). */
  text: string;
  /** Safe markdown broken into renderable blocks. */
  blocks: ContentBlock[];

  citations: ResponseCitation[];
  entities: ResponseEntity[];
  links: ResponseLink[];
  actions: SuggestedAction[];
  lead: LeadSignal;

  usage: TokenUsage;
  responseTimeMs: number;
  finishReason: AIResponse['finishReason'];
  validation: ValidationResult;

  metadata: {
    correlationId: string | null;
    truncated: boolean; // finishReason === 'length'
    empty: boolean;
    language: string | null;
    createdAt: string | null; // stamped by the caller (server action), null in pure core
  };
}

// ── Events (Core Event Bus — response analytics) ─────────────
export const RESPONSE_EVENTS = {
  PROCESSED: 'ai:response_processed',
  VALIDATION_FAILED: 'ai:response_validation_failed',
  CITATIONS_EXTRACTED: 'ai:response_citations_extracted',
  ACTIONS_SUGGESTED: 'ai:response_actions_suggested',
  LEAD_DETECTED: 'ai:response_lead_detected',
  CONTACT_REQUESTED: 'ai:response_contact_requested',
} as const;

export type ResponseEventName = (typeof RESPONSE_EVENTS)[keyof typeof RESPONSE_EVENTS];
