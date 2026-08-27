import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { createLink, reorderLinks } from '@/modules/footer';

export const runtime = 'nodejs';

// PATCH /api/footer/links — Admin only. Bulk-reorder one column's links.
// Body: { columnId: string, orderedIds: string[] }
export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { columnId, orderedIds } = (await req.json()) as {
      columnId?: string;
      orderedIds?: string[];
    };
    if (!columnId || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: 'columnId and orderedIds are required' },
        { status: 400 },
      );
    }
    const result = await reorderLinks(columnId, orderedIds);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PATCH /api/footer/links]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder links' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();
    const result = await createLink(body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/footer/links]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create link' },
      { status: 500 },
    );
  }
}
