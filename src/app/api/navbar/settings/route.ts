import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import {
  getNavbarSetting,
  updateNavbarSetting,
} from '@/modules/navbar/actions';

export const runtime = 'nodejs';

// GET /api/navbar/settings — Public (logo URL is part of the brand)
export async function GET() {
  try {
    const data = await getNavbarSetting();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/navbar/settings]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navbar settings' },
      { status: 500 },
    );
  }
}

// PUT /api/navbar/settings — Admin only (upserts the singleton row)
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();
    const result = await updateNavbarSetting(body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/navbar/settings]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update navbar settings' },
      { status: 500 },
    );
  }
}
