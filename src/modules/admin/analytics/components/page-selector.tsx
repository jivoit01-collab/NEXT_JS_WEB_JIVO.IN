'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageSelectorOption {
  name: string;
  route: string;
}

export interface PageSelectorData {
  moduleName: string;
  moduleRoute: string;
  pages: PageSelectorOption[];
  /** The currently open route (module hub or a specific page). */
  currentRoute: string;
}

/**
 * Toolbar page selector (Phase 4.7). A searchable dropdown of a module's CMS
 * pages — the sidebar no longer lists them. Pages are passed in as plain props
 * from the SERVER (read from the CMS-derived registry), so this client component
 * imports no registration side effects. Only rendered when a module owns pages.
 *
 * Open/close is driven by a document-level click-outside listener (NOT input
 * blur), so focusing the search box never collapses the dropdown.
 */
export function PageSelector({ moduleName, moduleRoute, pages, currentRoute }: PageSelectorData) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current =
    currentRoute === moduleRoute ? null : (pages.find((p) => p.route === currentRoute) ?? null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pages;
    return pages.filter((p) => p.name.toLowerCase().includes(s));
  }, [q, pages]);

  const go = (route: string) => {
    setOpen(false);
    setQ('');
    router.push(route);
  };

  return (
    <div ref={rootRef} className="relative w-full sm:w-64 2xl:w-72">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="border-input bg-background hover:border-primary/60 flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0 truncate text-left">
          {current ? (
            <>
              <span className="text-muted-foreground">{moduleName} · </span>
              {current.name}
            </>
          ) : (
            <span className="text-muted-foreground">Search or select page…</span>
          )}
        </span>
        <ChevronDown
          size={15}
          className={cn('text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="bg-popover text-popover-foreground absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border shadow-lg">
          <div className="relative border-b p-2">
            <Search className="text-muted-foreground pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              autoFocus
              type="text"
              value={q}
              placeholder={`Search ${moduleName} pages…`}
              onChange={(e) => setQ(e.target.value)}
              className="border-input bg-background focus:border-primary focus:ring-primary/20 h-8 w-full rounded-md border py-1 pl-8 pr-2 text-sm transition-colors focus:outline-none focus:ring-2"
              aria-label={`Search ${moduleName} pages`}
            />
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => go(moduleRoute)}
              className={cn(
                'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors',
                currentRoute === moduleRoute ? 'bg-accent text-foreground' : 'hover:bg-accent/60',
              )}
            >
              <span className="min-w-0 truncate font-jost-medium">{moduleName} overview</span>
              {currentRoute === moduleRoute && <Check size={14} className="text-primary shrink-0" />}
            </button>

            {results.length === 0 ? (
              <p className="text-muted-foreground px-3 py-3 text-xs">No matching pages.</p>
            ) : (
              results.map((p) => {
                const isCurrent = p.route === currentRoute;
                return (
                  <button
                    key={p.route}
                    type="button"
                    onClick={() => go(p.route)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors',
                      isCurrent ? 'bg-accent text-foreground' : 'hover:bg-accent/60',
                    )}
                  >
                    <span className="min-w-0 truncate">{p.name}</span>
                    {isCurrent && <Check size={14} className="text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
