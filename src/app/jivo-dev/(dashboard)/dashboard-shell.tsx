'use client';

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LivePreviewButton } from '@/components/shared/admin';
import { useTheme } from '@/providers/theme-provider';
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  LogOut,
  ArrowLeft,
  Moon,
  Sun,
  BarChart3,
} from 'lucide-react';
import { getCmsModules, getSeoPages } from '@/modules/admin/cms';

// ── Types ────────────────────────────────────────────────────

/**
 * A pre-rendered analytics sidebar leaf. The icon is a SERVER-rendered node
 * (not a component), so this client shell never imports the analytics service
 * registry — which carries eager, lucide-laden registration side effects that,
 * when pulled into the client graph, duplicate React and crash lucide icons on
 * analytics pages. Phase 4.7: sidebar shows top-level modules only (no pages).
 */
export interface AnalyticsNavLink {
  id: string;
  title: string;
  href: string;
  icon: ReactNode;
}

interface NavChild {
  title: string;
  href: string;
  icon: React.ElementType;
  tab?: string;
  /** Match the URL exactly (used for hub/overview links). */
  exact?: boolean;
}

interface NavSection {
  title: string;
  href: string;
  icon: React.ElementType;
  children: NavChild[];
  /** Analytics section only — a flat, top-level module list (Phase 4.7). */
  analyticsLeaves?: AnalyticsNavLink[];
}

// CMS + SEO sidebar sections come from the CMS page registry (client-safe: pure
// in-memory reads, no side effects). The Analytics section is passed in from the
// SERVER layout as pre-rendered leaves — see AnalyticsNavLink above.

const CMS_SECTIONS: NavSection[] = getCmsModules().map((m) => ({
  title: m.name,
  href: m.adminHref,
  icon: m.icon,
  children: m.pages.map((p) => ({ title: p.name, href: p.adminHref, icon: p.icon })),
}));

const SEO_SECTION: NavSection = {
  title: 'SEO Manager',
  href: '/jivo-dev/seo',
  icon: Globe,
  children: getSeoPages().map((p) => ({
    title: p.name,
    href: p.adminHref,
    icon: p.icon,
    tab: 'seo',
  })),
};

// ── Shell ────────────────────────────────────────────────────

export function DashboardShell({
  analyticsNav,
  analyticsRoot,
  children,
}: {
  analyticsNav: AnalyticsNavLink[];
  analyticsRoot: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);

  const ANALYTICS_SECTION: NavSection = useMemo(
    () => ({
      title: 'Analytics',
      href: analyticsRoot,
      icon: BarChart3,
      children: [],
      analyticsLeaves: analyticsNav,
    }),
    [analyticsNav, analyticsRoot],
  );

  const SIDEBAR: NavSection[] = useMemo(
    () => [...CMS_SECTIONS, ANALYTICS_SECTION, SEO_SECTION],
    [ANALYTICS_SECTION],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    const id = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Auto-expand the section that contains the active page.
  useEffect(() => {
    for (const section of SIDEBAR) {
      const isSelfActive = pathname === section.href;
      const inAnalytics = !!section.analyticsLeaves && pathname.startsWith(`${analyticsRoot}/`);
      const hasActiveChild =
        !section.analyticsLeaves &&
        section.children.some((c) => {
          if (!pathname.startsWith(c.href)) return false;
          if (c.tab) return tabParam === c.tab;
          return !tabParam;
        });
      if (hasActiveChild || isSelfActive || inAnalytics) {
        window.setTimeout(() => {
          setExpanded((prev) => ({ ...prev, [section.title]: true }));
        }, 0);
      }
    }
  }, [pathname, tabParam, SIDEBAR, analyticsRoot]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node) && mobileOpen) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [mobileOpen]);

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const closeSidebar = useCallback(() => {
    setMobileOpen(false);
    setSidebarCollapsed(true);
  }, []);

  const openMobileSidebar = useCallback(() => {
    setSidebarCollapsed(false);
    setMobileOpen(true);
  }, []);

  /** True when this child link matches current URL (path + optional tab param). */
  const isChildActive = (child: NavChild) => {
    if (child.exact) return pathname === child.href;
    if (!pathname.startsWith(child.href)) return false;
    if (child.tab) return tabParam === child.tab;
    return !tabParam;
  };

  /** True when the current path is at, or nested under, a route. */
  const pathUnder = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  /** True when this section's hub OR any of its children is the current page. */
  const isSectionActive = (section: NavSection) => {
    if (section.analyticsLeaves) return pathUnder(analyticsRoot);
    return pathname === section.href || section.children.some((c) => isChildActive(c));
  };

  // Shared classes for analytics nav links.
  const leafCls =
    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition 2xl:px-3 2xl:py-2.5 2xl:text-sm';
  const activeCls = 'bg-primary/15 font-jost-medium text-primary';
  const idleCls = 'text-muted-foreground hover:bg-accent hover:text-foreground';

  /** Render the flat, top-level analytics modules (Phase 4.7 — no page children). */
  const renderAnalyticsLeaves = (leaves: AnalyticsNavLink[]) =>
    leaves.map((item) => {
      // The Overview hub ("Dashboard") matches only its exact route; every other
      // module is active when the URL is at or nested under it.
      const active = item.href === analyticsRoot ? pathname === item.href : pathUnder(item.href);
      return (
        <Link
          key={item.id}
          href={item.href}
          className={cn(leafCls, active ? activeCls : idleCls)}
        >
          <span className="shrink-0">{item.icon}</span>
          <span className="truncate">{item.title}</span>
        </Link>
      );
    });

  return (
    <div className="bg-background flex min-h-screen">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────── */}
      <aside
        ref={sidebarRef}
        className={cn(
          'bg-card fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r shadow-sm 2xl:w-72 print:hidden',
          'transform transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'md:-translate-x-full' : 'md:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6 2xl:h-20 2xl:px-8">
          <button
            type="button"
            onClick={closeSidebar}
            title="Close sidebar"
            className="hover:text-primary cursor-pointer transition-colors"
            aria-label="Close sidebar"
          >
            <ArrowLeft size={20} className="2xl:h-6 2xl:w-6" />
          </button>
          <span className="font-jost-bold text-lg 2xl:text-xl">Admin Panel</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="cursor-pointer md:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
          <div className="hidden w-5 md:block" />
        </div>

        {/* Nav — all items are dropdown sections */}
        <nav className="sidebar-scroll flex-1 space-y-0.5 overflow-y-auto p-3">
          {SIDEBAR.map((section) => {
            const active = isSectionActive(section);
            const isOpen = expanded[section.title] ?? false;
            const Icon = section.icon;

            return (
              <div key={section.title}>
                {/* Section header */}
                <div
                  className={cn(
                    'flex items-center rounded-lg transition',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/80 hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Link
                    href={section.href}
                    className="font-jost-medium flex flex-1 cursor-pointer items-center gap-3 py-2.5 pl-3 text-sm 2xl:py-3 2xl:pl-4 2xl:text-base"
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </Link>

                  <button
                    onClick={() => toggle(section.title)}
                    className="cursor-pointer px-3 py-2.5 2xl:px-4 2xl:py-3"
                    aria-label={isOpen ? `Collapse ${section.title}` : `Expand ${section.title}`}
                  >
                    <ChevronDown
                      size={16}
                      className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
                    />
                  </button>
                </div>

                {/* Dropdown children */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-250 ease-in-out',
                    isOpen
                      ? cn('opacity-100', section.analyticsLeaves ? 'max-h-[2000px]' : 'max-h-125')
                      : 'max-h-0 opacity-0',
                  )}
                >
                  {section.analyticsLeaves ? (
                    <div className="ml-1 space-y-0.5 py-1">
                      {renderAnalyticsLeaves(section.analyticsLeaves)}
                    </div>
                  ) : (
                    <div className="border-border/50 ml-4 border-l py-1 pl-3">
                      {section.children.length === 0 ? (
                        <span className="text-muted-foreground/50 block py-2 text-[11px] italic">
                          No pages yet
                        </span>
                      ) : (
                        section.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isChildActive(child);
                          const childHref = child.tab
                            ? `${child.href}?tab=${child.tab}`
                            : child.href;
                          return (
                            <Link
                              key={childHref}
                              href={childHref}
                              className={cn(
                                'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition 2xl:px-3 2xl:py-2.5 2xl:text-sm',
                                childActive
                                  ? 'bg-primary/15 font-jost-medium text-primary'
                                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                              )}
                            >
                              <ChildIcon size={14} className="shrink-0" />
                              <span className="truncate">{child.title}</span>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ──────────────────────── */}
      <div
        className={cn(
          'min-w-0 flex-1 transition-[margin] duration-300 print:ml-0',
          sidebarCollapsed ? 'md:ml-0' : 'md:ml-64 2xl:ml-72',
        )}
      >
        <header className="bg-background/95 sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:hidden print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={openMobileSidebar}
              className="cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-jost-bold truncate text-sm">Admin Panel</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <LivePreviewButton
              iconOnly
              className="h-9 w-9 border-border/60 bg-background/70"
            />
            <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: '/jivo-dev/login' })} className="gap-2">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <header className="bg-background/95 sticky top-0 z-20 hidden h-16 items-center justify-between gap-3 border-b px-6 backdrop-blur md:flex 2xl:h-20 2xl:gap-4 2xl:px-8 print:!hidden">
          <div className="flex items-center gap-3">
            {sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(false)}
                className="h-9 w-9"
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3 2xl:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <LivePreviewButton className="h-9" />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/jivo-dev/login' })}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 2xl:p-10">{children}</main>
      </div>

      <style jsx global>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.2);
          border-radius: 999px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.4);
        }
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
        }
      `}</style>
    </div>
  );
}
