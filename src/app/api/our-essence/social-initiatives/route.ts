import { NextResponse } from 'next/server';
import {
  defaultSections,
  normalizeSocialInitiativesSection,
  sectionKeys,
} from '@/modules/our-essence/social-initiatives/data/defaults';
import { getSocialInitiativesSections } from '@/modules/our-essence/social-initiatives/data/queries';
import type {
  SocialInitiativesEducateContent,
  SocialInitiativesHeroContent,
  SocialInitiativesSectionKey,
  SocialInitiativesSplitContent,
} from '@/modules/our-essence/social-initiatives/types';

export const runtime = 'nodejs';

type SocialInitiativesApiData = {
  hero: SocialInitiativesHeroContent;
  responsibilities: SocialInitiativesSplitContent;
  educate: SocialInitiativesEducateContent;
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
    data.hero = {
      ...data.hero,
      ...(normalizeSocialInitiativesSection(
        section,
        content,
      ) as Partial<SocialInitiativesHeroContent>),
    };
  }
  if (section === 'responsibilities') {
    data.responsibilities = {
      ...data.responsibilities,
      ...(normalizeSocialInitiativesSection(
        section,
        content,
      ) as Partial<SocialInitiativesSplitContent>),
    };
  }
  if (section === 'educate') {
    data.educate = {
      ...data.educate,
      ...(normalizeSocialInitiativesSection(
        section,
        content,
      ) as Partial<SocialInitiativesEducateContent>),
    };
  }
}

export async function GET() {
  try {
    const sections = await getSocialInitiativesSections();
    const data: SocialInitiativesApiData = {
      hero: { ...defaultSections.hero },
      responsibilities: { ...defaultSections.responsibilities },
      educate: { ...defaultSections.educate },
    };

    for (const section of sections) {
      if (!isSectionKey(section.section)) continue;
      mergeSection(data, section.section, section.content);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/our-essence/social-initiatives]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load Social Initiatives data' },
      { status: 500 },
    );
  }
}
