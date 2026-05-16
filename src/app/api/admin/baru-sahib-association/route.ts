import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import {
  defaultSections,
  getAllBaruSahibAssociationSections,
  upsertBaruSahibAssociationSectionAction,
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
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const sections = await getAllBaruSahibAssociationSections();
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

    return NextResponse.json({ success: true, data, rows: sections });
  } catch (error) {
    console.error('[GET /api/admin/baru-sahib-association]', error);
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

    const result = await upsertBaruSahibAssociationSectionAction(body.section, body.content);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('[POST /api/admin/baru-sahib-association]', error);
    return NextResponse.json({ success: false, error: 'Failed to save section' }, { status: 500 });
  }
}
