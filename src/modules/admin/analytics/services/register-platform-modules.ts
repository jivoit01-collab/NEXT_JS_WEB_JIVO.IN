// Platform modules (auth, and future AI/CRM/…) registered into the analytics
// dashboard. The dashboard imports each module's PLAIN descriptor and registers
// it — so the dependency arrow stays one-way (dashboard → module), never the
// reverse. A new platform module appears by adding one import + registration.

import { AUTH_ANALYTICS_MODULE, AUTH_ANALYTICS_WIDGET_IDS } from '@/modules/platform/auth/analytics';
import { FEEDBACK_ANALYTICS_MODULE } from '@/modules/platform/feedback/analytics';
import { KNOWLEDGE_ANALYTICS_MODULE } from '@/modules/platform/knowledge/analytics';
import { AI_ANALYTICS_MODULE } from '@/modules/platform/conversation/analytics';
import { PROVIDER_ANALYTICS_MODULE } from '@/modules/platform/ai-provider/analytics';
import { OBSERVABILITY_ANALYTICS_MODULE } from '@/modules/platform/observability/analytics';
import { registerAnalyticsModule } from './registry';

// Auth is a leaf module whose page is built from analytics WIDGETS (its
// auth-specific widgets are registered by the widget platform).
registerAnalyticsModule({
  ...AUTH_ANALYTICS_MODULE,
  standalone: true,
  widgets: AUTH_ANALYTICS_WIDGET_IDS,
});

// Feedback is a module WITH pages (General, Page, Product, AI, Bug, Feature,
// Support, Resolved). Its widgets + data source are registered by the widget /
// data-source platforms; here we just add the module + its pages.
registerAnalyticsModule(FEEDBACK_ANALYTICS_MODULE);

// Knowledge is a module WITH pages (Documents, Collections, Sources, Search,
// Indexing, Sync Jobs, Settings) — the reusable knowledge layer for AI features.
registerAnalyticsModule(KNOWLEDGE_ANALYTICS_MODULE);

// AI (Conversation Platform) is a module WITH pages (Conversations, Messages,
// Memory, Performance, Settings) — conversation lifecycle/state/memory analytics.
registerAnalyticsModule(AI_ANALYTICS_MODULE);

// AI Providers (Provider Platform) is a module WITH pages (Providers, Health,
// Usage, Settings) — external AI provider registry, health, resilience & usage.
registerAnalyticsModule(PROVIDER_ANALYTICS_MODULE);

// AI Observability (Phase 7.9) — execution metadata for debugging & tuning
// (Executions, Cost & Usage). Reads the Observability module's aggregates.
registerAnalyticsModule(OBSERVABILITY_ANALYTICS_MODULE);
