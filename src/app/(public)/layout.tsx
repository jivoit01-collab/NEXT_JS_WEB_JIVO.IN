import { Suspense } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { PublicRuntimeLoader } from '@/components/shared/public-runtime-loader';
import { SmoothScrollProvider } from '@/components/shared/smooth-scroll-provider';
import { CookieProvider } from '@/modules/core/cookie-consent';
import { TrackingProvider } from '@/modules/core/tracking';
import { AuthProvider } from '@/modules/platform/auth';
import { getNavbarSetting, getVisibleNavLinks } from '@/modules/navbar';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [navSetting, navLinks] = await Promise.all([getNavbarSetting(), getVisibleNavLinks()]);

  const links = navLinks.map((link) => ({
    title: link.title,
    href: link.href,
    subLinks: link.subLinks.map((sub) => ({ title: sub.title, href: sub.href })),
  }));

  const fixedLinks = links.map((link) => ({
    ...link,
    href: link.href ?? undefined,

    subLinks: link.subLinks
      ?.filter((sub) => sub.href)
      .map((sub) => ({
        title: sub.title,
        href: sub.href as string,
      })),
  }));

  return (
    // CookieProvider wraps everything (global consent context, no prop drilling).
    // Its banner/modal render OUTSIDE the smooth wrapper so `fixed` positioning works.
    // AuthProvider (SessionProvider + auth↔platform bridge) wraps everything so
    // any page can read the session and logins trigger the visitor merge.
    <AuthProvider>
    <CookieProvider>
      {/* TrackingProvider (inside CookieProvider so it reads consent) enables the
          Universal Visitor Tracking Engine the moment ANALYTICS consent is granted. */}
      <TrackingProvider>
        {/* Navbar stays OUTSIDE the smooth wrapper so its `fixed` positioning works. */}
        <Navbar logoUrl={navSetting.logoUrl} logoAlt={navSetting.logoAlt} links={fixedLinks} />
        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            {children}
            {/* Feedback now lives in the reusable FeedbackDialog (opened from the footer CTA). */}
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </div>
        </SmoothScrollProvider>
        <PublicRuntimeLoader />
      </TrackingProvider>
    </CookieProvider>
    </AuthProvider>
  );
}
