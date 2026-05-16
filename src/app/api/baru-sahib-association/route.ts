import { NextResponse } from 'next/server';
import {
  defaultSections,
  getBaruSahibAssociationSections,
} from '@/modules/our-essence/baru-sahib-association';
import type {
  BaruSahibAssociationHeroContent,
  BaruSahibAssociationHumanityContent,
  BaruSahibAssociationSectionKey,
  BaruSahibAssociationVideoContent,
} from '@/modules/our-essence/baru-sahib-association';

export const runtime = 'nodejs';

const SECTION_KEYS: BaruSahibAssociationSectionKey[] = ['hero', 'video', 'humanity'];

type BaruSahibAssociationApiData = {
  hero: BaruSahibAssociationHeroContent;
  video: BaruSahibAssociationVideoContent;
  humanity: BaruSahibAssociationHumanityContent;
};

function isSectionKey(value: string): value is BaruSahibAssociationSectionKey {
  return SECTION_KEYS.includes(value as BaruSahibAssociationSectionKey);
}

export async function GET() {
  try {
    const sections = await getBaruSahibAssociationSections();
    const data: BaruSahibAssociationApiData = {
      hero: { ...defaultSections.hero },
      video: { ...defaultSections.video },
      humanity: { ...defaultSections.humanity },
    };

    for (const section of sections) {
      if (!isSectionKey(section.section)) continue;

      if (section.section === 'hero') {
        data.hero = {
          ...data.hero,
          ...(section.content as Partial<BaruSahibAssociationHeroContent>),
        };
      }

      if (section.section === 'video') {
        data.video = {
          ...data.video,
          ...(section.content as Partial<BaruSahibAssociationVideoContent>),
        };
      }

      if (section.section === 'humanity') {
        data.humanity = {
          ...data.humanity,
          ...(section.content as Partial<BaruSahibAssociationHumanityContent>),
        };
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/baru-sahib-association]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load Baru Sahib Association data' },
      { status: 500 },
    );
  }
}
