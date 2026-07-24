'use client';

import { Cookie } from 'lucide-react';
import { useCookieConsent } from '../hooks/use-cookie-consent';

/**
 * Re-open the cookie preferences at any time (e.g. from the footer).
 * `variant="link"` renders as an inline text link; default renders a subtle button.
 */
export function CookieSettingsButton({
  className,
  variant = 'link',
  label = 'Cookie Settings',
}: {
  className?: string;
  variant?: 'link' | 'button';
  label?: string;
}) {
  const { openPreferences } = useCookieConsent();

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={openPreferences}
        className={
          className ??
          'inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-black/15 px-3 py-1.5 text-xs font-jost-medium text-[#3a423a] transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none'
        }
      >
        <Cookie className="h-3.5 w-3.5" aria-hidden="true" /> {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openPreferences}
      className={
        className ??
        'group inline-flex items-center gap-1.5 text-xs text-[#586055] transition-colors hover:text-[#111] focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none sm:text-sm'
      }
    >
      <Cookie className="h-3.5 w-3.5 text-[#0a7d3f]" aria-hidden="true" />
      {label}
    </button>
  );
}
