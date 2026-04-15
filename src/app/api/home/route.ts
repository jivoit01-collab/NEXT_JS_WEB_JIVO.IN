import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/require-admin';
import {
  getHomePageSections,
  getAllHomePageSections,
  createHomePageSection,
} from '@/modules/home/actions';

// Force Node runtime — Prisma client needs it
export const runtime = 'nodejs';

// GET /api/home — Public (active) | Admin (?all=true → all sections)
export async function GET(req: NextRequest) {
  try {
    const showAll = req.nextUrl.searchParams.get('all') === 'true';

    if (showAll) {
      // Admin-only: list inactive too
      const session = await auth();
      const role = session?.user?.role;
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 },
        );
      }
      const data = await getAllHomePageSections();
      return NextResponse.json({ success: true, data });
    }

    const data = await getHomePageSections();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/home]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch home sections' },
      { status: 500 },
    );
  }
}

// POST /api/home — Admin only: create section
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();
    const result = await createHomePageSection(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/home]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create home section' },
      { status: 500 },
    );
  }
}
