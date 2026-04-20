import { Navbar, Footer } from '@/components/layout';
import { getNavbarSetting } from '@/modules/navbar';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const navSetting = await getNavbarSetting();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar logoUrl={navSetting.logoUrl} logoAlt={navSetting.logoAlt} />
      {children}
      <Footer />
    </div>
  );
}
