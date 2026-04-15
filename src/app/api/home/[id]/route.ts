import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import {
  getHomePageSection,
  updateHomePageSection,
  deleteHomePageSection,
} from '@/modules/home/actions';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

// GET /api/home/:id — Admin only
export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const result = await getHomePageSection(id);
    if (!result.success) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/home/:id]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch home section' },
      { status: 500 },
    );
  }
}

// PUT /api/home/:id — Admin only
export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = await updateHomePageSection(id, body);
    if (!result.success) {
      const status = result.error === 'Section not found' ? 404 : 400;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/home/:id]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update home section' },
      { status: 500 },
    );
  }
}

// DELETE /api/home/:id — Admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const result = await deleteHomePageSection(id);
    if (!result.success) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[DELETE /api/home/:id]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete home section' },
      { status: 500 },
    );
  }
}
