import { NextResponse } from 'next/server';
import { defaultSections, sectionKeys } from '@/modules/our-essence/our-fair-share/data/defaults';
import { getOurFairShareSections } from '@/modules/our-essence/our-fair-share/data/queries';
import type {
  OurFairShareHealthcareContent,
  OurFairShareHeroContent,
  OurFairShareSectionKey,
  OurFairShareWomenContent,
} from '@/modules/our-essence/our-fair-share/types';

export const runtime = 'nodejs';

type OurFairShareApiData = {
  hero: OurFairShareHeroContent;
  healthcare: OurFairShareHealthcareContent;
  women: OurFairShareWomenContent;
};

function isSectionKey(value: string): value is OurFairShareSectionKey {
  return sectionKeys.includes(value as OurFairShareSectionKey);
}

function mergeSection(
  data: OurFairShareApiData,
  section: OurFairShareSectionKey,
  content: unknown,
) {
  if (section === 'hero') {
    data.hero = { ...data.hero, ...(content as Partial<OurFairShareHeroContent>) };
  }
  if (section === 'healthcare') {
    data.healthcare = {
      ...data.healthcare,
      ...(content as Partial<OurFairShareHealthcareContent>),
    };
  }
  if (section === 'women') {
    data.women = { ...data.women, ...(content as Partial<OurFairShareWomenContent>) };
  }
}

export async function GET() {
  try {
    const sections = await getOurFairShareSections();
    const data: OurFairShareApiData = {
      hero: { ...defaultSections.hero },
      healthcare: { ...defaultSections.healthcare },
      women: { ...defaultSections.women },
    };

    for (const section of sections) {
      if (!isSectionKey(section.section)) continue;
      mergeSection(data, section.section, section.content);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/our-essence/our-fair-share]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load Our Fair Share data' },
      { status: 500 },
    );
  }
}
