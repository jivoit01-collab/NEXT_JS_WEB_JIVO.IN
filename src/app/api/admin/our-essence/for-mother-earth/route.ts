import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { upsertForMotherEarthSectionAction } from '@/modules/our-essence/for-mother-earth/actions';
import { defaultSections, sectionKeys } from '@/modules/our-essence/for-mother-earth/data/defaults';
import { getAllForMotherEarthSections } from '@/modules/our-essence/for-mother-earth/data/queries';
import type {
  ForMotherEarthCleanTreeContent,
  ForMotherEarthDisasterContent,
  ForMotherEarthHeroContent,
  ForMotherEarthSectionKey,
} from '@/modules/our-essence/for-mother-earth/types';

export const runtime = 'nodejs';

type ForMotherEarthApiData = {
  hero: ForMotherEarthHeroContent;
  cleanTree: ForMotherEarthCleanTreeContent;
  disaster: ForMotherEarthDisasterContent;
};

function isSectionKey(value: string): value is ForMotherEarthSectionKey {
  return sectionKeys.includes(value as ForMotherEarthSectionKey);
}

function mergeSection(
  data: ForMotherEarthApiData,
  section: ForMotherEarthSectionKey,
  content: unknown,
) {
  if (section === 'hero') {
    data.hero = { ...data.hero, ...(content as Partial<ForMotherEarthHeroContent>) };
  }
  if (section === 'cleanTree') {
    data.cleanTree = {
      ...data.cleanTree,
      ...(content as Partial<ForMotherEarthCleanTreeContent>),
    };
  }
  if (section === 'disaster') {
    data.disaster = {
      ...data.disaster,
      ...(content as Partial<ForMotherEarthDisasterContent>),
    };
  }
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const sections = await getAllForMotherEarthSections();
    const data: ForMotherEarthApiData = {
      hero: { ...defaultSections.hero },
      cleanTree: { ...defaultSections.cleanTree },
      disaster: { ...defaultSections.disaster },
    };

    for (const section of sections) {
      if (!isSectionKey(section.section)) continue;
      mergeSection(data, section.section, section.content);
    }

    return NextResponse.json({ success: true, data, rows: sections });
  } catch (error) {
    console.error('[GET /api/admin/our-essence/for-mother-earth]', error);
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

    const result = await upsertForMotherEarthSectionAction(body.section, body.content);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('[POST /api/admin/our-essence/for-mother-earth]', error);
    return NextResponse.json({ success: false, error: 'Failed to save section' }, { status: 500 });
  }
}
