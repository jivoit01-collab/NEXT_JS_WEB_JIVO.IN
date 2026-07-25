import 'server-only';

// AI Provider analytics data source (Phase 7.3) — consumes the AI Provider
// Platform's health/catalog (never Prisma; there is no provider table) and maps
// it to WidgetData. Registered for the `ai-providers` module.
// Dependency: admin/analytics → platform/ai-provider.

import { Plug, ShieldCheck, Activity, Coins } from 'lucide-react';
import { getProviderCatalog, getProviderHealth } from '@/modules/platform/ai-provider/services';
import { PROVIDER_FEATURES } from '@/modules/platform/ai-provider/config';
import { executionsByProvider } from '@/modules/platform/observability/services';
import { registerAnalyticsDataSource } from './registry';
import type { AnalyticsDataSource, AnalyticsPageData } from './types';
import type { WidgetContext, WidgetData, WidgetDatum } from '../widgets/types';
import type { AnalyticsMetric } from '../types';

function breakdown(rows: WidgetDatum[]): WidgetData {
  return { status: rows.length ? 'ready' : 'empty', breakdown: rows };
}
function emptyPage(scope: WidgetContext['scope'], title: string): AnalyticsPageData {
  return { scope, title, widgets: {} };
}
function humanize(k: string): string {
  return k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

export const aiProviderDataSource: AnalyticsDataSource = {
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
    const health = getProviderHealth();
    const catalog = getProviderCatalog();

    if (widgetId === 'overview') {
      const live = catalog.filter((p) => p.implemented).length;
      const configured = health.filter((h) => h.configured).length;
      const healthy = health.filter((h) => h.status === 'healthy').length;
      const totalTokens = health.reduce((a, h) => a + h.totalTokens, 0);
      const metrics: AnalyticsMetric[] = [
        { id: 'providers', label: 'Providers', value: catalog.length, icon: Plug, hint: `${live} implemented` },
        { id: 'configured', label: 'Configured', value: configured, icon: ShieldCheck, hint: 'API key present' },
        { id: 'healthy', label: 'Healthy', value: healthy, icon: Activity, hint: 'Circuit closed' },
        { id: 'tokens', label: 'Tokens', value: totalTokens, icon: Coins, hint: 'All time' },
      ];
      return { status: 'ready', metrics };
    }

    if (widgetId === 'provider-health') {
      // One fact line per provider covering the full metric set (Phase 7.9).
      const facts = health.map((h) => {
        const info = catalog.find((c) => c.name === h.provider);
        const parts = [
          `status ${h.status}`,
          `circuit ${h.circuit}`,
          `success ${Math.round(h.successRate * 100)}% / fail ${Math.round(h.failureRate * 100)}%`,
          `avg ${h.avgResponseTimeMs}ms`,
          `tokens ${h.totalTokens} (today ${h.dailyTokens})`,
          `timeouts ${h.timeoutCount}`,
          `fallbacks ${h.fallbackCount}`,
        ];
        if (!info?.implemented) parts.unshift('stub');
        else if (!h.configured) parts.unshift('no key');
        if (h.lastError) parts.push(`last error: ${h.lastError.slice(0, 40)}`);
        return { label: info?.label ?? h.provider, value: parts.join(' · ') };
      });
      return { status: facts.length ? 'ready' : 'empty', facts };
    }

    if (widgetId === 'provider-cost') {
      // Estimated cost per provider — sourced from Observability (shared estimator).
      const rows = await executionsByProvider();
      return breakdown(rows.map((r) => ({ label: r.provider, value: Math.round(r.estimatedCost * 10_000) / 10_000 })));
    }

    if (widgetId === 'provider-availability') {
      return breakdown(health.filter((h) => h.configured).map((h) => ({ label: h.provider, value: Math.round(h.availability * 100) })));
    }
    if (widgetId === 'provider-token-usage') {
      return breakdown(health.map((h) => ({ label: h.provider, value: h.totalTokens })));
    }
    if (widgetId === 'provider-daily-usage') {
      return breakdown(health.map((h) => ({ label: h.provider, value: h.dailyTokens })));
    }
    if (widgetId === 'provider-response-time') {
      return breakdown(health.filter((h) => h.avgResponseTimeMs > 0).map((h) => ({ label: h.provider, value: h.avgResponseTimeMs })));
    }

    if (widgetId === 'provider-errors') {
      const facts = health
        .filter((h) => h.lastError)
        .map((h) => ({ label: h.provider, value: `${h.totalErrors} err · ${h.lastError!.slice(0, 60)}` }));
      return { status: facts.length ? 'ready' : 'empty', facts };
    }

    if (widgetId === 'provider-settings') {
      const facts = Object.entries(PROVIDER_FEATURES).map(([k, v]) => ({
        label: humanize(k),
        value: v ? 'Enabled' : 'Prepared',
      }));
      return { status: 'ready', facts };
    }

    return { status: 'placeholder' };
  },
};

registerAnalyticsDataSource({
  id: 'ai-providers',
  source: aiProviderDataSource,
  modules: ['ai-providers'],
  enabled: true,
  priority: 10,
});
