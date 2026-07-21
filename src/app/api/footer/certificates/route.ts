import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { createCertificate } from '@/modules/footer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();
    const result = await createCertificate(body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/footer/certificates]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create certificate' },
      { status: 500 },
    );
  }
}
