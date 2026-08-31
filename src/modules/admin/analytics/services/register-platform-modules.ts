// Platform modules (auth, and future AI/CRM/…) registered into the analytics
// dashboard. The dashboard imports each module's PLAIN descriptor and registers
// it — so the dependency arrow stays one-way (dashboard → module), never the
// reverse. A new platform module appears by adding one import + registration.

import { AUTH_ANALYTICS_MODULE, AUTH_ANALYTICS_WIDGET_IDS } from '@/modules/platform/auth/analytics';
import { FEEDBACK_ANALYTICS_MODULE } from '@/modules/platform/feedback/analytics';
import { AI_ANALYTICS_MODULE } from '@/modules/platform/conversation/analytics';
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

// Knowledge module removed from the Analytics navigation (unregistered); its
// /analytics/knowledge route now 404s. The knowledge PLATFORM itself is untouched.

// AI (Conversation Platform) is a module WITH pages (Conversations, Messages,
// Memory, Performance, Settings) — conversation lifecycle/state/memory analytics.
registerAnalyticsModule(AI_ANALYTICS_MODULE);

// AI Providers — NOT registered. Gemini is the only provider today, so the
// provider-comparison dashboard has nothing to compare and is hidden from the
// admin navigation. The underlying ai-provider PLATFORM (registry, Gemini
// adapter, fallback chain, health checks) is untouched and still runs the
// pipeline; re-adding this one line restores the UI when a second provider
// lands. The descriptor itself is intentionally kept in the codebase.

// AI Observability module removed from the Analytics navigation (unregistered);
// its /analytics/ai-observability route now 404s. The observability PLATFORM
// (execution logging) is untouched — only the dashboard entry is hidden.
