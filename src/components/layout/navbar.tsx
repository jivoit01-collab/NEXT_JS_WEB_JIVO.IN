'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { SmartLink } from '@/components/shared/smart-link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { JivoLogo } from '@/components/shared/public';
import { useScroll } from '@/hooks';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

type NavbarSubLink = {
  title: string;
  href: string;
  group?: string | null;
};

type NavbarLink = {
  title: string;
  href?: string;
  subLinks?: NavbarSubLink[];
};

/** A group of sub-links for the two-level mega-dropdown. */
type SubLinkGroup = {
  name: string; // "" = ungrouped (rendered as standalone items)
  items: NavbarSubLink[];
};

/**
 * Split a link's sub-links into ordered groups. Group order follows the FIRST
 * appearance of each group in the (already sortOrder-ordered) sub-links, so
 * dragging sub-links in admin controls group order too. Ungrouped links collect
 * under a trailing "" group. Returns null when NOTHING is grouped — the caller
 * then renders the classic flat dropdown.
 */
function groupSubLinks(subLinks: NavbarSubLink[]): SubLinkGroup[] | null {
  const hasGroups = subLinks.some((s) => s.group && s.group.trim());
  if (!hasGroups) return null;
  const order: string[] = [];
  const map = new Map<string, NavbarSubLink[]>();
  for (const s of subLinks) {
    const key = s.group?.trim() || '';
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(s);
  }
  // Named groups first (in first-seen order), the ungrouped bucket last.
  const named = order.filter((k) => k !== '');
  const groups: SubLinkGroup[] = named.map((name) => ({ name, items: map.get(name)! }));
  if (map.has('')) groups.push({ name: '', items: map.get('')! });
  return groups;
}

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
  // Which group's side panel is open inside a grouped dropdown (desktop).
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  // Vertical offset (px, within the group column) of the hovered group button so
  // the side panel opens level with it — the cursor can then move straight across
  // to the links instead of crossing empty space (which would close the menu).
  const [groupTop, setGroupTop] = useState(0);

  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const altText = logoAlt?.trim() || SITE_NAME;

  // Hover open
  const openDropdown = useCallback((key: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveDropdown(key);
  }, []);

  // Hover close
  const closeDropdown = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setActiveDropdown(null);
      setActiveGroup(null);
    }, 200);
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
      {/* Single centred content container. The nav links stay inside the same
          max-width as the page content instead of spreading to the viewport
          edges on wide screens. */}
      <div className="mx-auto flex h-14 max-w-8xl items-center justify-between px-6 sm:px-8 lg:h-16 lg:px-18 2xl:h-20">
        {/* Logo */}
        <Link href="/" className="flex min-h-11 min-w-0 items-center" aria-label={altText}>
          <JivoLogo title={altText} className="h-7 w-auto text-white lg:h-9 2xl:h-12" />
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-7 xl:flex 2xl:gap-10">
          {links.map((link, index) => {
            const key = link.title;
            const hasSubLinks = (link.subLinks?.length ?? 0) > 0;
            const isActive = activeDropdown === key;
            // Items near the right edge open their panel leftwards, otherwise the
            // last menus (e.g. Community) overflow past the viewport edge.
            const alignRight = index >= links.length - 2;
            // Two-level grouping (e.g. Products → Healthy Oils / Beverages …).
            // null when nothing is grouped → classic flat dropdown.
            const groups = hasSubLinks ? groupSubLinks(link.subLinks ?? []) : null;

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
                        'h-3.5 w-3.5 transition-transform duration-300 motion-reduce:transition-none 2xl:h-4 2xl:w-4',
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
                      'absolute top-full z-50 pt-4 transition-all duration-200 ease-out motion-reduce:transition-none 2xl:pt-5',
                      alignRight ? '-right-6' : '-left-6',
                      isActive
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-2 opacity-0',
                    )}
                  >
                    {groups ? (
                      /* Two-level: a group column; hovering a named group opens
                         its links in a SEPARATE floating box to the LEFT (with a
                         gap), sized to fit its links. Arrows point left. */
                      <div className="relative">
                        {/* Group column box */}
                        <div className="flex max-h-[min(72vh,34rem)] w-[200px] flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-2xl border border-white/22 bg-black/28 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.28)] ring-1 ring-white/12 backdrop-blur-2xl 2xl:w-56 2xl:p-3">
                          {groups.map((grp) =>
                            grp.name === '' ? (
                              // Ungrouped links render directly in the column.
                              grp.items.map((sub) => (
                                <SmartLink
                                  key={sub.href + sub.title}
                                  href={sub.href}
                                  onClick={() => setActiveDropdown(null)}
                                  onMouseEnter={() => setActiveGroup(null)}
                                  className="group/leaf block min-h-11 rounded-xl px-4 py-2.5 text-sm font-jost-bold text-white transition duration-300 2xl:px-5 2xl:py-3 2xl:text-base"
                                >
                                  <span className="relative inline-block text-pretty">
                                    {sub.title}
                                    <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover/leaf:w-full" />
                                  </span>
                                </SmartLink>
                              ))
                            ) : (
                              <button
                                key={grp.name}
                                type="button"
                                onMouseEnter={(e) => {
                                  setActiveGroup(grp.name);
                                  // Align the side panel's top with this button.
                                  setGroupTop((e.currentTarget as HTMLButtonElement).offsetTop);
                                }}
                                onClick={(e) => {
                                  setActiveGroup(grp.name);
                                  setGroupTop((e.currentTarget as HTMLButtonElement).offsetTop);
                                }}
                                className={cn(
                                  'flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-jost-bold text-white transition duration-300 2xl:px-5 2xl:py-3 2xl:text-base',
                                  activeGroup === grp.name ? 'bg-white/15' : 'hover:bg-white/10',
                                )}
                              >
                                {/* Chevron points LEFT — the panel opens to the left. */}
                                <ChevronDown className="h-5 w-5 shrink-0  rotate-90 opacity-70" />
                                <span className="text-pretty">{grp.name}</span>
                              </button>
                              
                            ),
                          )}
                        </div>

                        {/* Side panel: floats to the LEFT of the group column with
                            a gap; width fits its links (min ~ 12rem, capped). */}
                        {groups.some((g) => g.name === activeGroup && g.name !== '') && (
                          <div
                            style={{ top: groupTop }}
                            className="absolute right-full z-10 mr-2 flex max-h-[min(72vh,34rem)] w-max min-w-[12rem] max-w-[min(60vw,20rem)] flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-2xl border border-white/22 bg-black/28 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.28)] ring-1 ring-white/12 backdrop-blur-2xl 2xl:p-3"
                          >
                            {groups
                              .find((g) => g.name === activeGroup)!
                              .items.map((sub) => (
                                <SmartLink
                                  key={sub.href + sub.title}
                                  href={sub.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="group/leaf block min-h-11 rounded-xl px-4 py-2.5 text-sm font-jost-bold whitespace-nowrap text-white transition duration-300 2xl:px-5 2xl:py-3 2xl:text-base"
                                >
                                  <span className="relative inline-block text-pretty">
                                    {sub.title}
                                    <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover/leaf:w-full" />
                                  </span>
                                </SmartLink>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="max-h-[min(70vh,32rem)] min-w-[220px] max-w-[min(82vw,340px)] overflow-y-auto overscroll-contain rounded-2xl border border-white/22 bg-black/28 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.28)] ring-1 ring-white/12 backdrop-blur-2xl 2xl:min-w-65 2xl:p-3">
                        {link.subLinks?.map((sub) => (
                          <SmartLink
                            key={sub.href + sub.title}
                            href={sub.href}
                            onClick={() => setActiveDropdown(null)}
                            className="group block min-h-11 rounded-xl px-4 py-2.5 text-sm font-jost-bold text-white transition duration-300 2xl:px-5 2xl:py-3 2xl:text-base"
                          >
                            <span className="relative inline-block text-pretty">
                              {sub.title}
                              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                            </span>
                          </SmartLink>
                        ))}
                      </div>
                    )}
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
            className="flex min-w-0 items-center rounded-md focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
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
              const mobileGroups = hasSubLinks ? groupSubLinks(link.subLinks ?? []) : null;

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
                      className="group flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-base font-jost-bold text-white transition duration-300 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                    >
                      <span className="relative inline-block min-w-0 text-pretty">
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
                    <SmartLink
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="group block min-h-11 min-w-0 rounded-lg px-4 py-3 text-base font-jost-bold text-white transition duration-300 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                    >
                      <span className="relative inline-block min-w-0 text-pretty">
                        {link.title}
                        <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                      </span>
                    </SmartLink>
                  ) : (
                    <span className="block min-h-11 rounded-lg px-4 py-3 text-base font-jost-bold text-white/80">
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
                          {mobileGroups
                            ? mobileGroups.map((grp) =>
                                grp.name === '' ? (
                                  // Ungrouped links render flat.
                                  grp.items.map((sub) => (
                                    <SmartLink
                                      key={sub.href + sub.title}
                                      href={sub.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="group block min-h-11 min-w-0 rounded-md px-3 py-2.5 text-sm font-jost-bold text-white/78 transition duration-300 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                                    >
                                      <span className="relative inline-block min-w-0 text-pretty">
                                        {sub.title}
                                        <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                                      </span>
                                    </SmartLink>
                                  ))
                                ) : (
                                  // Named group → nested accordion.
                                  (() => {
                                    const gKey = `${key}::${grp.name}`;
                                    const gOpen = expandedMobile[gKey] ?? false;
                                    return (
                                      <div key={gKey}>
                                        <button
                                          type="button"
                                          onClick={() => toggleMobileAccordion(gKey)}
                                          aria-expanded={gOpen}
                                          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm font-jost-bold text-white/90 transition duration-300 hover:text-white"
                                        >
                                          <span className="text-pretty">{grp.name}</span>
                                          <ChevronDown
                                            className={cn(
                                              'h-4 w-4 shrink-0 transition-transform duration-300',
                                              gOpen && 'rotate-180',
                                            )}
                                          />
                                        </button>
                                        <div
                                          className={cn(
                                            'grid transition-[grid-template-rows] duration-300 ease-out',
                                            gOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                                          )}
                                        >
                                          <div className="overflow-hidden">
                                            <div className="ml-3 border-l border-white/12 pl-3">
                                              {grp.items.map((sub) => (
                                                <SmartLink
                                                  key={sub.href + sub.title}
                                                  href={sub.href}
                                                  onClick={() => setMobileOpen(false)}
                                                  className="group block min-h-11 min-w-0 rounded-md px-3 py-2 text-sm font-jost-bold text-white/72 transition duration-300 hover:text-white"
                                                >
                                                  <span className="relative inline-block min-w-0 text-pretty">
                                                    {sub.title}
                                                    <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                                                  </span>
                                                </SmartLink>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()
                                ),
                              )
                            : link.subLinks?.map((sub) => (
                                <SmartLink
                                  key={sub.href + sub.title}
                                  href={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="group block min-h-11 min-w-0 rounded-md px-3 py-2.5 text-sm font-jost-bold text-white/78 transition duration-300 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                                >
                                  <span className="relative inline-block min-w-0 text-pretty">
                                    {sub.title}
                                    <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                                  </span>
                                </SmartLink>
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
