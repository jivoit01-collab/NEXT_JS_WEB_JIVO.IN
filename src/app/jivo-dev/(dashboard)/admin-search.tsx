'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminSearchItem {
  /** Display label, e.g. "Privacy Policy". */
  label: string;
  /** Where it lives, e.g. "Dashboard" or "SEO Manager". */
  group: string;
  href: string;
}

/**
 * Global admin page search — a compact input in the top bar that opens a
 * dropdown of matching pages. Type to filter, ↑/↓ to move, Enter to go, Esc to
 * close. Pulls its list from the sidebar registry so it always matches the nav.
 */
export function AdminSearch({
  items,
  className,
}: {
  items: AdminSearchItem[];
  /** Extra classes for the outer wrapper — e.g. a wider `max-w-*`. */
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items
      .filter((it) => it.label.toLowerCase().includes(q) || it.group.toLowerCase().includes(q))
      .slice(0, 10);
  }, [items, query]);

  // Clamp the highlighted row into range during render (results shrink as you
  // type), instead of resetting it from an effect.
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      router.push(href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(Math.min(activeIndex + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) go(item.href);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={boxRef} className={cn('relative w-full max-w-md', className)}>
      <div className="border-border bg-background/70 flex items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search admin pages…"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <div className="border-border bg-popover absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-lg border p-1.5 shadow-xl">
          {results.map((item, i) => (
            <button
              key={item.href + item.label}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item.href)}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition',
                i === activeIndex ? 'bg-accent text-foreground' : 'text-foreground/90 hover:bg-accent/60',
              )}
            >
              <span className="min-w-0 truncate">
                {item.label}
                <span className="text-muted-foreground ml-2 text-xs">{item.group}</span>
              </span>
              {i === activeIndex && <CornerDownLeft className="text-muted-foreground h-3.5 w-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="border-border bg-popover absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border px-3 py-3 text-sm text-muted-foreground shadow-xl">
          No pages match “{query}”.
        </div>
      )}
    </div>
  );
}
