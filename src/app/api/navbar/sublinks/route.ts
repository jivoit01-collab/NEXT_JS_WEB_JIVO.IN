import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { createNavSubLink, reorderNavSubLinks } from '@/modules/navbar';

export const runtime = 'nodejs';

// PATCH /api/navbar/sublinks — Admin only. Bulk-reorder one parent's sub-links.
// Body: { navLinkId: string, orderedIds: string[] }
export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { navLinkId, orderedIds } = (await req.json()) as {
      navLinkId?: string;
      orderedIds?: string[];
    };
    if (!navLinkId || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: 'navLinkId and orderedIds are required' },
        { status: 400 },
      );
    }
    const result = await reorderNavSubLinks(navLinkId, orderedIds);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PATCH /api/navbar/sublinks]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder sub-links' },
      { status: 500 },
    );
  }
}

// POST /api/navbar/sublinks — Admin only
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();
    const result = await createNavSubLink(body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/navbar/sublinks]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sub-link' },
      { status: 500 },
    );
  }
}
