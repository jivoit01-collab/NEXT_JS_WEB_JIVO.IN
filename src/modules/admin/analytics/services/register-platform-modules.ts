// Platform modules (auth, and future AI/CRM/…) registered into the analytics
// dashboard. The dashboard imports each module's PLAIN descriptor and registers
// it — so the dependency arrow stays one-way (dashboard → module), never the
// reverse. A new platform module appears by adding one import + registration.

import { AUTH_ANALYTICS_MODULE, AUTH_ANALYTICS_WIDGET_IDS } from '@/modules/platform/auth/analytics';
import { registerAnalyticsModule } from './registry';

// Auth is a leaf module whose page is built from analytics WIDGETS (its
// auth-specific widgets are registered by the widget platform).
registerAnalyticsModule({
  ...AUTH_ANALYTICS_MODULE,
  standalone: true,
  widgets: AUTH_ANALYTICS_WIDGET_IDS,
});
