import { MustardOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { ExtractionSection } from './extraction-section';
import { WarmthSection } from './warmth-section';
import type {
  MustardOilsHeroContent,
  MustardOilsRangeContent,
  MustardOilsExtractionContent,
  MustardOilsWarmthContent,
} from '../types';

interface MustardOilsMainProps {
  sections: Map<string, unknown>;
}

/**
 * Section order follows the approved design screenshots:
 *   1. Hero  2. Range  3. Kachi ghani extraction  4. A little warmth
 *
 * Sections 1 and 2 intentionally mirror the groundnut page's styling and
 * animation exactly; only their content and palette differ.
 *
 * All sections render eagerly so their SEO-relevant copy ships in the ISR HTML
 * (performance.md §9.2). The interactive sections are lightweight client
 * islands — no next/dynamic skeleton swap, which avoids the
 * skeleton-then-content flash flagged in the production audit.
 */
export function MustardOilsMain({ sections }: MustardOilsMainProps) {
  return (
    <main>
      <MustardOilsHero data={sections.get('hero') as MustardOilsHeroContent | undefined} />
      <RangeSection data={sections.get('range') as MustardOilsRangeContent | undefined} />
      <ExtractionSection
        data={sections.get('extraction') as MustardOilsExtractionContent | undefined}
      />
      <WarmthSection data={sections.get('warmth') as MustardOilsWarmthContent | undefined} />
    </main>
  );
}
