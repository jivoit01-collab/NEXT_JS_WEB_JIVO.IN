'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Lock, X } from 'lucide-react';
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
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0a7d3f]/10 px-3 py-1 text-xs font-jost-medium text-[#0a7d3f]">
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
 * Cookie preferences — a compact card that opens IN PLACE of the banner (same
 * bottom corner), not a centered dialog. Accessible without Radix: role="dialog"
 * + aria-modal, ESC to close, initial focus, and a focus trap. Accept / Reject
 * live on the banner; here you fine-tune and Save. Lazy-loaded by the provider.
 */
export function CookiePreferencesModal() {
  const { preferencesOpen, closePreferences, isAllowed, updatePreferences } = useCookieConsent();
  const panelRef = useRef<HTMLDivElement>(null);

  const [prefs, setPrefs] = useState<CategoryPreferences>({
    ANALYTICS: isAllowed('ANALYTICS'),
    MARKETING: isAllowed('MARKETING'),
    PREFERENCES: isAllowed('PREFERENCES'),
  });

  const setCategory = (category: ConsentCategory, value: boolean) => {
    if (category === 'NECESSARY') return;
    setPrefs((prev) => ({ ...prev, [category]: value }));
  };

  // ESC to close + focus trap + initial focus (Radix-free accessibility).
  useEffect(() => {
    if (!preferencesOpen) return;
    const panel = panelRef.current;

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreferences();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    focusables()[0]?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [preferencesOpen, closePreferences]);

  if (!preferencesOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-prefs-title"
      aria-describedby="cookie-prefs-desc"
      className="fixed inset-x-0 bottom-0 z-[85] p-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:p-0"
    >
      <div
        ref={panelRef}
        className="mx-auto flex max-h-[85dvh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/95 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md dark:border-white/10 dark:bg-[#151915]/95"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <div className="min-w-0">
            <p
              id="cookie-prefs-title"
              className="font-jost-bold text-base text-[#1f3524] dark:text-white"
            >
              Cookie Settings
            </p>
            <p
              id="cookie-prefs-desc"
              className="mt-1 text-xs leading-relaxed text-[#586055] sm:text-sm dark:text-white/70"
            >
              Choose which cookies you allow. Necessary cookies are always on.
            </p>
          </div>
          <button
            type="button"
            onClick={closePreferences}
            aria-label="Close cookie settings"
            className="text-[#586055] shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none dark:text-white/60 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2.5 overflow-y-auto px-5 pb-1">
          {CATEGORY_ORDER.map((category) => {
            const meta = CATEGORY_META[category];
            const checked = meta.locked ? true : prefs[category as keyof CategoryPreferences];
            return (
              <div
                key={category}
                className="rounded-xl border border-black/10 bg-black/[0.02] p-3.5 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-4">
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
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4">
          <button
            type="button"
            onClick={() => updatePreferences(prefs)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0a7d3f] px-5 py-2.5 text-sm font-jost-medium text-white shadow-[0_10px_24px_rgba(10,125,63,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#0c6f39] focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Check className="h-4 w-4" aria-hidden="true" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
