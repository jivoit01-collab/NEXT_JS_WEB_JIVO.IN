import { Navbar, Footer } from '@/components/layout';
import { getNavbarSetting, getVisibleNavLinks } from '@/modules/navbar';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [navSetting, navLinks] = await Promise.all([
    getNavbarSetting(),
    getVisibleNavLinks(),
  ]);

  const links = navLinks.map((link) => ({
    title: link.title,
    href: link.href,
    subLinks: link.subLinks.map((sub) => ({ title: sub.title, href: sub.href })),
  }));

  const fixedLinks = links.map(link => ({
  ...link,
  href: link.href ?? undefined,

  subLinks: link.subLinks
    ?.filter(sub => sub.href)  
    .map(sub => ({
      title: sub.title,
      href: sub.href as string  
    }))
}));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        logoUrl={navSetting.logoUrl}
        logoAlt={navSetting.logoAlt}
        links={fixedLinks}
      />
      {children}
      <Footer />
    </div>
  );
}
