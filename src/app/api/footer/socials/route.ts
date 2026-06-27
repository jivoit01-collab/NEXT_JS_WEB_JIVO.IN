import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { createSocialLink } from '@/modules/footer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();
    const result = await createSocialLink(body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/footer/socials]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create social link' },
      { status: 500 },
    );
  }
}
