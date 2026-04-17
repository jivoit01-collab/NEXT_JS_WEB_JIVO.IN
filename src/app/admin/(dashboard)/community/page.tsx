'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Users } from 'lucide-react';

interface PageEntry {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const SECTION_PAGES: PageEntry[] = [
  // Add community pages here as you build them
];

const ACCENT = '#cd5c5c';

export default function CommunityHubPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return SECTION_PAGES;
    const q = searchQuery.toLowerCase();
    return SECTION_PAGES.filter(
      (p) => p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8 text-center sm:mb-10">
        <p className="mb-3 text-xs font-jost-bold uppercase tracking-widest sm:text-sm" style={{ color: ACCENT }}>
          Community
        </p>
        <h1 className="text-2xl font-jost-bold sm:text-3xl md:text-4xl">
          Manage Community Pages
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Careers, contact, events, and engagement.
        </p>
      </div>

      {/* Search */}
      <div className="relative mx-auto mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pages..."
          disabled={SECTION_PAGES.length === 0}
          className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </div>

      {/* Section heading */}
      <div className="mb-5 flex items-center gap-2">
        <Users className="h-4 w-4" style={{ color: ACCENT }} />
        <h2 className="text-xs font-jost-bold uppercase tracking-widest text-muted-foreground">
          Pages
        </h2>
      </div>

      {/* Card grid or empty state */}
      {SECTION_PAGES.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 py-16 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="font-semibold text-muted-foreground">No community pages yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Pages will appear here as you build them.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 py-10 text-center">
          <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No pages match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {filtered.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <Icon size={24} className="text-primary" />
                </div>
                <div className="relative z-10">
                  <span className="text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                    {page.label}
                  </span>
                  <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                    {page.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
