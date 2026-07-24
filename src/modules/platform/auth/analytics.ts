// Authentication's descriptor for the Analytics Dashboard. Pure data (+ icons)
// so the dashboard can register it WITHOUT importing any auth runtime. The
// dashboard reads this — auth never imports the dashboard (one-way dependency).
//
// Phase 5.1: placeholder SECTIONS replaced with WIDGET definitions that plug
// into the Analytics Widget Platform (still placeholder UI — no real analytics).

import {
  ShieldCheck,
  LogIn,
  UserPlus,
  Boxes,
  UserCheck,
  ShieldAlert,
  MonitorSmartphone,
  Map,
  Clock,
} from 'lucide-react';

/**
 * Auth-specific analytics widgets. The dashboard registers each as a placeholder
 * widget (via the widget platform) and lists them on the Authentication page.
 * `size`/`category` match the analytics widget contracts.
 */
export const AUTH_ANALYTICS_WIDGETS = [
  { id: 'auth-provider-usage', title: 'Provider Usage', description: 'Sign-ins by provider.', icon: Boxes, category: 'charts', size: 'medium' },
  { id: 'auth-logins', title: 'Login Success', description: 'Successful sign-ins.', icon: LogIn, category: 'summary', size: 'medium' },
  { id: 'auth-failed-logins', title: 'Login Failure', description: 'Rejected attempts.', icon: ShieldAlert, category: 'summary', size: 'medium' },
  { id: 'auth-countries', title: 'Countries', description: 'Sign-ins by geography.', icon: Map, category: 'maps', size: 'medium' },
  { id: 'auth-device-types', title: 'Devices', description: 'Mobile / desktop split.', icon: MonitorSmartphone, category: 'engagement', size: 'medium' },
  { id: 'auth-login-timeline', title: 'Recent Logins', description: 'Latest sign-ins.', icon: Clock, category: 'custom', size: 'full' },
  // Registered but not on the default page (available for future layouts).
  { id: 'auth-registrations', title: 'Registrations', description: 'New accounts created.', icon: UserPlus, category: 'summary', size: 'medium' },
  { id: 'auth-returning-users', title: 'Returning Users', description: 'Repeat sign-ins.', icon: UserCheck, category: 'engagement', size: 'medium' },
] as const;

/**
 * Widget ids shown on the Authentication analytics page (Phase 6.1):
 * KPIs · Provider Usage · Login Success · Login Failure · Countries · Devices ·
 * Recent Logins.
 */
export const AUTH_ANALYTICS_WIDGET_IDS: string[] = [
  'overview',
  'auth-provider-usage',
  'auth-logins',
  'auth-failed-logins',
  'auth-countries',
  'auth-device-types',
  'auth-login-timeline',
];

export const AUTH_ANALYTICS_MODULE = {
  id: 'authentication',
  name: 'Authentication',
  icon: ShieldCheck,
  route: '/jivo-dev/analytics/authentication',
  category: 'business' as const,
  description: 'Logins, registrations, provider usage and returning users.',
  order: 90,
};
