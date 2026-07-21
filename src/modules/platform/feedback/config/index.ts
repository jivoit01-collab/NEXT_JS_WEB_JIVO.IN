// ==========================================================================
// Feedback configuration — single source of truth (flags + defaults).
// Client-safe. Future features flip a flag here; no code changes elsewhere.
// ==========================================================================

/** Which feedback capabilities are enabled. */
export const FEEDBACK_FEATURES = {
  // Live today — the reusable collection platform.
  collection: true,
  thumbs: true,
  starRating: true,
  forms: true,
  adminDashboard: true,

  // Prepared, disabled until their business module lands.
  productReviews: false,
  aiFeedback: false,
  supportTickets: false,
  orderFeedback: false,
  deliveryFeedback: false,
  emailNotifications: false,
  assignment: false,
} as const;

export type FeedbackFeature = keyof typeof FEEDBACK_FEATURES;

export function isFeedbackFeatureEnabled(feature: FeedbackFeature): boolean {
  return FEEDBACK_FEATURES[feature] === true;
}

export const FEEDBACK_CONFIG = {
  /** Rate-limit budget for public submissions (per IP, per minute). */
  submitLimit: 20,
  submitWindowMs: 60 * 1000,
  /** Max feedback records returned per admin page. */
  pageSize: 50,
  maxPageSize: 200,
} as const;
