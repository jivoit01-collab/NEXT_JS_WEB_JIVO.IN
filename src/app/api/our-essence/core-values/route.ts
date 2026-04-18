import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/** Public GET — returns all active sections for the Core Values page. */
export async function GET() {
  try {
    const sections = await prisma.ourEssenceCoreValues.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const data: Record<string, unknown> = {};
    for (const s of sections) {
      data[s.section] = s.content;
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[GET /api/our-essence/core-values]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load page data' },
      { status: 500 },
    );
  }
}
