import { NextResponse } from 'next/server';
import {
  defaultSections,
  sectionKeys,
} from '@/modules/our-essence/the-jivo-capital/data/defaults';
import { getTheJivoCapitalSections } from '@/modules/our-essence/the-jivo-capital/data/queries';
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
  try {
    const sections = await getTheJivoCapitalSections();
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

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/our-essence/the-jivo-capital]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load The Jivo Capital data' },
      { status: 500 },
    );
  }
}
