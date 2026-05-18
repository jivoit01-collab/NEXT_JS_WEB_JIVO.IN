import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { upsertOurFairShareSectionAction } from '@/modules/our-essence/our-fair-share/actions';
import { defaultSections, sectionKeys } from '@/modules/our-essence/our-fair-share/data/defaults';
import { getAllOurFairShareSections } from '@/modules/our-essence/our-fair-share/data/queries';
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
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const sections = await getAllOurFairShareSections();
    const data: OurFairShareApiData = {
      hero: { ...defaultSections.hero },
      healthcare: { ...defaultSections.healthcare },
      women: { ...defaultSections.women },
    };

    for (const section of sections) {
      if (!isSectionKey(section.section)) continue;
      mergeSection(data, section.section, section.content);
    }

    return NextResponse.json({ success: true, data, rows: sections });
  } catch (error) {
    console.error('[GET /api/admin/our-essence/our-fair-share]', error);
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

    const result = await upsertOurFairShareSectionAction(body.section, body.content);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('[POST /api/admin/our-essence/our-fair-share]', error);
    return NextResponse.json({ success: false, error: 'Failed to save section' }, { status: 500 });
  }
}
