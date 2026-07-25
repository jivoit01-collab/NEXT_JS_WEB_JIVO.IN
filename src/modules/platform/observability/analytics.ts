// ==========================================================================
// AI Observability's descriptor for the Analytics Dashboard (Phase 7.9) — a NEW
// "AI Observability" admin module (execution metadata / debugging). Pure data
// (+ icons) so the dashboard registers it WITHOUT importing observability
// runtime. One-way dependency (dashboard → observability).
// ==========================================================================

import { Activity, Coins, ListChecks, Gauge, FileText } from 'lucide-react';

const ROOT = '/jivo-dev/analytics/ai-observability';

export const OBSERVABILITY_ANALYTICS_PAGES = [
  { id: 'executions', name: 'Executions', icon: ListChecks },
  { id: 'cost', name: 'Cost & Usage', icon: Coins },
  { id: 'prompts', name: 'Prompt Templates', icon: FileText },
] as const;

export const OBSERVABILITY_ANALYTICS_WIDGETS = [
  { id: 'obs-by-provider', title: 'Requests by Provider', description: 'AI requests grouped by provider.', icon: Gauge, size: 'medium', category: 'summary', kind: 'doughnut' },
  { id: 'obs-cost-by-provider', title: 'Cost by Provider', description: 'Estimated USD per provider.', icon: Coins, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'obs-recent', title: 'Recent Executions', description: 'Latest AI requests with metrics.', icon: ListChecks, size: 'full', category: 'custom', kind: 'facts' },
  { id: 'obs-prompt-templates', title: 'Prompt Templates', description: 'Registered versioned prompt templates.', icon: FileText, size: 'full', category: 'custom', kind: 'facts' },
] as const;

export const OBSERVABILITY_ANALYTICS_MODULE = {
  id: 'ai-observability',
  name: 'AI Observability',
  icon: Activity,
  route: ROOT,
  category: 'business' as const,
  description: 'AI execution metadata — latency, tokens, cost, success/failure for debugging & tuning.',
  order: 94,
  widgets: ['overview', 'obs-by-provider', 'obs-recent'],
  pages: OBSERVABILITY_ANALYTICS_PAGES.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    route: `${ROOT}/${p.id}`,
    widgets:
      p.id === 'executions'
        ? ['overview', 'obs-by-provider', 'obs-recent']
        : p.id === 'cost'
          ? ['obs-cost-by-provider', 'obs-recent']
          : ['obs-prompt-templates'], // prompts
  })),
};
