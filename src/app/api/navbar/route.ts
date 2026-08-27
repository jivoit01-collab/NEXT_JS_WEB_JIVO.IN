import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/require-admin';
import {
  getVisibleNavLinks,
  getAllNavLinks,
  createNavLink,
  reorderNavLinks,
} from '@/modules/navbar/actions';

export const runtime = 'nodejs';

// PATCH /api/navbar — Admin only. Bulk-reorder the top-level nav links.
// Body: { orderedIds: string[] }
export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { orderedIds } = (await req.json()) as { orderedIds?: string[] };
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: 'orderedIds is required' },
        { status: 400 },
      );
    }
    const result = await reorderNavLinks(orderedIds);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PATCH /api/navbar]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder nav links' },
      { status: 500 },
    );
  }
}

// GET /api/navbar — Public (visible) | Admin (?all=true → everything)
export async function GET(req: NextRequest) {
  try {
    const showAll = req.nextUrl.searchParams.get('all') === 'true';

    if (showAll) {
      const session = await auth();
      const role = session?.user?.role;
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 },
        );
      }
      const data = await getAllNavLinks();
      return NextResponse.json({ success: true, data });
    }

    const data = await getVisibleNavLinks();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/navbar]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch nav links' },
      { status: 500 },
    );
  }
}

// POST /api/navbar — Admin only
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();
    const result = await createNavLink(body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/navbar]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create nav link' },
      { status: 500 },
    );
  }
}
