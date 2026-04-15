import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { getFooterSetting, updateFooterSetting } from '@/modules/footer';

export const runtime = 'nodejs';

// GET /api/footer/settings — Public: returns the singleton settings row.
export async function GET() {
  try {
    const data = await getFooterSetting();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/footer/settings]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch footer settings' },
      { status: 500 },
    );
  }
}

// PUT /api/footer/settings — Admin: updates logo / contact / copyright.
export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();
    const result = await updateFooterSetting(body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/footer/settings]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update footer settings' },
      { status: 500 },
    );
  }
}
