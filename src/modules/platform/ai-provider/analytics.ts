// ==========================================================================
// AI Provider's descriptor for the Analytics Dashboard (Phase 7.3) — a NEW
// "AI Providers" admin module (provider health/ops). Pure data (+ icons) so the
// dashboard registers it WITHOUT importing provider runtime. One-way dependency
// (dashboard → ai-provider), mirroring conversation/knowledge/auth/feedback.
// ==========================================================================

import {
  Plug,
  Activity,
  Gauge,
  ShieldCheck,
  Timer,
  Coins,
  AlertTriangle,
  Settings,
  ServerCog,
} from 'lucide-react';

const ROOT = '/jivo-dev/analytics/ai-providers';

export const PROVIDER_ANALYTICS_PAGES = [
  { id: 'providers', name: 'Providers', icon: Plug },
  { id: 'health', name: 'Health', icon: Activity },
  { id: 'usage', name: 'Usage', icon: Coins },
  { id: 'settings', name: 'Settings', icon: Settings },
] as const;

export const PROVIDER_ANALYTICS_WIDGETS = [
  { id: 'provider-health', title: 'Provider Health', description: 'Status · latency · availability · circuit breaker.', icon: ShieldCheck, size: 'full', category: 'custom', kind: 'facts' },
  { id: 'provider-availability', title: 'Availability by Provider', description: 'Success ratio per provider.', icon: Gauge, size: 'medium', category: 'summary', kind: 'breakdown' },
  { id: 'provider-token-usage', title: 'Token Usage', description: 'Total tokens per provider.', icon: Coins, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'provider-daily-usage', title: 'Daily Usage', description: 'Tokens today per provider.', icon: Coins, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'provider-cost', title: 'Estimated Cost', description: 'USD estimate per provider.', icon: Coins, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'provider-response-time', title: 'Avg Response Time', description: 'Mean latency per provider (ms).', icon: Timer, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'provider-errors', title: 'Recent Errors', description: 'Last error per provider.', icon: AlertTriangle, size: 'full', category: 'custom', kind: 'facts' },
  { id: 'provider-settings', title: 'Provider Settings', description: 'AI provider platform flags.', icon: Settings, size: 'full', category: 'custom', kind: 'facts' },
] as const;

export const PROVIDER_ANALYTICS_MODULE = {
  id: 'ai-providers',
  name: 'AI Providers',
  icon: ServerCog,
  route: ROOT,
  category: 'business' as const,
  description: 'External AI provider platform — registry, health, resilience and usage.',
  order: 95,
  widgets: ['overview', 'provider-health', 'provider-availability', 'provider-token-usage'],
  pages: PROVIDER_ANALYTICS_PAGES.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    route: `${ROOT}/${p.id}`,
    widgets:
      p.id === 'providers'
        ? ['overview', 'provider-health']
        : p.id === 'health'
          ? ['provider-health', 'provider-availability', 'provider-response-time', 'provider-errors']
          : p.id === 'usage'
            ? ['provider-token-usage', 'provider-daily-usage', 'provider-cost']
            : ['provider-settings'], // settings
  })),
};
