'use client';

// ==========================================================================
// KnowledgeSearchBox — reusable admin/AI search UI over the Knowledge Platform.
// Uses the useKnowledgeSearch hook (search action → retriever/search). Presentation
// only; safe to embed on the admin Search page today and in AI tooling later.
// ==========================================================================

import { useState } from 'react';
import { Search, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKnowledgeSearch } from '../hooks';
import type { SearchMode } from '../types';

export function KnowledgeSearchBox({ className }: { className?: string }) {
  const { runSearch, result, error, isLoading } = useKnowledgeSearch();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<SearchMode>('keyword');

  return (
    <div className={cn('space-y-4', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runSearch(q, { mode, limit: 20 });
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the knowledge base…"
            className="border-input bg-background focus:border-primary focus:ring-primary/20 h-10 w-full rounded-lg border py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
            aria-label="Knowledge search"
          />
        </div>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as SearchMode)}
          className="border-input bg-background h-10 rounded-lg border px-3 text-sm"
          aria-label="Search mode"
        >
          <option value="keyword">Keyword</option>
          <option value="semantic">Semantic</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-jost-medium disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Search
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div>
          <p className="text-muted-foreground mb-2 text-xs">
            {result.total} result{result.total === 1 ? '' : 's'} · {result.mode} · {result.tookMs}ms
          </p>
          <ul className="divide-border/60 divide-y rounded-lg border">
            {result.results.length === 0 ? (
              <li className="text-muted-foreground p-4 text-center text-sm">No matches.</li>
            ) : (
              result.results.map((r) => (
                <li key={r.document.id} className="flex items-start gap-3 p-3">
                  <FileText size={15} className="text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-jost-medium">{r.document.title}</p>
                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {r.document.excerpt ?? r.document.content}
                    </p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {Math.round(r.score * 100)}%
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
