'use client';

import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCookieConsent } from '../hooks/use-cookie-consent';
import { CATEGORY_META, CATEGORY_ORDER, type ConsentCategory } from '../constants';
import type { CategoryPreferences } from '../types';

/** Accessible toggle (role="switch"). Locked categories render as a disabled "on" pill. */
function CategoryToggle({
  checked,
  locked,
  label,
  onChange,
}: {
  checked: boolean;
  locked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  if (locked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a7d3f]/10 px-3 py-1 text-xs font-jost-medium text-[#0a7d3f]">
        <Lock className="h-3 w-3" aria-hidden="true" /> Always on
      </span>
    );
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Toggle ${label}`}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:ring-offset-2 focus-visible:outline-none ${
        checked ? 'bg-[#0a7d3f]' : 'bg-neutral-300 dark:bg-neutral-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/**
 * Cookie preferences modal — built on the Radix Dialog which provides the
 * focus trap, ESC-to-close, scroll-lock and ARIA wiring out of the box.
 * Lazy-loaded by the provider (only imported when opened).
 */
export function CookiePreferencesModal() {
  const { preferencesOpen, closePreferences, isAllowed, acceptAll, rejectAll, updatePreferences } =
    useCookieConsent();

  const [prefs, setPrefs] = useState<CategoryPreferences>({
    ANALYTICS: isAllowed('ANALYTICS'),
    MARKETING: isAllowed('MARKETING'),
    PREFERENCES: isAllowed('PREFERENCES'),
  });

  const setCategory = (category: ConsentCategory, value: boolean) => {
    if (category === 'NECESSARY') return;
    setPrefs((prev) => ({ ...prev, [category]: value }));
  };

  return (
    <Dialog open={preferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-5 py-4 text-left sm:px-6">
          <DialogTitle className="font-jost-bold text-lg text-[#1f3524] dark:text-white">
            Cookie Preferences
          </DialogTitle>
          <DialogDescription className="text-sm text-[#586055] dark:text-white/70">
            Choose which cookies you allow.
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-y px-5 sm:px-6">
          {CATEGORY_ORDER.map((category) => {
            const meta = CATEGORY_META[category];
            const checked = meta.locked ? true : prefs[category as keyof CategoryPreferences];
            return (
              <li key={category} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-jost-medium text-sm text-[#1f3524] dark:text-white">
                    {meta.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#586055] dark:text-white/65">
                    {meta.description}
                  </p>
                </div>
                <div className="pt-0.5">
                  <CategoryToggle
                    checked={checked}
                    locked={meta.locked}
                    label={meta.label}
                    onChange={(next) => setCategory(category, next)}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <DialogFooter className="gap-2 border-t px-5 py-4 sm:px-6">
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
            className="min-h-11 rounded-xl border border-black/15 px-4 py-2.5 text-sm font-jost-medium text-[#3a423a] transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none dark:border-white/20 dark:text-white/85 dark:hover:bg-white/10"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => updatePreferences(prefs)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0a7d3f] px-5 py-2.5 text-sm font-jost-medium text-white shadow-[0_10px_24px_rgba(10,125,63,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#0c6f39] focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Check className="h-4 w-4" aria-hidden="true" /> Save Preferences
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
