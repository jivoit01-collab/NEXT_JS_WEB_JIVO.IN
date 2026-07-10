import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import {
  defaultSections,
  getAllMilestonesTimelineSections,
  upsertMilestonesTimelineSectionAction,
} from '@/modules/our-essence/milestones-timeline';
import type {
  MilestonesTimelineSectionKey,
  MilestonesTimelineVideoContent,
} from '@/modules/our-essence/milestones-timeline';

export const runtime = 'nodejs';

const SECTION_KEYS: MilestonesTimelineSectionKey[] = ['video'];

type MilestonesTimelineApiData = {
  video: MilestonesTimelineVideoContent;
};

function isSectionKey(value: string): value is MilestonesTimelineSectionKey {
  return SECTION_KEYS.includes(value as MilestonesTimelineSectionKey);
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const sections = await getAllMilestonesTimelineSections();
    const data: MilestonesTimelineApiData = {
      video: { ...defaultSections.video },
    };

    for (const section of sections) {
      if (!isSectionKey(section.section)) continue;
      data.video = {
        ...data.video,
        ...(section.content as Partial<MilestonesTimelineVideoContent>),
      };
    }

    return NextResponse.json({ success: true, data, rows: sections });
  } catch (error) {
    console.error('[GET /api/admin/milestones-timeline]', error);
    return NextResponse.json({ success: false, error: 'Failed to load sections' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = (await req.json()) as {
      section?: string;
      content?: unknown;
    };

    if (!body.section || !isSectionKey(body.section)) {
      return NextResponse.json({ success: false, error: 'Invalid section' }, { status: 400 });
    }

    const result = await upsertMilestonesTimelineSectionAction(body.section, body.content);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('[POST /api/admin/milestones-timeline]', error);
    return NextResponse.json({ success: false, error: 'Failed to save section' }, { status: 500 });
  }
}