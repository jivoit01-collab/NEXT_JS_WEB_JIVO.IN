import { Suspense } from 'react';
import { Navbar, Footer } from '@/components/layout';
import { PublicRuntimeLoader } from '@/components/shared/public-runtime-loader';
import { SmoothScrollProvider } from '@/components/shared/smooth-scroll-provider';
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
    <>
      {/* Navbar stays OUTSIDE the smooth wrapper so its `fixed` positioning works. */}
      <Navbar logoUrl={navSetting.logoUrl} logoAlt={navSetting.logoAlt} links={fixedLinks} />
      <SmoothScrollProvider>
        <div className="flex min-h-screen flex-col">
          {children}
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
      </SmoothScrollProvider>
      <PublicRuntimeLoader />
    </>
  );
}
