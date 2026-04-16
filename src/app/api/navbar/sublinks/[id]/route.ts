import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { updateNavSubLink, deleteNavSubLink } from '@/modules/navbar';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

// PUT /api/navbar/sublinks/:id — Admin only
export async function PUT(req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = await updateNavSubLink(id, body);
    if (!result.success) {
      const status = result.error === 'Sub-link not found' ? 404 : 400;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/navbar/sublinks/:id]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sub-link' },
      { status: 500 },
    );
  }
}

// DELETE /api/navbar/sublinks/:id — Admin only
export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const result = await deleteNavSubLink(id);
    if (!result.success) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[DELETE /api/navbar/sublinks/:id]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sub-link' },
      { status: 500 },
    );
  }
}
