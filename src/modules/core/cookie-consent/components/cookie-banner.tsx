'use client';

import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useCookieConsent } from '../hooks/use-cookie-consent';
import { PRIVACY_POLICY_HREF } from '../constants';

/**
 * First-visit cookie banner — a compact bottom card (full-width on mobile,
 * a corner card on larger screens). Lightweight & accessible; the detailed
 * modal is lazy-loaded on "Customize Preferences".
 */
export function CookieBanner() {
  const { acceptAll, rejectAll, openPreferences } = useCookieConsent();

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:p-0"
    >
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-black/10 bg-white/95 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md dark:border-white/10 dark:bg-[#151915]/95">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0a7d3f]/10 text-[#0a7d3f]"
          >
            <Cookie className="h-4 w-4" />
          </span>
          <p className="font-jost-bold text-sm text-[#1f3524] sm:text-base dark:text-white">
            Cookie Settings
          </p>
        </div>

        <p className="mt-2.5 text-xs leading-relaxed text-[#586055] sm:text-sm dark:text-white/70">
          We use cookies to run the site, analyse traffic and improve your experience. Read our{' '}
          <Link
            href={PRIVACY_POLICY_HREF}
            className="font-jost-medium text-[#0a7d3f] underline underline-offset-2 hover:text-[#0c6f39]"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="mt-4 space-y-2">
          {/* Row 1 — secondary actions, matched styling */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={rejectAll}
              className="min-h-10 rounded-xl border border-black/15 px-3 py-2 text-sm font-jost-medium text-[#3a423a] transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none dark:border-white/20 dark:text-white/85 dark:hover:bg-white/10"
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              onClick={openPreferences}
              className="min-h-10 rounded-xl border border-black/15 px-3 py-2 text-sm font-jost-medium text-[#3a423a] transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none dark:border-white/20 dark:text-white/85 dark:hover:bg-white/10"
            >
              Customize Preferences
            </button>
          </div>

          {/* Preferred action — full width */}
          <button
            type="button"
            onClick={acceptAll}
            className="min-h-11 w-full rounded-xl bg-[#0a7d3f] px-5 py-2.5 text-sm font-jost-medium text-white shadow-[0_10px_24px_rgba(10,125,63,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#0c6f39] focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
