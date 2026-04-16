import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/require-admin';
import { getActiveHeroSlides, getAllHeroSlides, createHeroSlide } from '@/modules/home/actions';

export const runtime = 'nodejs';

// GET /api/hero-slides — Public (active) | Admin (?all=true → all slides)
export async function GET(req: NextRequest) {
  try {
    const showAll = req.nextUrl.searchParams.get('all') === 'true';

    if (showAll) {
      const session = await auth();
      const role = session?.user?.role;
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      const data = await getAllHeroSlides();
      return NextResponse.json({ success: true, data });
    }

    const data = await getActiveHeroSlides();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/hero-slides]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch hero slides' }, { status: 500 });
  }
}

// POST /api/hero-slides — Admin only: create slide
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();
    const result = await createHeroSlide(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/hero-slides]', error);
    return NextResponse.json({ success: false, error: 'Failed to create hero slide' }, { status: 500 });
  }
}
