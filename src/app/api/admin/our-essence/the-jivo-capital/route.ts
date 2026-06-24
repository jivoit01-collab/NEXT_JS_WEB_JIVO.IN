import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { upsertTheJivoCapitalSectionAction } from '@/modules/our-essence/the-jivo-capital/actions';
import {
  defaultSections,
  sectionKeys,
} from '@/modules/our-essence/the-jivo-capital/data/defaults';
import { getAllTheJivoCapitalSections } from '@/modules/our-essence/the-jivo-capital/data/queries';
import type {
  TheJivoCapitalFarmToBottleContent,
  TheJivoCapitalFreshLockContent,
  TheJivoCapitalHeroContent,
  TheJivoCapitalPlantContent,
  TheJivoCapitalSectionKey,
} from '@/modules/our-essence/the-jivo-capital/types';

export const runtime = 'nodejs';

type TheJivoCapitalApiData = {
  hero: TheJivoCapitalHeroContent;
  oilPlant: TheJivoCapitalPlantContent;
  waterPlant: TheJivoCapitalPlantContent;
  farmToBottle: TheJivoCapitalFarmToBottleContent;
  freshLock: TheJivoCapitalFreshLockContent;
};

function isSectionKey(value: string): value is TheJivoCapitalSectionKey {
  return sectionKeys.includes(value as TheJivoCapitalSectionKey);
}

function mergeSection(
  data: TheJivoCapitalApiData,
  section: TheJivoCapitalSectionKey,
  content: unknown,
) {
  if (section === 'hero') {
    data.hero = { ...data.hero, ...(content as Partial<TheJivoCapitalHeroContent>) };
  }
  if (section === 'oilPlant') {
    data.oilPlant = { ...data.oilPlant, ...(content as Partial<TheJivoCapitalPlantContent>) };
  }
  if (section === 'waterPlant') {
    data.waterPlant = {
      ...data.waterPlant,
      ...(content as Partial<TheJivoCapitalPlantContent>),
    };
  }
  if (section === 'farmToBottle') {
    data.farmToBottle = {
      ...data.farmToBottle,
      ...(content as Partial<TheJivoCapitalFarmToBottleContent>),
    };
  }
  if (section === 'freshLock') {
    data.freshLock = {
      ...data.freshLock,
      ...(content as Partial<TheJivoCapitalFreshLockContent>),
    };
  }
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const sections = await getAllTheJivoCapitalSections();
    const data: TheJivoCapitalApiData = {
      hero: { ...defaultSections.hero },
      oilPlant: { ...defaultSections.oilPlant },
      waterPlant: { ...defaultSections.waterPlant },
      farmToBottle: { ...defaultSections.farmToBottle },
      freshLock: { ...defaultSections.freshLock },
    };

    for (const section of sections) {
      if (!isSectionKey(section.section)) continue;
      mergeSection(data, section.section, section.content);
    }

    return NextResponse.json({ success: true, data, rows: sections });
  } catch (error) {
    console.error('[GET /api/admin/our-essence/the-jivo-capital]', error);
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

    const result = await upsertTheJivoCapitalSectionAction(body.section, body.content);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('[POST /api/admin/our-essence/the-jivo-capital]', error);
    return NextResponse.json({ success: false, error: 'Failed to save section' }, { status: 500 });
  }
}
