import 'server-only';

// Knowledge analytics data source (Phase 7.0) — consumes the Knowledge Platform's
// query functions (never Prisma directly) and maps them to the WidgetData
// contract. Registered for the `knowledge` module; overrides the default.
// Dependency is one-way: admin/analytics → platform/knowledge.

import { FileText, Database, FolderTree, Layers } from 'lucide-react';
import {
  getKnowledgeStats,
  documentsBySource,
  documentsByCollection,
  documentsByStatus,
  documentsByEmbeddingStatus,
  recentSyncJobs,
  listDocuments,
} from '@/modules/platform/knowledge/data';
import { KNOWLEDGE_FEATURES } from '@/modules/platform/knowledge/config';
import { humanizeEnum } from '@/modules/platform/knowledge/utils';
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

export const knowledgeDataSource: AnalyticsDataSource = {
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
    if (widgetId === 'overview') {
      const s = await getKnowledgeStats();
      const metrics: AnalyticsMetric[] = [
        { id: 'documents', label: 'Documents', value: s.totalDocuments, icon: FileText, hint: 'Indexed' },
        { id: 'sources', label: 'Sources', value: s.totalSources, icon: Database, hint: 'Registered' },
        { id: 'collections', label: 'Collections', value: s.totalCollections, icon: FolderTree, hint: 'Groups' },
        { id: 'pending', label: 'Pending Embeddings', value: s.pendingEmbeddings + s.staleEmbeddings, icon: Layers, hint: 'To (re)index' },
      ];
      return { status: s.totalDocuments > 0 ? 'ready' : 'empty', metrics };
    }

    if (widgetId === 'knowledge-by-source') return breakdown(await documentsBySource());
    if (widgetId === 'knowledge-by-collection') return breakdown(await documentsByCollection());
    if (widgetId === 'knowledge-doc-status') {
      const rows = await documentsByStatus();
      return breakdown(rows.map((r) => ({ label: humanizeEnum(r.label), value: r.value })));
    }
    if (widgetId === 'knowledge-embedding-status') {
      const rows = await documentsByEmbeddingStatus();
      return breakdown(rows.map((r) => ({ label: humanizeEnum(r.label), value: r.value })));
    }

    if (widgetId === 'knowledge-recent-jobs') {
      const jobs = await recentSyncJobs(8);
      const facts = jobs.map((j) => ({
        label: `${humanizeEnum(j.type)} · ${humanizeEnum(j.status)}`,
        value: `+${j.created} new · ${j.updated} upd${j.failed ? ` · ${j.failed} failed` : ''}`,
      }));
      return { status: facts.length ? 'ready' : 'empty', facts };
    }

    if (widgetId === 'knowledge-recent-docs') {
      const { documents } = await listDocuments({ pageSize: 8 });
      const facts = documents.map((d) => ({
        label: d.title.slice(0, 40),
        value: (d.excerpt ?? d.content).slice(0, 60),
      }));
      return { status: facts.length ? 'ready' : 'empty', facts };
    }

    if (widgetId === 'knowledge-settings') {
      const facts = Object.entries(KNOWLEDGE_FEATURES).map(([k, v]) => ({
        label: humanizeEnum(k.replace(/([A-Z])/g, '_$1')),
        value: v ? 'Enabled' : 'Prepared',
      }));
      return { status: 'ready', facts };
    }

    // knowledge-search is a client widget (no data); everything else → placeholder.
    return { status: 'placeholder' };
  },
};

registerAnalyticsDataSource({
  id: 'knowledge',
  source: knowledgeDataSource,
  modules: ['knowledge'],
  enabled: true,
  priority: 10,
});
