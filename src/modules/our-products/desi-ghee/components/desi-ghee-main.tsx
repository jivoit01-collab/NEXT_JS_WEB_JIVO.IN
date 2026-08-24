import { DesiGheeHero } from './hero-section';
import { RangeSection } from './range-section';
import { HighlightsSection } from './highlights-section';
import { BilonaSection } from './bilona-section';
import type {
  DesiGheeHeroContent,
  DesiGheeRangeContent,
  DesiGheeHighlightsContent,
  DesiGheeBilonaContent,
} from '../types';

interface DesiGheeMainProps {
  sections: Map<string, unknown>;
}

/**
 * Section order follows the approved design screenshots:
 *   1. Hero  2. Range  3. Key highlights  4. The art of Bilona churning
 *
 * All sections render eagerly so their SEO-relevant copy ships in the ISR HTML
 * (performance.md §9.2). The interactive sections are lightweight client
 * islands — no next/dynamic skeleton swap, which avoids the
 * skeleton-then-content flash flagged in the production audit.
 */
export function DesiGheeMain({ sections }: DesiGheeMainProps) {
  return (
    <main>
      <DesiGheeHero data={sections.get('hero') as DesiGheeHeroContent | undefined} />
      <RangeSection data={sections.get('range') as DesiGheeRangeContent | undefined} />
      <HighlightsSection
        data={sections.get('keyHighlights') as DesiGheeHighlightsContent | undefined}
      />
      <BilonaSection data={sections.get('bilona') as DesiGheeBilonaContent | undefined} />
    </main>
  );
}
