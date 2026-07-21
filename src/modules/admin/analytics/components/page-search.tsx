'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAnalyticsModules, ANALYTICS_ROOT } from '../services';

interface Entry {
  name: string;
  route: string;
  parent?: string;
}

/**
 * Searches every analytics module + page (from the registry) and jumps to it.
 * Registry-driven, so new CMS pages are searchable automatically.
 */
export function PageSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const entries = useMemo<Entry[]>(() => {
    const list: Entry[] = [];
    for (const m of getAnalyticsModules()) {
      if (m.route !== ANALYTICS_ROOT) list.push({ name: m.name, route: m.route });
      for (const p of m.pages ?? []) list.push({ name: p.name, route: p.route, parent: m.name });
    }
    return list;
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return entries
      .filter((e) => e.name.toLowerCase().includes(s) || e.parent?.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q, entries]);

  const go = (route: string) => {
    setQ('');
    setOpen(false);
    router.push(route);
  };

  return (
    <div className="relative w-full sm:w-64 2xl:w-72">
      <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <input
        type="text"
        value={q}
        placeholder="Search pages…"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (!results.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => (a + 1) % results.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => (a - 1 + results.length) % results.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            go(results[active].route);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className="border-input bg-background focus:border-primary focus:ring-primary/20 h-9 w-full rounded-lg border py-2 pl-9 pr-3 text-sm transition-colors focus:outline-none focus:ring-2"
        aria-label="Search analytics pages"
      />

      {open && results.length > 0 && (
        <div
          className="bg-popover text-popover-foreground absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border shadow-lg"
          onMouseDown={(e) => {
            // keep focus so the click registers before blur closes the list
            e.preventDefault();
            if (blurTimer.current) clearTimeout(blurTimer.current);
          }}
        >
          {results.map((r, i) => (
            <button
              key={r.route}
              type="button"
              onClick={() => go(r.route)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors',
                i === active ? 'bg-accent text-foreground' : 'hover:bg-accent/60',
              )}
            >
              <span className="min-w-0 truncate">
                {r.name}
                {r.parent && <span className="text-muted-foreground"> · {r.parent}</span>}
              </span>
              {i === active && <CornerDownLeft size={13} className="text-muted-foreground shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
