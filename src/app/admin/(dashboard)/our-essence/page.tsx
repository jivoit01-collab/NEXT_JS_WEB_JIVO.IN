'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Sparkles, BookOpen, Compass } from 'lucide-react';

interface PageEntry {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const SECTION_PAGES: PageEntry[] = [
  { label: 'The Story', href: '/admin/our-essence-the-story', icon: BookOpen, description: 'Hero, founder bio & vision', color: 'from-teal-500/20 to-teal-600/5' },
  { label: 'Core Values', href: '/admin/our-essence-core-values', icon: Compass, description: 'Truth, Devotion, Sewa, Intelligence, Integrity', color: 'from-amber-500/20 to-amber-600/5' },
  // Add more Our Essence pages here
];

const ACCENT = '#0a7362';

export default function OurEssenceHubPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return SECTION_PAGES;
    const q = searchQuery.toLowerCase();
    return SECTION_PAGES.filter(
      (p) => p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8 2xl:max-w-7xl 2xl:py-10">
      {/* Header */}
      <div className="mb-8 text-center sm:mb-10">
        <p className="mb-3 text-xs font-jost-bold uppercase tracking-widest sm:text-sm 2xl:text-base" style={{ color: ACCENT }}>
          Our Essence
        </p>
        <h1 className="text-2xl font-jost-bold sm:text-3xl md:text-4xl 2xl:text-5xl">
          Manage Our Essence Pages
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground 2xl:text-base 2xl:max-w-xl">
          The story, values, and identity of Jivo Wellness.
        </p>
      </div>

      {/* Search */}
      <div className="relative mx-auto mb-8 max-w-md 2xl:max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pages..."
          className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Section heading */}
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: ACCENT }} />
        <h2 className="text-xs font-jost-bold uppercase tracking-widest text-muted-foreground">
          Pages
        </h2>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 py-10 text-center">
          <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No pages match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 2xl:grid-cols-5 2xl:gap-6">
          {filtered.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg 2xl:p-8 2xl:gap-4"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${page.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 2xl:h-14 2xl:w-14 2xl:rounded-2xl">
                  <Icon size={24} className="text-primary" />
                </div>
                <div className="relative z-10">
                  <span className="text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-primary 2xl:text-base">
                    {page.label}
                  </span>
                  <p className="mt-1 text-[11px] leading-tight text-muted-foreground 2xl:text-xs">
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
