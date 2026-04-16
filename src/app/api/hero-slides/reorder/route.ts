import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { reorderHeroSlides } from '@/modules/home/actions';

export const runtime = 'nodejs';

// PUT /api/hero-slides/reorder — Admin only: bulk reorder
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids array is required' }, { status: 400 });
    }
    const result = await reorderHeroSlides(ids);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/hero-slides/reorder]', error);
    return NextResponse.json({ success: false, error: 'Failed to reorder slides' }, { status: 500 });
  }
}
