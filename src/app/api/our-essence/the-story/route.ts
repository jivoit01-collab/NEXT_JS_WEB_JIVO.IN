import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/** Public GET — returns all active sections for The Story page. */
export async function GET() {
  try {
    const sections = await prisma.ourEssenceTheStory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const data: Record<string, unknown> = {};
    for (const s of sections) {
      data[s.section] = s.content;
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[GET /api/our-essence/the-story]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load page data' },
      { status: 500 },
    );
  }
}
