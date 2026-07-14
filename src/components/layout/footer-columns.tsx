'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { VisibleFooterColumnWithLinks } from '@/modules/footer/types';

/** Text with the shared green growing-underline hover effect. */
function HoverUnderlineText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative transition-colors duration-300 [@media(hover:hover)]:group-hover:text-[#111]">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-[#0a7d3f] transition-all duration-300 [@media(hover:hover)]:group-hover:w-full" />
    </span>
  );
}

/**
 * Footer link columns.
 *  - Mobile (< md): collapsible accordion — tap a header to expand its links.
 *  - md and up: a static multi-column grid (headers non-interactive, links shown).
 */
export function FooterColumns({ columns }: { columns: VisibleFooterColumnWithLinks[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-[#dcdbd0] md:grid md:grid-cols-4 md:gap-x-4 md:divide-y-0 lg:gap-x-5 2xl:gap-x-6">
      {columns.map((column) => {
        const isOpen = openId === column.id;
        return (
          <div
            key={column.id}
            className="min-w-0 md:border-l md:border-[#dcdbd0] md:pl-4 md:first:border-l-0 md:first:pl-0 lg:pl-5 2xl:pl-6"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : column.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-2 py-4 text-left md:pointer-events-none md:py-0"
            >
              <h3 className="font-jost-bold text-sm tracking-[0.14em] text-[#1f3524] uppercase sm:text-[15px] 2xl:text-base">
                {column.title}
              </h3>
              <ChevronDown
                aria-hidden
                className={`h-5 w-5 shrink-0 text-[#586055] transition-transform duration-300 md:hidden ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <ul
              className={`space-y-3 pb-4 sm:space-y-3.5 md:mt-5 md:block md:pb-0 2xl:space-y-4 ${
                isOpen ? 'block' : 'hidden'
              }`}
            >
              {column.links.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-start gap-2 text-[13px] leading-snug text-[#586055] transition-colors duration-300 sm:text-sm 2xl:text-base"
                  >
                    <span className="mt-[1px] shrink-0 text-[#0a7d3f]" aria-hidden>
                      &gt;
                    </span>
                    <HoverUnderlineText>{link.title}</HoverUnderlineText>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
