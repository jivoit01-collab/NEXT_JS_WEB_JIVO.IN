import type { Metadata } from 'next';
import { AdminProviders } from '@/providers/admin-providers';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Jivo Admin',
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
