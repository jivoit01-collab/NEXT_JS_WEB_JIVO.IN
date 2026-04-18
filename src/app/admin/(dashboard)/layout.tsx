'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  Menu,
  X,
  LayoutDashboard,
  Home,
  Navigation,
  PanelBottom,
  Globe,
  Sparkles,
  Package,
  Newspaper,
  Users,
  BookOpen,
  Compass,
  ChevronDown,
  LogOut,
  ArrowLeft,
  Moon,
  Sun,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────

interface NavChild {
  title: string;
  href: string;
  icon: React.ElementType;
  tab?: string;
}

interface NavSection {
  title: string;
  href: string;
  icon: React.ElementType;
  children: NavChild[];
}

// Every sidebar item is a section with a dropdown.
// Even if it has only one child, the UI stays consistent.

const SIDEBAR: NavSection[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    children: [
      { title: 'Home Page', href: '/admin/home', icon: Home },
      { title: 'Navbar', href: '/admin/navbar', icon: Navigation },
      { title: 'Footer', href: '/admin/footer', icon: PanelBottom },
    ],
  },
  {
    title: 'Our Essence',
    href: '/admin/our-essence',
    icon: Sparkles,
    children: [
      { title: 'The Story', href: '/admin/our-essence-the-story', icon: BookOpen },
      { title: 'Core Values', href: '/admin/our-essence-core-values', icon: Compass },
    ],
  },
  {
    title: 'Our Products',
    href: '/admin/our-products',
    icon: Package,
    children: [],
  },
  {
    title: 'Jivo Media',
    href: '/admin/media',
    icon: Newspaper,
    children: [],
  },
  {
    title: 'Community',
    href: '/admin/community',
    icon: Users,
    children: [],
  },
  {
    title: 'SEO Manager',
    href: '/admin/seo',
    icon: Globe,
    children: [
      { title: 'Home', href: '/admin/home', icon: Home, tab: 'seo' },
      { title: 'The Story', href: '/admin/our-essence-the-story', icon: BookOpen, tab: 'seo' },
      { title: 'Core Values', href: '/admin/our-essence-core-values', icon: Compass, tab: 'seo' },
    ],
  },
];

// ── Layout ───────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMobileOpen(false), [pathname]);

  // Auto-expand the section that contains the active page
  useEffect(() => {
    for (const section of SIDEBAR) {
      const hasActiveChild = section.children.some((c) => {
        if (!pathname.startsWith(c.href)) return false;
        if (c.tab) return tabParam === c.tab;
        return !tabParam;
      });
      const isSelfActive = pathname === section.href;
      if (hasActiveChild || isSelfActive) {
        setExpanded((prev) => ({ ...prev, [section.title]: true }));
      }
    }
  }, [pathname, tabParam]);

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

  /** True when this child link matches current URL (path + optional tab param). */
  const isChildActive = (child: NavChild) => {
    if (!pathname.startsWith(child.href)) return false;
    if (child.tab) return tabParam === child.tab;
    return !tabParam;
  };

  /** True when this section's hub OR any of its children is the current page. */
  const isSectionActive = (section: NavSection) =>
    pathname === section.href || section.children.some((c) => isChildActive(c));

  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ───────────────────────────── */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card shadow-sm',
          'transform transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-64',
          'md:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <Link href="/" title="Back to Website">
            <ArrowLeft size={20} className="cursor-pointer hover:text-primary" />
          </Link>
          <span className="text-lg font-jost-bold">Admin Panel</span>
          <button onClick={() => setMobileOpen(false)} className="cursor-pointer md:hidden" aria-label="Close sidebar">
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
                    className="flex flex-1 cursor-pointer items-center gap-3 py-2.5 pl-3 text-sm font-jost-medium"
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </Link>

                  <button
                    onClick={() => toggle(section.title)}
                    className="cursor-pointer px-3 py-2.5"
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
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="ml-4 border-l border-border/50 py-1 pl-3">
                    {section.children.length === 0 ? (
                      <span className="block py-2 text-[11px] italic text-muted-foreground/50">
                        No pages yet
                      </span>
                    ) : (
                      section.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isChildActive(child);
                        const childHref = child.tab ? `${child.href}?tab=${child.tab}` : child.href;
                        return (
                          <Link
                            key={childHref}
                            href={childHref}
                            className={cn(
                              'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition',
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
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t p-4 text-xs text-muted-foreground">
          <p>Manage all pages from each section.</p>
        </div>
      </aside>

      {/* ── Main content ──────────────────────── */}
      <div className="min-w-0 flex-1 md:ml-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="cursor-pointer" aria-label="Open menu">
              <Menu size={24} />
            </button>
            <h1 className="truncate text-sm font-jost-bold">Admin Panel</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9">
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: '/admin/login' })} className="gap-2">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <header className="sticky top-0 z-20 hidden h-12 items-center justify-end gap-3 border-b bg-background/95 px-6 backdrop-blur md:flex">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9">
            {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: '/admin/login' })} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
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
