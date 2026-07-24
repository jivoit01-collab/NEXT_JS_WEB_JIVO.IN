/**
 * Core Analytics Platform — top-level barrel.
 *
 * Reusable, privacy-first infrastructure consumed by every future feature
 * (cookie banner, dashboards, chatbot analytics, feedback, AI insights).
 * See docs/analytics-platform.md.
 */

export * as CoreShared from './shared';
export * as CoreVisitor from './visitor';
export * as CoreSession from './session';
export * as CoreCookie from './cookie';
export * as CoreAnalytics from './analytics';
