'use client';

import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useCookieConsent } from '../hooks/use-cookie-consent';
import { PRIVACY_POLICY_HREF } from '../constants';

/**
 * First-visit cookie banner — fixed to the bottom, responsive, accessible.
 * Lightweight (no heavy deps); the detailed modal is lazy-loaded on "Customize".
 */
export function CookieBanner() {
  const { acceptAll, rejectAll } = useCookieConsent();

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-2xl border border-black/10 bg-white/95 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-5 lg:flex-row lg:items-center lg:gap-6 dark:border-white/10 dark:bg-[#151915]/95">
        <div className="flex items-start gap-3 lg:flex-1">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0a7d3f]/10 text-[#0a7d3f]"
          >
            <Cookie className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-jost-bold text-sm text-[#1f3524] sm:text-base dark:text-white">
              We value your privacy
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#586055] sm:text-sm dark:text-white/70">
              We use cookies to run the site, analyse traffic and improve your experience. You can
              accept all or reject non-essential cookies. Read our{' '}
              <Link
                href={PRIVACY_POLICY_HREF}
                className="font-jost-medium text-[#0a7d3f] underline underline-offset-2 hover:text-[#0c6f39]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0 lg:justify-end">
          <button
            type="button"
            onClick={rejectAll}
            className="min-h-11 rounded-xl border border-black/15 px-4 py-2.5 text-sm font-jost-medium text-[#3a423a] transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none dark:border-white/20 dark:text-white/85 dark:hover:bg-white/10"
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="min-h-11 rounded-xl bg-[#0a7d3f] px-5 py-2.5 text-sm font-jost-medium text-white shadow-[0_10px_24px_rgba(10,125,63,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#0c6f39] focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
