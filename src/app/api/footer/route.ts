import { NextResponse } from 'next/server';
import { getVisibleFooter, getAllColumns } from '@/modules/footer';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/footer — Public: visible columns + visible links + setting.
// Admin (?all=true): every column + every link, including hidden.
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
      const columns = await getAllColumns();
      return NextResponse.json({ success: true, data: { columns } });
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
