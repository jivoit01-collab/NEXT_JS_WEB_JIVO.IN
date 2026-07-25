// ==========================================================================
// Knowledge's descriptor for the Analytics Dashboard (Phase 7.0). Pure data
// (+ icons) so the dashboard registers it WITHOUT importing knowledge runtime.
// The dashboard reads this + knowledge's query functions — knowledge never
// imports the dashboard (one-way dependency), mirroring auth/feedback.
// ==========================================================================

import {
  Brain,
  FileText,
  FolderTree,
  Database,
  Search,
  Layers,
  RefreshCw,
  Settings,
  Gauge,
  Hash,
  Minimize2,
  Zap,
} from 'lucide-react';

const ROOT = '/jivo-dev/analytics/knowledge';

/** Admin pages under the Knowledge section. */
export const KNOWLEDGE_ANALYTICS_PAGES = [
  { id: 'documents', name: 'Documents', icon: FileText },
  { id: 'collections', name: 'Collections', icon: FolderTree },
  { id: 'sources', name: 'Sources', icon: Database },
  { id: 'search', name: 'Search', icon: Search },
  { id: 'indexing', name: 'Indexing', icon: Layers },
  { id: 'sync-jobs', name: 'Sync Jobs', icon: RefreshCw },
  { id: 'settings', name: 'Settings', icon: Settings },
] as const;

/** Knowledge-specific analytics widgets (registered on the widget platform). */
export const KNOWLEDGE_ANALYTICS_WIDGETS = [
  { id: 'knowledge-by-source', title: 'Documents by Source', description: 'How much each source contributes.', icon: Database, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'knowledge-by-collection', title: 'Documents by Collection', description: 'Documents grouped by collection.', icon: FolderTree, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'knowledge-doc-status', title: 'Document Status', description: 'Active / draft / archived.', icon: FileText, size: 'medium', category: 'summary', kind: 'doughnut' },
  { id: 'knowledge-embedding-status', title: 'Embedding Status', description: 'Ready / stale / pending vectors.', icon: Layers, size: 'medium', category: 'summary', kind: 'doughnut' },
  { id: 'knowledge-recent-jobs', title: 'Recent Sync Jobs', description: 'Latest indexing runs.', icon: RefreshCw, size: 'full', category: 'custom', kind: 'facts' },
  { id: 'knowledge-recent-docs', title: 'Recent Documents', description: 'Recently indexed knowledge.', icon: FileText, size: 'full', category: 'custom', kind: 'facts' },
  { id: 'knowledge-search', title: 'Knowledge Search', description: 'Search the knowledge base.', icon: Search, size: 'full', category: 'custom', kind: 'search' },
  { id: 'knowledge-settings', title: 'Knowledge Settings', description: 'Platform capabilities & flags.', icon: Settings, size: 'full', category: 'custom', kind: 'facts' },

  // Context Builder metrics (Phase 7.0.1) — PLACEHOLDERS. Prepared for future
  // real metrics; the Context Builder emits the events that will feed these.
  { id: 'context-avg-size', title: 'Average Context Size', description: 'Mean characters per built context.', icon: Gauge, size: 'medium', category: 'summary', kind: 'placeholder' },
  { id: 'context-avg-tokens', title: 'Average Tokens', description: 'Mean estimated tokens per context.', icon: Hash, size: 'medium', category: 'summary', kind: 'placeholder' },
  { id: 'context-compression-ratio', title: 'Compression Ratio', description: 'Chars out ÷ chars in.', icon: Minimize2, size: 'medium', category: 'summary', kind: 'placeholder' },
  { id: 'context-cache-hit-rate', title: 'Cache Hit Rate', description: 'Context cache effectiveness.', icon: Zap, size: 'medium', category: 'summary', kind: 'placeholder' },
  { id: 'context-top-collections', title: 'Top Collections Used', description: 'Collections most used in contexts.', icon: FolderTree, size: 'full', category: 'tables', kind: 'placeholder' },
] as const;

/** The Knowledge module descriptor + per-page widget configs. */
export const KNOWLEDGE_ANALYTICS_MODULE = {
  id: 'knowledge',
  name: 'Knowledge',
  icon: Brain,
  route: ROOT,
  category: 'business' as const,
  description: 'The reusable knowledge layer powering every AI feature.',
  order: 95,
  // Module dashboard (Overview).
  widgets: ['overview', 'knowledge-by-source', 'knowledge-doc-status', 'knowledge-embedding-status', 'knowledge-recent-docs'],
  pages: KNOWLEDGE_ANALYTICS_PAGES.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    route: `${ROOT}/${p.id}`,
    widgets:
      p.id === 'documents'
        ? ['overview', 'knowledge-by-source', 'knowledge-recent-docs']
        : p.id === 'collections'
          ? ['knowledge-by-collection']
          : p.id === 'sources'
            ? ['knowledge-by-source', 'knowledge-recent-jobs']
            : p.id === 'search'
              ? ['knowledge-search']
              : p.id === 'indexing'
                ? [
                    'overview',
                    'knowledge-embedding-status',
                    'knowledge-recent-jobs',
                    // Context Builder metrics (placeholders — future real data).
                    'context-avg-size',
                    'context-avg-tokens',
                    'context-compression-ratio',
                    'context-cache-hit-rate',
                    'context-top-collections',
                  ]
                : p.id === 'sync-jobs'
                  ? ['knowledge-recent-jobs']
                  : ['knowledge-settings'], // settings
  })),
};
