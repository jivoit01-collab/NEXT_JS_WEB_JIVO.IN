'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useScroll } from '@/hooks';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toSrc } from '@/components/shared/image-upload';

export interface NavbarLink {
  id?: string;
  title: string;
  href: string;
}

interface NavbarProps {
  links?: NavbarLink[];
  /** Uploaded logo URL from admin → NavbarSetting. Falls back to site name text. */
  logoUrl?: string | null;
  /** Optional override for logo alt text. */
  logoAlt?: string | null;
}

// Fallback links — mirror the seeded DB rows (Products, Our Essence, Media, Community)
const DEFAULT_LINKS: NavbarLink[] = [
  { title: 'Products', href: '/products' },
  { title: 'Our Essence', href: '/our-essence' },
  { title: 'Media', href: '/media' },
  { title: 'Community', href: '/community' },
];

export function Navbar({
  links = DEFAULT_LINKS,
  logoUrl,
  logoAlt,
}: NavbarProps) {
  const scrolled = useScroll(40);
  const [open, setOpen] = useState(false);
  const altText = logoAlt?.trim() || SITE_NAME;

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        // Fully transparent — no solid background, just a soft blur for legibility on scroll.
        'bg-transparent',
        scrolled
          ? 'border-b border-white/10 backdrop-blur-xl backdrop-saturate-150'
          : 'backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:h-16 lg:px-12">
        {/* Logo — uploaded image if present, otherwise site-name text */}
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
            <span className="font-playfair text-xl font-jost-bold tracking-wide text-white lg:text-2xl">
              {altText}
            </span>
          )}
        </Link>

        {/* Desktop navigation — exact text from screenshot */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href + link.title}
              href={link.href}
              className="relative text-sm font-jost-medium tracking-wide text-white/85 transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:text-white hover:after:w-full"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex items-center text-white md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu — inline glass panel, no extra component */}
      <div
        className={cn(
          'overflow-hidden border-t border-white/10 backdrop-blur-xl backdrop-saturate-150 transition-[max-height,opacity] duration-300 md:hidden',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {links.map((link) => (
            <Link
              key={link.href + link.title}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-jost-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
