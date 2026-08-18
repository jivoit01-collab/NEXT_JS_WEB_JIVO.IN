import { CanolaOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { WhatIsCanolaSection } from './what-is-canola-section';
import { ScienceSection } from './science-section';
import { ColdPressedSection } from './cold-pressed-section';
import type {
  CanolaOilsHeroContent,
  CanolaOilsRangeContent,
  CanolaOilsWhatIsContent,
  CanolaOilsScienceContent,
  CanolaOilsColdPressedContent,
} from '../types';

interface CanolaOilsMainProps {
  sections: Map<string, unknown>;
}

/**
 * Section order follows the approved design screenshots:
 *   1. Hero  2. Range  3. What is canola  4. Science  5. Why cold-pressed
 *
 * All sections render eagerly so their SEO-relevant copy ships in the ISR HTML
 * (performance.md §9.2). The interactive sections are lightweight client
 * islands — no next/dynamic skeleton swap, which avoids the
 * skeleton-then-content flash flagged in the production audit.
 */
export function CanolaOilsMain({ sections }: CanolaOilsMainProps) {
  return (
    <main>
      <CanolaOilsHero data={sections.get('hero') as CanolaOilsHeroContent | undefined} />
      <RangeSection data={sections.get('range') as CanolaOilsRangeContent | undefined} />
      <WhatIsCanolaSection
        data={sections.get('whatIsCanola') as CanolaOilsWhatIsContent | undefined}
      />
      <ScienceSection data={sections.get('science') as CanolaOilsScienceContent | undefined} />
      <ColdPressedSection
        data={sections.get('coldPressed') as CanolaOilsColdPressedContent | undefined}
      />
    </main>
  );
}
