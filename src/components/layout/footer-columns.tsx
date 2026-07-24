'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { VisibleFooterColumnWithLinks } from '@/modules/footer/types';

/**
 * Footer link columns.
 *  - Mobile (< md): collapsible accordion — tap a header to expand its links.
 *  - md and up: a static multi-column grid (headers non-interactive, links shown).
 */
export function FooterColumns({ columns }: { columns: VisibleFooterColumnWithLinks[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-[#dcdbd0] md:grid md:h-full md:grid-cols-4 md:grid-rows-1 md:gap-x-5 md:divide-y-0 lg:gap-x-6 2xl:gap-x-7">
      {columns.map((column) => {
        const isOpen = openId === column.id;
        return (
          <div
            key={column.id}
            className="min-w-0 md:border-l md:border-[#d0cfc2] md:pl-5 md:first:border-l-0 md:first:pl-0 lg:pl-6 2xl:pl-7"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : column.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-2 py-4 text-left md:pointer-events-none md:py-0"
            >
              <h3 className="font-jost-bold text-[15px] tracking-[0.14em] text-[#1f3524] uppercase sm:text-base 2xl:text-lg">
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
                    className="group flex items-start gap-2 text-sm leading-snug text-[#586055] transition-colors duration-300 sm:text-[15px] 2xl:text-lg [@media(hover:hover)]:hover:text-[#111]"
                  >
                    <span className="mt-[1px] shrink-0 text-[#0a7d3f]" aria-hidden>
                      &gt;
                    </span>
                    {/* Block wrapper → the growing underline spans a consistent
                        width for every link, single- or multi-line. */}
                    <span className="relative min-w-0 flex-1 pb-1">
                      {link.title}
                      <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#0a7d3f] transition-all duration-300 [@media(hover:hover)]:group-hover:w-full" />
                    </span>
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
