import { RefinedGoldOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { HighlightsSection } from './highlights-section';
import { WhatIsGoldSection } from './what-is-gold-section';
import type {
  RefinedGoldOilsHeroContent,
  RefinedGoldOilsRangeContent,
  RefinedGoldOilsHighlightsContent,
  RefinedGoldOilsWhatIsContent,
} from '../types';

interface RefinedGoldOilsMainProps {
  sections: Map<string, unknown>;
}

/**
 * Section order follows the approved design:
 *   1. Hero  2. Range  3. Key highlights + benefits  4. What is Jivo Gold
 *
 * Section 1 mirrors the groundnut hero (same bottle sizes); sections 2 and 4
 * mirror the desi-ghee range and bg-image sections. Only content and colours
 * differ. All render eagerly so SEO copy ships in the ISR HTML.
 */
export function RefinedGoldOilsMain({ sections }: RefinedGoldOilsMainProps) {
  return (
    <main>
      <RefinedGoldOilsHero
        data={sections.get('hero') as RefinedGoldOilsHeroContent | undefined}
      />
      <RangeSection data={sections.get('range') as RefinedGoldOilsRangeContent | undefined} />
      <HighlightsSection
        data={sections.get('keyHighlights') as RefinedGoldOilsHighlightsContent | undefined}
      />
      <WhatIsGoldSection
        data={sections.get('whatIsGold') as RefinedGoldOilsWhatIsContent | undefined}
      />
    </main>
  );
}
