'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Sparkles, BookOpen, Compass, Landmark, Users } from 'lucide-react';

interface PageEntry {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const SECTION_PAGES: PageEntry[] = [
  {
    label: 'The Story',
    href: '/admin/our-essence-the-story',
    icon: BookOpen,
    description: 'Hero, founder bio & vision',
    color: 'from-teal-500/20 to-teal-600/5',
  },
  {
    label: 'Core Values',
    href: '/admin/our-essence-core-values',
    icon: Compass,
    description: 'Truth, Devotion, Sewa, Intelligence, Integrity',
    color: 'from-amber-500/20 to-amber-600/5',
  },
  {
    label: 'Baru Sahib Association',
    href: '/admin/our-essence-baru-sahib-association',
    icon: Landmark,
    description: 'Hero, cinematic video & humanity story',
    color: 'from-emerald-500/20 to-emerald-600/5',
  },
  {
    label: 'Social Initiatives',
    href: '/admin/our-essence-social-initiatives',
    icon: Users,
    description: 'Hero mission, responsibilities & empowerment',
    color: 'from-rose-500/20 to-rose-600/5',
  },
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
    <div className="mx-auto max-w-5xl py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8 text-center sm:mb-10">
        <p
          className="font-jost-bold mb-3 text-xs tracking-widest uppercase sm:text-sm"
          style={{ color: ACCENT }}
        >
          Our Essence
        </p>
        <h1 className="font-jost-bold text-2xl sm:text-3xl md:text-4xl">
          Manage Our Essence Pages
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm">
          The story, values, and identity of Jivo Wellness.
        </p>
      </div>

      {/* Search */}
      <div className="relative mx-auto mb-8 max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pages..."
          className="bg-card focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Section heading */}
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: ACCENT }} />
        <h2 className="font-jost-bold text-muted-foreground text-xs tracking-widest uppercase">
          Pages
        </h2>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="bg-muted/20 rounded-xl border border-dashed py-10 text-center">
          <Search className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground text-sm">No pages match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {filtered.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-card hover:border-primary/30 relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="bg-primary/10 group-hover:bg-primary/20 relative z-10 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110">
                  <Icon size={24} className="text-primary" />
                </div>
                <div className="relative z-10">
                  <span className="text-foreground group-hover:text-primary text-sm font-semibold transition-colors duration-200">
                    {page.label}
                  </span>
                  <p className="text-muted-foreground mt-1 text-[11px] leading-tight">
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
