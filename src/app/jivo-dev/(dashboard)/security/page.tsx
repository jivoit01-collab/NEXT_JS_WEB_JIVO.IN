import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSecurityOverview } from '@/lib/admin-security-store';
import { SecurityLogView } from './security-log-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Login Security',
  robots: { index: false, follow: false },
};

/**
 * Admin security log — failed admin login attempts and permanently blocked IPs.
 *
 * Reads `.data/admin-login-attempts.json` on the server and passes a plain
 * serializable snapshot to the client view, so the client bundle never imports
 * the store module (which pulls in node:fs).
 */
export default async function AdminSecurityPage() {
  const session = await auth();
  const role = session?.user?.role;

  // The proxy already gates /jivo-dev, but this page exposes captured
  // credentials — re-check here so it can never be reached by a stale session.
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    redirect('/jivo-dev/login');
  }

  const overview = await getSecurityOverview();

  return <SecurityLogView overview={overview} />;
}
