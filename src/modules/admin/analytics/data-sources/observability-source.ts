import 'server-only';

// AI Observability analytics data source (Phase 7.9) — consumes the Observability
// module's aggregates (never Prisma directly here) and maps them to WidgetData.
// Registered for the `ai` module (adds Observability widgets; no new dashboard).
// Dependency: admin/analytics → platform/observability.

import { Activity, Clock, Coins, CheckCircle } from 'lucide-react';
import {
  executionStats,
  recentExecutions,
  executionsByProvider,
} from '@/modules/platform/observability/services';
import { listPromptTemplates } from '@/modules/platform/prompt';
import { registerAnalyticsDataSource } from './registry';
import type { AnalyticsDataSource, AnalyticsPageData } from './types';
import type { WidgetContext, WidgetData } from '../widgets/types';
import type { AnalyticsMetric } from '../types';

function emptyPage(scope: WidgetContext['scope'], title: string): AnalyticsPageData {
  return { scope, title, widgets: {} };
}

export const observabilityDataSource: AnalyticsDataSource = {
  async getOverview(ctx) {
    return emptyPage('overview', ctx.title);
  },
  async getModule(_id, ctx) {
    return emptyPage('module', ctx.title);
  },
  async getPage(_m, _p, ctx) {
    return emptyPage('page', ctx.title);
  },

  async getWidget(widgetId): Promise<WidgetData> {
    if (widgetId === 'overview' || widgetId === 'obs-overview') {
      const s = await executionStats();
      const metrics: AnalyticsMetric[] = [
        { id: 'executions', label: 'AI Requests', value: s.totalExecutions, icon: Activity, hint: 'All time' },
        { id: 'success', label: 'Success Rate', value: `${Math.round(s.successRate * 100)}%`, icon: CheckCircle, hint: 'Successful' },
        { id: 'latency', label: 'Avg Response', value: `${s.avgResponseTimeMs}ms`, icon: Clock, hint: 'Mean' },
        { id: 'cost', label: 'Est. Cost', value: `$${s.totalEstimatedCost}`, icon: Coins, hint: `${s.totalTokens} tokens` },
      ];
      return { status: s.totalExecutions > 0 ? 'ready' : 'empty', metrics };
    }

    if (widgetId === 'obs-by-provider') {
      const rows = await executionsByProvider();
      return {
        status: rows.length ? 'ready' : 'empty',
        breakdown: rows.map((r) => ({ label: r.provider, value: r.count })),
      };
    }

    if (widgetId === 'obs-cost-by-provider') {
      const rows = await executionsByProvider();
      return {
        status: rows.length ? 'ready' : 'empty',
        breakdown: rows.map((r) => ({ label: r.provider, value: Math.round(r.estimatedCost * 10_000) / 10_000 })),
      };
    }

    if (widgetId === 'obs-recent') {
      const rows = await recentExecutions(12);
      const facts = rows.map((e) => ({
        label: `${e.provider ?? 'none'}/${e.model ?? '—'} · ${e.correlationId.slice(0, 10)}`,
        value: `${e.success ? '✓' : '✗'} ${e.responseTimeMs}ms · ${e.totalTokens}tok · $${e.estimatedCost} · ${e.experienceCards} cards${e.errorType ? ` · ${e.errorType}` : ''}`,
      }));
      return { status: facts.length ? 'ready' : 'empty', facts };
    }

    // Prompt Management (Part 7) — reuse the Prompt Platform registry (versioned).
    if (widgetId === 'obs-prompt-templates') {
      const templates = listPromptTemplates();
      const facts = templates.map((t) => ({
        label: `${t.name} (v${t.version})`,
        value: `${t.id} · ${t.businessRules.length} rules · ${t.description.slice(0, 50)}`,
      }));
      return { status: facts.length ? 'ready' : 'empty', facts };
    }

    return { status: 'placeholder' };
  },
};

registerAnalyticsDataSource({
  id: 'ai-observability',
  source: observabilityDataSource,
  modules: ['ai-observability'],
  enabled: true,
  priority: 10,
});
