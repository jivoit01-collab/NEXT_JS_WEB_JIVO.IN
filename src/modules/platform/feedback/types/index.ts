// ==========================================================================
// Universal Feedback Platform — types (Phase 6)
//
// String-literal vocabularies mirror the Prisma enums EXACTLY, so client code
// never imports Prisma yet the server still validates against the real enums.
// ==========================================================================

export const FEEDBACK_TYPES = [
  'GENERAL', 'PAGE', 'PRODUCT', 'CONTACT', 'AI', 'BUG', 'FEATURE', 'SUPPORT', 'ORDER', 'DELIVERY', 'REVIEW',
] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_SOURCES = [
  'WEBSITE', 'PAGE', 'FOOTER', 'HEADER', 'CONTACT_FORM', 'AI_CHATBOT', 'PRODUCT_PAGE', 'COMMUNITY', 'MOBILE_APP', 'API',
] as const;
export type FeedbackSource = (typeof FEEDBACK_SOURCES)[number];

export const FEEDBACK_ENTITY_TYPES = [
  'PAGE', 'PRODUCT', 'BLOG', 'AI_CHAT', 'ORDER', 'CATEGORY', 'VIDEO', 'RECIPE', 'GENERAL',
] as const;
export type FeedbackEntityType = (typeof FEEDBACK_ENTITY_TYPES)[number];

export const FEEDBACK_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'SPAM'] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_SENTIMENTS = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] as const;
export type FeedbackSentiment = (typeof FEEDBACK_SENTIMENTS)[number];

export const FEEDBACK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type FeedbackPriority = (typeof FEEDBACK_PRIORITIES)[number];

/** What a client submits (identity + client hints added server-side). */
export interface CreateFeedbackInput {
  type?: FeedbackType;
  source?: FeedbackSource;
  entityType?: FeedbackEntityType;
  entityId?: string;
  pageUrl?: string;
  pageTitle?: string;
  rating?: number;
  title?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  /** Client-generated ids (reused from the Core identity, not created here). */
  visitorId?: string;
  sessionId?: string;
  language?: string;
}

/** Admin-facing feedback record. */
export interface FeedbackDTO {
  id: string;
  visitorId: string | null;
  userId: string | null;
  sessionId: string | null;
  type: FeedbackType;
  source: FeedbackSource;
  entityType: FeedbackEntityType | null;
  entityId: string | null;
  pageUrl: string | null;
  pageTitle: string | null;
  rating: number | null;
  sentiment: FeedbackSentiment | null;
  title: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  assignedTo: string | null;
  response: string | null;
  respondedAt: string | null;
  resolvedAt: string | null;
  deviceType: string | null;
  browser: string | null;
  language: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Admin list filter. */
export interface FeedbackFilter {
  type?: FeedbackType;
  status?: FeedbackStatus;
  sentiment?: FeedbackSentiment;
  entityType?: FeedbackEntityType;
  entityId?: string;
  visitorId?: string;
  from?: Date;
  to?: Date;
}

/** Overview stats. */
export interface FeedbackStats {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  avgRating: number | null;
  positive: number;
  neutral: number;
  negative: number;
}

/** Feedback lifecycle events on the platform event bus (open strings). */
export const FEEDBACK_EVENTS = {
  CREATED: 'feedback:created',
  UPDATED: 'feedback:updated',
  RESOLVED: 'feedback:resolved',
  DELETED: 'feedback:deleted',
} as const;

export type FeedbackEventName = (typeof FEEDBACK_EVENTS)[keyof typeof FEEDBACK_EVENTS];
