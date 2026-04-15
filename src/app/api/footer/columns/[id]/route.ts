import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { updateColumn, deleteColumn } from '@/modules/footer';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await req.json();
    const result = await updateColumn(id, body);
    if (!result.success) {
      const status = result.error === 'Column not found' ? 404 : 400;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/footer/columns/:id]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update column' },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const result = await deleteColumn(id);
    if (!result.success) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[DELETE /api/footer/columns/:id]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete column' },
      { status: 500 },
    );
  }
}
