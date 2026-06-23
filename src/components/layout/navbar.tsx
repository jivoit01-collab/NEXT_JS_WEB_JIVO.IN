'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useScroll } from '@/hooks';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toSrc } from '@/components/shared/image-upload';

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

export type NavbarProps = {
  logoUrl?: string | null;
  logoAlt?: string | null;
  links: NavbarLink[];
};

export function Navbar({ logoUrl, logoAlt, links: navLinks }: NavbarProps) {
  const pathname = usePathname();
  const links = useMemo<NavbarLink[]>(
    () => (pathname === '/' ? navLinks : [HOME_LINK, ...navLinks]),
    [pathname, navLinks],
  );
  const scrolled = useScroll(40);
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

  // Click outside close
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
          scrolled
            ? 'bg-black/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl'
            : 'bg-transparent',
        )}
      >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-16 lg:px-12 2xl:h-20 2xl:max-w-screen-2xl 2xl:px-20">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center rounded-md focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          aria-label={altText}
        >
          {logoUrl ? (
            <Image
              src={toSrc(logoUrl)}
              alt={altText}
              width={160}
              height={56}
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 112px, (max-width: 1536px) 144px, 192px"
              className="h-7 w-auto object-contain lg:h-9 2xl:h-12"
            />
          ) : (
            <span className="text-xl font-bold tracking-tight text-white lg:text-2xl 2xl:text-3xl">
              {altText}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Main"
          className="hidden items-center gap-5 lg:flex xl:gap-8 2xl:gap-12"
        >
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
                    className="flex cursor-default items-center gap-1 rounded-md text-[13px] font-medium tracking-wide text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none xl:text-sm 2xl:text-base"
                  >
                    {link.title}
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-300 motion-reduce:transition-none 2xl:h-4 2xl:w-4',
                        isActive && 'rotate-180',
                      )}
                    />
                  </button>
                ) : link.href === '/' ? (
                  <Link
                    href="/"
                    className="group flex items-center gap-1 rounded-md text-[13px] font-medium tracking-wide text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none xl:text-sm 2xl:text-base"
                  >
                    <span className="relative">
                      {link.title}
                      <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                ) : (
                  <span className="flex cursor-default items-center gap-1 text-[13px] font-medium tracking-wide text-white xl:text-sm 2xl:text-base">
                    {link.title}
                  </span>
                )}

                {/* DROPDOWN */}
                {hasSubLinks && (
                  <div
                    className={cn(
                      'absolute top-full -left-6 z-50 pt-4 transition-all duration-200 ease-out motion-reduce:transition-none 2xl:pt-5',
                      isActive
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-2 opacity-0',
                    )}
                  >
                    <div className="min-w-[220px] rounded-2xl border border-white/22 bg-black/28 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.28)] ring-1 ring-white/12 backdrop-blur-2xl 2xl:min-w-65 2xl:p-3">
                      {link.subLinks?.map((sub) => (
                        <Link
                          key={sub.href + sub.title}
                          href={sub.href}
                          onClick={() => setActiveDropdown(null)}
                          className="group block rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none 2xl:px-5 2xl:py-3 2xl:text-base"
                        >
                          <span className="relative inline-block whitespace-nowrap">
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
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition duration-300 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none lg:hidden"
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
                'fixed inset-0 z-[90] bg-black/35 backdrop-blur-[3px] transition-opacity duration-300 motion-reduce:transition-none lg:hidden',
                mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
              )}
              onClick={() => setMobileOpen(false)}
            />

            <aside
              id="public-mobile-navigation"
              className={cn(
                'fixed inset-y-0 right-0 z-[100] isolate flex h-[100dvh] w-[72vw] min-w-[248px] max-w-[320px] flex-col overflow-hidden border-l border-white/18 bg-black/28 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/12 backdrop-blur-2xl transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:hidden',
                mobileOpen
                  ? 'pointer-events-auto translate-x-0 opacity-100'
                  : 'pointer-events-none translate-x-full opacity-0',
              )}
            >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/12 bg-white/5 px-5">
          <Link
            href="/"
            className="flex min-w-0 items-center rounded-md focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            aria-label={altText}
            onClick={() => setMobileOpen(false)}
          >
            {logoUrl ? (
              <Image
                src={toSrc(logoUrl)}
                alt={altText}
                width={136}
                height={48}
                sizes="136px"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="truncate text-lg font-bold tracking-tight">{altText}</span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition duration-300 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="mobile-nav-scroll flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {links.map((link, index) => {
              const key = link.title;
              const hasSubLinks = (link.subLinks?.length ?? 0) > 0;
              const isExpanded = expandedMobile[key] ?? false;

              return (
                <div
                  key={key}
                  className={cn(
                    'transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none',
                    mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
                  )}
                  style={{ transitionDelay: mobileOpen ? `${120 + index * 35}ms` : '0ms' }}
                >
                  {hasSubLinks ? (
                    <button
                      type="button"
                      onClick={() => toggleMobileAccordion(key)}
                      aria-expanded={isExpanded}
                      className="group flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-left text-base font-semibold text-white transition duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none"
                    >
                      <span className="relative inline-block whitespace-nowrap">
                        {link.title}
                        <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full motion-reduce:transition-none" />
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-5 w-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </button>
                  ) : link.href ? (
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="group block rounded-lg px-4 py-3 text-base font-semibold text-white transition duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none"
                    >
                      <span className="relative inline-block whitespace-nowrap">
                        {link.title}
                        <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  ) : (
                    <span className="block rounded-lg px-4 py-3 text-base font-semibold text-white/80">
                      {link.title}
                    </span>
                  )}

                  {hasSubLinks && (
                    <div
                      className={cn(
                        'grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out motion-reduce:transition-none',
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
                              className="group block rounded-md px-3 py-2.5 text-sm font-semibold text-white/78 transition duration-300 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none"
                            >
                              <span className="relative inline-block whitespace-nowrap">
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
