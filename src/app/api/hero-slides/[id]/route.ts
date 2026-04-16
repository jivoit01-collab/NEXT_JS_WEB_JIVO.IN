import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { updateHeroSlide, deleteHeroSlide } from '@/modules/home/actions';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

// PUT /api/hero-slides/:id — Admin only
export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = await updateHeroSlide(id, body);
    if (!result.success) {
      const status = result.error === 'Slide not found' ? 404 : 400;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/hero-slides/:id]', error);
    return NextResponse.json({ success: false, error: 'Failed to update hero slide' }, { status: 500 });
  }
}

// DELETE /api/hero-slides/:id — Admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const result = await deleteHeroSlide(id);
    if (!result.success) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[DELETE /api/hero-slides/:id]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete hero slide' }, { status: 500 });
  }
}
