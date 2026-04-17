'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Home,
  Search,
  BookOpen,
  Package,
  Newspaper,
  Users,
  ChevronDown,
  FileText,
  Navigation,
  PanelBottom,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// ── Page registry — all managed pages grouped by nav section ──

interface PageEntry {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

interface NavSection {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  pages: PageEntry[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    key: 'our-essence',
    label: 'Our Essence',
    icon: Sparkles,
    color: '#0a7362',
    pages: [
      {
        label: 'The Story',
        href: '/admin/our-essence-the-story',
        icon: BookOpen,
        description: 'Hero, founder bio, vision — the Jivo journey',
      },
      // Future: { label: 'Our Values', href: '/admin/our-essence-values', icon: Heart, description: '...' },
    ],
  },
  {
    key: 'our-products',
    label: 'Our Products',
    icon: Package,
    color: '#b8860b',
    pages: [
      // Future product pages will be added here
    ],
  },
  {
    key: 'media',
    label: 'Jivo Media',
    icon: Newspaper,
    color: '#6a5acd',
    pages: [
      // Future media pages will be added here
    ],
  },
  {
    key: 'community',
    label: 'Community',
    icon: Users,
    color: '#cd5c5c',
    pages: [
      // Future community pages will be added here
    ],
  },
];

const GLOBAL_PAGES: PageEntry[] = [
  { label: 'Home Page', href: '/admin/home', icon: Home, description: 'Hero, categories, vision, why Jivo & more' },
  { label: 'Navbar', href: '/admin/navbar', icon: Navigation, description: 'Logo, links & dropdown sub-links' },
  { label: 'Footer', href: '/admin/footer', icon: PanelBottom, description: 'Columns, links & contact settings' },
  { label: 'SEO Manager', href: '/admin/seo', icon: Globe, description: 'Per-page meta titles, OG & JSON-LD' },
];

// ── Component ────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (key: string) => {
    setExpandedSection((prev) => (prev === key ? null : key));
  };

  // Flatten all pages for search
  const allSearchablePages = useMemo(() => {
    const pages: (PageEntry & { section?: string })[] = [];
    for (const section of NAV_SECTIONS) {
      for (const page of section.pages) {
        pages.push({ ...page, section: section.label });
      }
    }
    for (const page of GLOBAL_PAGES) {
      pages.push({ ...page, section: 'Global' });
    }
    return pages;
  }, []);

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allSearchablePages.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.section?.toLowerCase().includes(q),
    );
  }, [searchQuery, allSearchablePages]);

  const totalPages = NAV_SECTIONS.reduce((n, s) => n + s.pages.length, 0) + GLOBAL_PAGES.length;

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8">
      {/* ── Header ────────────────────────────── */}
      <div className="mb-8 text-center sm:mb-10">
        <p className="mb-3 text-xs font-jost-bold uppercase tracking-widest text-gold sm:text-sm">
          Admin Dashboard
        </p>
        <h1 className="text-2xl font-jost-bold sm:text-3xl md:text-4xl lg:text-5xl">
          <span className="text-foreground">Welcome to</span>{' '}
          <span className="admin-gradient-text">Jivo Wellness</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          {totalPages} pages managed &middot; Organize, edit, and publish content across your entire website.
        </p>
      </div>

      {/* ── Search bar ────────────────────────── */}
      <div className="relative mx-auto mb-8 max-w-md">
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

      {/* ── Search results ────────────────────── */}
      {filteredPages && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-jost-medium uppercase tracking-wider text-muted-foreground">
            {filteredPages.length} result{filteredPages.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
          </p>
          {filteredPages.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 py-10 text-center">
              <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No pages match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPages.map((page) => (
                <PageCard key={page.href} page={page} badge={page.section} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Content (hidden when searching) ──── */}
      {!filteredPages && (
        <>
          {/* ── 4 Nav-section accordions ──────── */}
          <div className="mb-8 space-y-3">
            <h2 className="mb-4 text-xs font-jost-bold uppercase tracking-widest text-muted-foreground">
              Website Sections
            </h2>
            {NAV_SECTIONS.map((section) => {
              const isExpanded = expandedSection === section.key;
              const Icon = section.icon;
              const pageCount = section.pages.length;

              return (
                <div
                  key={section.key}
                  className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                >
                  {/* Accordion header */}
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${section.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: section.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-jost-bold text-foreground">{section.label}</span>
                      <p className="text-xs text-muted-foreground">
                        {pageCount === 0
                          ? 'No pages yet — coming soon'
                          : `${pageCount} page${pageCount !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Accordion body — expandable */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="border-t px-5 py-4">
                      {pageCount === 0 ? (
                        <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center">
                          <FileText className="mx-auto h-6 w-6 text-muted-foreground/40" />
                          <p className="text-xs text-muted-foreground">
                            Pages for this section will appear here as you build them.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {section.pages.map((page) => (
                            <PageCard key={page.href} page={page} accentColor={section.color} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Global pages ──────────────────── */}
          <div>
            <h2 className="mb-4 text-xs font-jost-bold uppercase tracking-widest text-muted-foreground">
              Global Pages & Settings
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {GLOBAL_PAGES.map((page) => (
                <PageCard key={page.href} page={page} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── PageCard ─────────────────────────────────────────────────

function PageCard({
  page,
  accentColor,
  badge,
}: {
  page: PageEntry;
  accentColor?: string;
  badge?: string;
}) {
  const Icon = page.icon;
  const color = accentColor ?? 'var(--color-primary)';

  return (
    <Link
      href={page.href}
      className="group relative flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-jost-medium text-foreground">{page.label}</span>
          {badge && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-jost-medium text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{page.description}</p>
      </div>
      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
