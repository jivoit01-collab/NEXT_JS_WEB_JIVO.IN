import { NextResponse } from 'next/server';
import {
  getVisibleFooter,
  getAllColumns,
  getAllSocialLinks,
  getAllCertificates,
} from '@/modules/footer';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
// DB-backed CMS endpoint — always read live data (never statically cache the response).
export const dynamic = 'force-dynamic';

// GET /api/footer — Public: visible columns + links + setting + socials + certificates.
// Admin (?all=true): every column/link/social/certificate, including hidden.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const showAll = url.searchParams.get('all') === 'true';

    if (showAll) {
      const session = await auth();
      const role = session?.user?.role;
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      const [columns, socials, certificates] = await Promise.all([
        getAllColumns(),
        getAllSocialLinks(),
        getAllCertificates(),
      ]);
      return NextResponse.json({ success: true, data: { columns, socials, certificates } });
    }

    const data = await getVisibleFooter();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/footer]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch footer' },
      { status: 500 },
    );
  }
}
