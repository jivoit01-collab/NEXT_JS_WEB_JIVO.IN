import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { createNavSubLink } from '@/modules/navbar';

export const runtime = 'nodejs';

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
