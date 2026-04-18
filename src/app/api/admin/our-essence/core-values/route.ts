import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/** Admin GET — returns ALL sections (including inactive). */
export async function GET() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sections = await prisma.ourEssenceCoreValues.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const data: Record<string, unknown> = {};
    for (const s of sections) {
      data[s.section] = s.content;
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[GET /api/admin/our-essence/core-values]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load sections' },
      { status: 500 },
    );
  }
}

/** Admin POST — upsert a section by key. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { section, content } = await req.json();

    if (!section || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing section or content' },
        { status: 400 },
      );
    }

    const result = await prisma.ourEssenceCoreValues.upsert({
      where: { section },
      update: { content, updatedAt: new Date() },
      create: { section, content },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[POST /api/admin/our-essence/core-values]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to save section' },
      { status: 500 },
    );
  }
}
