'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { resolveCtaLink } from '@/lib/cta-link';

// A stable no-op subscription — the hostname never changes during a session, so
// the store never needs to notify. useSyncExternalStore gives us an SSR-safe
// value: the SERVER snapshot is `undefined` (env-only classification, matching
// the server-rendered markup), and the CLIENT snapshot is the live hostname.
const subscribe = () => () => {};
const getClientHost = () =>
  typeof window !== 'undefined' ? window.location.hostname : undefined;
const getServerHost = () => undefined;

type SmartLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  /** Admin-entered or code href. May be a path, a bare domain, or a full URL. */
  href: string | null | undefined;
  /** Where an empty href resolves to (default "/"). */
  fallback?: string;
  children: React.ReactNode;
};

/**
 * One link component that decides SAME-TAB vs NEW-TAB from the URL.
 *
 * Classification lives in `resolveCtaLink` (single source of truth):
 *   - internal paths, fragments, and full URLs on OUR OWN host  → next/link,
 *     same tab (client-side navigation)
 *   - external hosts (shop.jivo.in, amazon.com, …), bare domains → raw <a> with
 *     target="_blank" rel="noopener noreferrer", new tab
 *   - mailto:/tel:/sms: → raw <a>, no new tab (avoids a blank tab)
 *
 * "Our own host" = the configured NEXT_PUBLIC_APP_URL host (+ localhost) AND,
 * once mounted in the browser, the ACTUAL current hostname — so the site
 * auto-detects whatever domain it is served on (jivo.in, abc.jivo.in, a preview
 * URL) without per-deploy env config.
 *
 * Hydration safety: the FIRST render (server + first client paint) always uses
 * the env-only classification, so server and client markup match exactly. After
 * mount we re-run classification with the live hostname available and update if
 * the verdict changed. This avoids a hydration mismatch while still honouring
 * the current domain.
 */
export function SmartLink({ href, fallback = '/', children, ...rest }: SmartLinkProps) {
  // Server + first client render → `undefined` (env-only classification, so the
  // markup matches and there's no hydration mismatch). After hydration the store
  // yields the live hostname, re-classifying own-domain links to same-tab.
  const currentHost = useSyncExternalStore(subscribe, getClientHost, getServerHost);

  const { href: resolved, isExternal } = resolveCtaLink(href, fallback, currentHost);

  if (isExternal) {
    return (
      <a href={resolved} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  // mailto:/tel:/sms: are internal-classified but are not valid next/link routes
  // — render them as a plain <a> (same tab, no target) so the app link works.
  if (/^(mailto:|tel:|sms:)/i.test(resolved)) {
    return (
      <a href={resolved} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={resolved} {...rest}>
      {children}
    </Link>
  );
}
