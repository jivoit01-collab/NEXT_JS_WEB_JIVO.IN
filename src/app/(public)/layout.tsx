import { Navbar, Footer } from '@/components/layout';
import { getVisibleNavLinks, getNavbarSetting } from '@/modules/navbar';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [navLinks, navSetting] = await Promise.all([
    getVisibleNavLinks(),
    getNavbarSetting(),
  ]);

  const links = navLinks.map((l) => ({
    id: l.id,
    title: l.title,
    href: l.href,
    subLinks:
      l.subLinks?.map((s) => ({
        id: s.id,
        title: s.title,
        href: s.href,
      })) ?? [],
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        links={links.length > 0 ? links : undefined}
        logoUrl={navSetting.logoUrl}
        logoAlt={navSetting.logoAlt}
      />
      {children}
      <Footer />
    </div>
  );
}
