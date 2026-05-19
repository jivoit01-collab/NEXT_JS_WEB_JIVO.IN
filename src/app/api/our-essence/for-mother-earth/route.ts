import { NextResponse } from 'next/server';
import { defaultSections, sectionKeys } from '@/modules/our-essence/for-mother-earth/data/defaults';
import { getForMotherEarthSections } from '@/modules/our-essence/for-mother-earth/data/queries';
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
  try {
    const sections = await getForMotherEarthSections();
    const data: ForMotherEarthApiData = {
      hero: { ...defaultSections.hero },
      cleanTree: { ...defaultSections.cleanTree },
      disaster: { ...defaultSections.disaster },
    };

    for (const section of sections) {
      if (!isSectionKey(section.section)) continue;
      mergeSection(data, section.section, section.content);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/our-essence/for-mother-earth]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load For Mother Earth data' },
      { status: 500 },
    );
  }
}
