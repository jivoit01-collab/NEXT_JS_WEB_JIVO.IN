// Standalone (leaf) analytics modules registered by Phase 4 / 4.1.
// The CMS-backed modules (Dashboard, Our Essence, Products, …) are generated
// from the CMS registry in `register-cms-modules.ts`.

import { LayoutDashboard, Users, Route, MessageCircleQuestion } from 'lucide-react';
import { ANALYTICS_ROOT, registerAnalyticsModule } from './registry';

registerAnalyticsModule({
  id: 'overview',
  name: 'Overview',
  icon: LayoutDashboard,
  route: ANALYTICS_ROOT,
  category: 'overview',
  description: 'Platform-wide summary across every tracked module.',
  order: 0,
  standalone: true,
});

// Visitors — audience intelligence (who visits). No page analytics here.
registerAnalyticsModule({
  id: 'visitors',
  name: 'Visitors',
  icon: Users,
  route: `${ANALYTICS_ROOT}/visitors`,
  category: 'audience',
  description: 'Who is visiting — new vs returning, devices, geography.',
  order: 50,
  standalone: true,
  // Phase 6.1 refinement: KPIs · Visitors Trend (full) · Countries + Devices in one row.
  widgets: ['overview', 'visitors-trend', 'countries', 'devices'],
});

// Traffic — acquisition intelligence (where visitors come from). No device/page analytics.
registerAnalyticsModule({
  id: 'traffic',
  name: 'Traffic',
  icon: Route,
  route: `${ANALYTICS_ROOT}/traffic`,
  category: 'audience',
  description: 'Where visitors come from — sources, referrers, campaigns.',
  order: 60,
  standalone: true,
  // Phase 6.1: KPIs · Traffic Trend · Traffic Sources · Referrers · Landing Pages · Campaigns.
  widgets: ['overview', 'traffic-trend', 'traffic-sources', 'referrers', 'landing-pages', 'campaigns'],
});

// Reports module removed — unregistered so it no longer appears in the Analytics
// sidebar, and its /analytics/reports route now 404s via the catch-all.

// Chatbot FAQ — a sidebar entry under Analytics. Its route is a REAL page
// (app/.../analytics/chatbot-faq/page.tsx) that intercepts the analytics
// catch-all, so this registration only places the link in the sidebar.
registerAnalyticsModule({
  id: 'chatbot-faq',
  name: 'Chatbot FAQ',
  icon: MessageCircleQuestion,
  route: `${ANALYTICS_ROOT}/chatbot-faq`,
  category: 'business',
  description: 'Manage the chatbot knowledge (FAQs), sync, and on/off switch.',
  order: 80,
  standalone: true,
});
