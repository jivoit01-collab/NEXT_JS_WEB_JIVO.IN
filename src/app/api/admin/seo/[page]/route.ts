import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { getSeoByPage } from '@/modules/seo/data/queries';
import {
  updateSeoMetaAction,
  deleteSeoMetaAction,
} from '@/modules/seo/actions';

export const runtime = 'nodejs';

// GET /api/admin/seo/[page] — single SEO row by page key
export async function GET(_req: NextRequest, context: { params: Promise<{ page: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { page } = await context.params;
    const data = await getSeoByPage(page);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/admin/seo/[page]]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO' },
      { status: 500 },
    );
  }
}

// PUT /api/admin/seo/[page] — upsert SEO for a page
export async function PUT(req: NextRequest, context: { params: Promise<{ page: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { page } = await context.params;
    const body = await req.json();
    const result = await updateSeoMetaAction(page, body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/admin/seo/[page]]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save SEO' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/seo/[page] — remove SEO row (falls back to defaults)
export async function DELETE(_req: NextRequest, context: { params: Promise<{ page: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { page } = await context.params;
    const result = await deleteSeoMetaAction(page);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[DELETE /api/admin/seo/[page]]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete SEO' },
      { status: 500 },
    );
  }
}
