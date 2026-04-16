'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useScroll } from '@/hooks';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toSrc } from '@/components/shared/image-upload';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────

export interface NavbarSubLink {
  id?: string;
  title: string;
  href: string;
}

export interface NavbarLink {
  id?: string;
  title: string;
  href: string;
  subLinks?: NavbarSubLink[];
}

interface NavbarProps {
  links?: NavbarLink[];
  /** Uploaded logo URL from admin → NavbarSetting. Falls back to site name text. */
  logoUrl?: string | null;
  /** Optional override for logo alt text. */
  logoAlt?: string | null;
}

// Fallback links — mirror the seeded DB rows
const DEFAULT_LINKS: NavbarLink[] = [
  { title: 'Our Essence', href: '/our-essence', subLinks: [] },
  { title: 'Our Products', href: '/products', subLinks: [] },
  { title: 'Jivo Media', href: '/media', subLinks: [] },
  { title: 'Community', href: '/community', subLinks: [] },
];

// ── Component ─────────────────────────────────────────────────

export function Navbar({ links = DEFAULT_LINKS, logoUrl, logoAlt }: NavbarProps) {
  const scrolled = useScroll(40);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const altText = logoAlt?.trim() || SITE_NAME;

  // Desktop hover state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = useCallback((key: string) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setActiveDropdown(key);
  }, []);

  const closeDropdown = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 250);
  }, []);

  const toggleMobileAccordion = (key: string) => {
    setExpandedMobile((prev) => (prev === key ? null : key));
  };

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        'bg-transparent',
        scrolled ? 'backdrop-blur-xl backdrop-saturate-150' : 'bg-transparent',
      )}
    >
      <div className="absolute -top-4 left-0 h-4 w-full" />
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:h-16 lg:px-12">
        {/* Logo */}
        <Link href="/" className="relative flex items-center" aria-label={altText}>
          {logoUrl ? (
            <Image
              src={toSrc(logoUrl)}
              alt={altText}
              width={120}
              height={40}
              priority
              className="h-7 w-auto object-contain lg:h-9"
            />
          ) : (
            <span className="font-playfair font-jost-bold text-xl tracking-wide text-white lg:text-2xl">
              {altText}
            </span>
          )}
        </Link>

        {/* ── Desktop navigation ─────────────────── */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const key = link.id || link.title;
            const hasSubLinks = link.subLinks && link.subLinks.length > 0;
            const isActive = activeDropdown === key;

            return (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => hasSubLinks && openDropdown(key)}
                onMouseLeave={closeDropdown}
              >
                <Link
                  href={link.href}
                  className={cn(
                    'font-jost-medium flex items-center gap-1 text-sm tracking-wide transition-colors duration-200',
                    isActive ? 'text-white' : 'text-white/85 hover:text-white',
                  )}
                >
                  {link.title}
                  {hasSubLinks && (
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-300',
                        isActive && 'rotate-180',
                      )}
                    />
                  )}
                </Link>

                {/* 🔥 DROPDOWN */}
                <AnimatePresence>
                  {hasSubLinks && isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute top-full left-0 z-50 pt-4"
                    >
                      {/* 🔥 HOVER GAP FIX AREA */}
                      <div className="absolute -top-4 left-0 h-4 w-full" />

                      {/* 🔺 Arrow */}
                      <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border bg-white/20 border-white/30 backdrop-blur-xl" />

                      {/* 🔥 GLASS DROPDOWN */}
                      <div className="rounded-xl border border-white/25 bg-black/40 backdrop-blur-2xl backdrop-saturate-150 shadow-2xl overflow-hidden w-max min-w-[200px]">
                        <div className="py-2">
                          {link.subLinks!.map((sub) => (
                            <Link
                              key={sub.id || sub.href + sub.title}
                              href={sub.href}
                              className="block px-5 py-2.5 text-sm whitespace-nowrap text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="flex items-center text-white md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* ── Mobile menu with accordion ───────────── */}
      <div
        className={cn(
          'overflow-hidden border-t border-white/10 backdrop-blur-xl backdrop-saturate-150 transition-[max-height,opacity] duration-300 md:hidden',
          mobileOpen ? 'max-h-[80vh] overflow-y-auto opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {links.map((link) => {
            const key = link.id || link.title;
            const hasSubLinks = link.subLinks && link.subLinks.length > 0;
            const isExpanded = expandedMobile === key;

            return (
              <div key={key}>
                {/* Top-level link row */}
                <div className="flex items-center">
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-jost-medium flex-1 rounded-lg px-3 py-2.5 text-base text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {link.title}
                  </Link>
                  {hasSubLinks && (
                    <button
                      type="button"
                      onClick={() => toggleMobileAccordion(key)}
                      className="rounded-lg p-2.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label={isExpanded ? 'Collapse sub-links' : 'Expand sub-links'}
                    >
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </button>
                  )}
                </div>

                {/* Accordion sub-links */}
                {hasSubLinks && (
                  <div
                    className={cn(
                      'overflow-hidden transition-[max-height,opacity] duration-200',
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                    )}
                  >
                    <div className="ml-4 border-l border-white/10 pb-2 pl-2">
                      {link.subLinks!.map((sub) => (
                        <Link
                          key={sub.id || sub.href + sub.title}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
