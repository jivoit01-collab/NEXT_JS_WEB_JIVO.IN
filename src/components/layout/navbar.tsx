'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useScroll } from '@/hooks';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toSrc } from '@/components/shared/image-upload';
import { motion, AnimatePresence } from 'framer-motion';

type NavbarSubLink = {
  title: string;
  href: string;
};

type NavbarLink = {
  title: string;
  href: string;
  subLinks?: NavbarSubLink[];
};

const NAV_LINKS: NavbarLink[] = [
  {
    title: 'Products',
    href: '/our-products',
    subLinks: [
      { title: 'Cold Press Canola Oil', href: '/products/cold-press-canola-oil' },
      { title: 'Olive Oil', href: '/products/olive-oil' },
      { title: 'Mustard Oil', href: '/products/mustard-oil' },
      { title: 'Wheatgrass Drink', href: '/products/wheatgrass-drink' },
      { title: 'Pure Desi Ghee', href: '/products/pure-desi-ghee' },
    ],
  },
  {
    title: 'Our Essence',
    href: '/our-essence',
    subLinks: [
      { title: 'The Story', href: '/our-essence/the-story' },
      { title: 'Core Values', href: '/our-essence/core-values' },
    ],
  },
  { title: 'Media', href: '/media' },
  { title: 'Community', href: '/community' },
];

const HOME_LINK: NavbarLink = { title: 'Home', href: '/' };

export type NavbarProps = {
  logoUrl?: string | null;
  logoAlt?: string | null;
};

export function Navbar({ logoUrl, logoAlt }: NavbarProps) {
  const pathname = usePathname();
  const links = useMemo<NavbarLink[]>(
    () => (pathname === '/' ? NAV_LINKS : [HOME_LINK, ...NAV_LINKS]),
    [pathname],
  );
  const scrolled = useScroll(40);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
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

  // Clear any pending hover-close timer on unmount
  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const toggleMobileAccordion = (key: string) => {
    setExpandedMobile((prev) => (prev === key ? null : key));
  };

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-black/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:h-16 lg:px-12">

        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label={altText}>
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
            <span className="text-xl font-bold tracking-tight text-white lg:text-2xl">
              {altText}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
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
                    className="group flex items-center gap-1 text-[13px] font-medium tracking-wide text-white"
                  >
                    <span className="relative">
                      {link.title}
                      <span
                        className={cn(
                          'absolute -bottom-1 left-0 h-[1.5px] bg-white transition-all duration-300',
                          isActive ? 'w-full' : 'w-0 group-hover:w-full'
                        )}
                      />
                    </span>

                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-300',
                        isActive && 'rotate-180'
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-[13px] font-medium tracking-wide text-white"
                  >
                    <span className="relative">
                      {link.title}
                      <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                )}

                {/* DROPDOWN */}
                <AnimatePresence>
                  {hasSubLinks && isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full -left-6 z-50 pt-4"
                    >
                      <div className="min-w-[220px] rounded-2xl border border-white/40 bg-[#c0c0c0] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">

                        {link.subLinks?.map((sub) => (
                          <Link
                            key={sub.href + sub.title}
                            href={sub.href}
                            onClick={() => setActiveDropdown(null)}
                            className="group block px-4 py-2.5 text-sm font-semibold text-black"
                          >
                            <span className="relative inline-block">
                              {sub.title}
                              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
                            </span>
                          </Link>
                        ))}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/20 bg-zinc-950 backdrop-blur-3xl md:hidden"
          >
            <nav className="flex flex-col px-4 py-6">

              {links.map((link) => {
                const key = link.title;
                const hasSubLinks = (link.subLinks?.length ?? 0) > 0;
                const isExpanded = expandedMobile === key;

                return (
                  <div key={key}>
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="group flex-1 px-4 py-3 text-lg font-semibold text-white"
                      >
                        <span className="relative inline-block">
                          {link.title}
                          <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>

                      {hasSubLinks && (
                        <button
                          onClick={() => toggleMobileAccordion(key)}
                          className="p-4 text-white"
                        >
                          <ChevronDown
                            className={cn(
                              'h-5 w-5 transition-transform duration-300',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {hasSubLinks && (
                      <div
                        className={cn(
                          'grid transition-all duration-300',
                          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-4 rounded-xl bg-[#c0c0c0]">
                            {link.subLinks?.map((sub) => (
                              <Link
                                key={sub.href + sub.title}
                                href={sub.href}
                                onClick={() => setMobileOpen(false)}
                                className="group block px-6 py-3 text-sm font-bold text-black border-b border-black/5 last:border-0"
                              >
                                <span className="relative inline-block">
                                  {sub.title}
                                  <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
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

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}