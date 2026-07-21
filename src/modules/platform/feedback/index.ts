// ==========================================================================
// Platform / Universal Feedback (Phase 6) — public barrel.
//
// One reusable feedback platform for every feature (website, page, product, AI,
// bug, feature, support, order, delivery, review). Reuses Core identity
// (visitor/session), Auth (userId), the Event Bus and the Analytics Platform.
//
// Import boundaries (keep server code out of client bundles):
//   • Client/runtime → this barrel (components, hook, types, config, actions)
//   • Server data    → '@/modules/platform/feedback/data'    (server-only)
//   • Server service → '@/modules/platform/feedback/services' (server-only)
//   • Dashboard data → '@/modules/platform/feedback/analytics'
//
// Docs: docs/feedback-platform.md
// ==========================================================================

export {
  StarRating,
  ThumbsFeedback,
  PageFeedback,
  FeedbackForm,
  SimpleFeedbackForm,
  DetailedFeedbackForm,
  BugReportForm,
  FeatureRequestForm,
  ContactFeedbackForm,
  type FeedbackFormProps,
} from './components';

export { useFeedback } from './hooks';

export {
  createFeedbackAction,
  getFeedbackAction,
  listFeedbackAction,
  updateFeedbackAction,
  changeStatusAction,
  deleteFeedbackAction,
} from './actions';

export {
  FEEDBACK_FEATURES,
  FEEDBACK_CONFIG,
  isFeedbackFeatureEnabled,
  type FeedbackFeature,
} from './config';

export { deriveSentiment, humanizeEnum } from './utils';

export {
  FEEDBACK_TYPES,
  FEEDBACK_SOURCES,
  FEEDBACK_ENTITY_TYPES,
  FEEDBACK_STATUSES,
  FEEDBACK_SENTIMENTS,
  FEEDBACK_PRIORITIES,
  FEEDBACK_EVENTS,
} from './types';
export type {
  FeedbackType,
  FeedbackSource,
  FeedbackEntityType,
  FeedbackStatus,
  FeedbackSentiment,
  FeedbackPriority,
  CreateFeedbackInput,
  FeedbackDTO,
  FeedbackFilter,
  FeedbackStats,
  FeedbackEventName,
} from './types';
