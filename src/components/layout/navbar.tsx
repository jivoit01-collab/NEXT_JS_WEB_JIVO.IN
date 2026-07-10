'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { JivoLogo } from '@/components/shared/public';
import { useScroll } from '@/hooks';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

type NavbarSubLink = {
  title: string;
  href: string;
};

type NavbarLink = {
  title: string;
  href?: string;
  subLinks?: NavbarSubLink[];
};

const HOME_LINK: NavbarLink = { title: 'Home', href: '/' };

// Pages whose hero/video is meant to sit UNDER a fully transparent navbar — the
// bar never gains its scrolled background here, so full-bleed media isn't covered.
const TRANSPARENT_NAV_PAGES = new Set<string>(['/our-essence/baru-sahib-association']);

export type NavbarProps = {
  logoUrl?: string | null;
  logoAlt?: string | null;
  links: NavbarLink[];
};

export function Navbar({ logoAlt, links: navLinks }: NavbarProps) {
  const pathname = usePathname();
  const links = useMemo<NavbarLink[]>(
    () => (pathname === '/' ? navLinks : [HOME_LINK, ...navLinks]),
    [pathname, navLinks],
  );
  const scrolled = useScroll(40);
  const transparentNav = TRANSPARENT_NAV_PAGES.has(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<Record<string, boolean>>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const altText = logoAlt?.trim() || SITE_NAME;

  // Hover open
  const openDropdown = useCallback((key: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveDropdown(key);
  }, []);

  // Hover close
  const closeDropdown = useCallback(() => {
    leaveTimer.current = setTimeout(() => setActiveDropdown(null), 200);
  }, []);

  useEffect(() => {
    if (!activeDropdown) return;
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  useEffect(() => {
    const id = window.setTimeout(() => setDrawerMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  // Keep the mobile drawer from trapping scroll behind it.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen && !activeDropdown) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileOpen(false);
      setActiveDropdown(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDropdown, mobileOpen]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMobileOpen(false);
      setExpandedMobile({});
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Clear any pending hover-close timer on unmount
  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const toggleMobileAccordion = (key: string) => {
    setExpandedMobile((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-300',
          scrolled && !transparentNav
            ? 'bg-black/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl'
            : 'bg-transparent',
        )}
      >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4 lg:h-16 lg:px-6 xl:px-8 2xl:h-20 2xl:max-w-screen-2xl 2xl:px-12">
        {/* Logo */}
        <Link href="/" className="flex min-h-11 min-w-0 items-center" aria-label={altText}>
          <JivoLogo title={altText} className="h-7 w-auto text-white lg:h-9 2xl:h-12" />
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-7 xl:flex 2xl:gap-10">
          {links.map((link) => {
            const key = link.title;
            const hasSubLinks = (link.subLinks?.length ?? 0) > 0;
            const isActive = activeDropdown === key;

            return (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => hasSubLinks && openDropdown(key)}
                onMouseLeave={closeDropdown}
              >
                {/* MAIN LINK (Disabled navigation - acts as dropdown trigger) */}
                {hasSubLinks ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown((prev) => (prev === key ? null : key));
                    }}
                    className="inline-flex min-h-11 cursor-default items-center gap-1 text-sm font-jost-medium tracking-wide text-white 2xl:text-base"
                  >
                    {link.title}
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-300 2xl:h-4 2xl:w-4',
                        isActive && 'rotate-180',
                      )}
                    />
                  </button>
                ) : link.href === '/' ? (
                  <Link
                    href="/"
                    className="group inline-flex min-h-11 items-center gap-1 text-sm font-jost-medium tracking-wide text-white 2xl:text-base"
                  >
                    <span className="relative">
                      {link.title}
                      <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 cursor-default items-center gap-1 text-sm font-jost-medium tracking-wide text-white 2xl:text-base">
                    {link.title}
                  </span>
                )}

                {/* DROPDOWN */}
                {hasSubLinks && (
                  <div
                    className={cn(
                      'absolute top-full -left-6 z-50 pt-4 transition-all duration-200 ease-out 2xl:pt-5',
                      isActive
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-2 opacity-0',
                    )}
                  >
                    <div className="min-w-[220px] max-w-[min(82vw,320px)] rounded-2xl border border-white/22 bg-black/28 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.28)] ring-1 ring-white/12 backdrop-blur-2xl 2xl:min-w-65 2xl:p-3">
                      {link.subLinks?.map((sub) => (
                        <Link
                          key={sub.href + sub.title}
                          href={sub.href}
                          onClick={() => setActiveDropdown(null)}
                          className="group block min-h-11 rounded-xl px-4 py-2.5 text-sm font-jost-bold text-white transition duration-300 2xl:px-5 2xl:py-3 2xl:text-base"
                        >
                          <span className="relative inline-block text-pretty">
                            {sub.title}
                            <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="public-mobile-navigation"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition duration-300 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none xl:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      </header>

      {drawerMounted &&
        createPortal(
          <>
            {/* Mobile Drawer */}
            <div
              aria-hidden={!mobileOpen}
              className={cn(
                'fixed inset-0 z-[90] bg-black/35 backdrop-blur-[3px] transition-opacity duration-300 xl:hidden',
                mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
              )}
              onClick={() => setMobileOpen(false)}
            />

            <aside
              id="public-mobile-navigation"
              role="dialog"
              aria-hidden={!mobileOpen}
              aria-modal={mobileOpen}
              aria-label="Mobile navigation"
              className={cn(
                'fixed inset-y-0 right-0 z-[100] isolate flex h-dvh w-[min(88vw,380px)] max-w-[380px] flex-col overflow-hidden border-l border-white/18 bg-black/28 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/12 backdrop-blur-2xl transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] xl:hidden',
                mobileOpen
                  ? 'pointer-events-auto translate-x-0 opacity-100'
                  : 'pointer-events-none translate-x-full opacity-0',
              )}
            >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/12 bg-white/5 px-5">
          <Link
            href="/"
            className="flex min-w-0 items-center"
            aria-label={altText}
            onClick={() => setMobileOpen(false)}
          >
            <JivoLogo title={altText} className="h-8 w-auto text-white" />
          </Link>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition duration-300 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile navigation links" className="mobile-nav-scroll flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {links.map((link, index) => {
              const key = link.title;
              const hasSubLinks = (link.subLinks?.length ?? 0) > 0;
              const isExpanded = expandedMobile[key] ?? false;

              return (
                <div
                  key={key}
                  className={cn(
                    'transition-[transform,opacity] duration-500 ease-out',
                    mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
                  )}
                  style={{ transitionDelay: mobileOpen ? `${120 + index * 35}ms` : '0ms' }}
                >
                  {hasSubLinks ? (
                    <button
                      type="button"
                      onClick={() => toggleMobileAccordion(key)}
                      aria-expanded={isExpanded}
                      className="group flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-base font-jost-bold text-white transition duration-300 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                    >
                      <span className="relative inline-block min-w-0 text-pretty">
                        {link.title}
                        <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-5 w-5 shrink-0 transition-transform duration-300',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </button>
                  ) : link.href ? (
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="group block min-h-11 min-w-0 rounded-lg px-4 py-3 text-base font-jost-bold text-white transition duration-300 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                    >
                      <span className="relative inline-block min-w-0 text-pretty">
                        {link.title}
                        <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  ) : (
                    <span className="block min-h-11 rounded-lg px-4 py-3 text-base font-jost-bold text-white/80">
                      {link.title}
                    </span>
                  )}

                  {hasSubLinks && (
                    <div
                      className={cn(
                        'grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out',
                        isExpanded
                          ? 'grid-rows-[1fr] translate-y-0 opacity-100'
                          : 'grid-rows-[0fr] -translate-y-1 opacity-0',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="ml-4 border-l border-white/15 py-1 pl-3">
                          {link.subLinks?.map((sub) => (
                            <Link
                              key={sub.href + sub.title}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className="group block min-h-11 min-w-0 rounded-md px-3 py-2.5 text-sm font-jost-bold text-white/78 transition duration-300 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                            >
                              <span className="relative inline-block min-w-0 text-pretty">
                                {sub.title}
                                <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
            </aside>

            <style jsx global>{`
              .mobile-nav-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .mobile-nav-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .mobile-nav-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.18);
                border-radius: 999px;
              }
              .mobile-nav-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.32);
              }
              .mobile-nav-scroll {
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
              }
            `}</style>
          </>,
          document.body,
        )}
    </>
  );
}
