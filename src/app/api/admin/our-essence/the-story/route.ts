import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/** Admin GET — returns ALL sections (including inactive). */
export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const sections = await prisma.ourEssenceTheStory.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const data: Record<string, unknown> = {};
    for (const s of sections) {
      data[s.section] = s.content;
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[GET /api/admin/our-essence/the-story]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load sections' },
      { status: 500 },
    );
  }
}

/** Admin POST — upsert a section by key. */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { section, content } = await req.json();

    if (!section || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing section or content' },
        { status: 400 },
      );
    }

    const result = await prisma.ourEssenceTheStory.upsert({
      where: { section },
      update: { content, updatedAt: new Date() },
      create: { section, content },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[POST /api/admin/our-essence/the-story]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to save section' },
      { status: 500 },
    );
  }
}
