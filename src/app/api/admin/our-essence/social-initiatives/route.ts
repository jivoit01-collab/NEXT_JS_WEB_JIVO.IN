import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { upsertSocialInitiativesSectionAction } from '@/modules/our-essence/social-initiatives/actions';
import {
  defaultSections,
  sectionKeys,
} from '@/modules/our-essence/social-initiatives/data/defaults';
import { getAllSocialInitiativesSections } from '@/modules/our-essence/social-initiatives/data/queries';
import type {
  SocialInitiativesCtaContent,
  SocialInitiativesEducateContent,
  SocialInitiativesHeroContent,
  SocialInitiativesSectionKey,
  SocialInitiativesSplitContent,
} from '@/modules/our-essence/social-initiatives/types';

export const runtime = 'nodejs';

type SocialInitiativesApiData = {
  hero: SocialInitiativesHeroContent;
  alignment: SocialInitiativesSplitContent;
  responsibilities: SocialInitiativesSplitContent;
  educate: SocialInitiativesEducateContent;
  cta: SocialInitiativesCtaContent;
};

function isSectionKey(value: string): value is SocialInitiativesSectionKey {
  return sectionKeys.includes(value as SocialInitiativesSectionKey);
}

function mergeSection(
  data: SocialInitiativesApiData,
  section: SocialInitiativesSectionKey,
  content: unknown,
) {
  if (section === 'hero') {
    data.hero = { ...data.hero, ...(content as Partial<SocialInitiativesHeroContent>) };
  }
  if (section === 'alignment') {
    data.alignment = {
      ...data.alignment,
      ...(content as Partial<SocialInitiativesSplitContent>),
    };
  }
  if (section === 'responsibilities') {
    data.responsibilities = {
      ...data.responsibilities,
      ...(content as Partial<SocialInitiativesSplitContent>),
    };
  }
  if (section === 'educate') {
    data.educate = {
      ...data.educate,
      ...(content as Partial<SocialInitiativesEducateContent>),
    };
  }
  if (section === 'cta') {
    data.cta = { ...data.cta, ...(content as Partial<SocialInitiativesCtaContent>) };
  }
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const sections = await getAllSocialInitiativesSections();
    const data: SocialInitiativesApiData = {
      hero: { ...defaultSections.hero },
      alignment: { ...defaultSections.alignment },
      responsibilities: { ...defaultSections.responsibilities },
      educate: { ...defaultSections.educate },
      cta: { ...defaultSections.cta },
    };

    for (const section of sections) {
      if (!isSectionKey(section.section)) continue;
      mergeSection(data, section.section, section.content);
    }

    return NextResponse.json({ success: true, data, rows: sections });
  } catch (error) {
    console.error('[GET /api/admin/our-essence/social-initiatives]', error);
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

    const result = await upsertSocialInitiativesSectionAction(body.section, body.content);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('[POST /api/admin/our-essence/social-initiatives]', error);
    return NextResponse.json({ success: false, error: 'Failed to save section' }, { status: 500 });
  }
}
