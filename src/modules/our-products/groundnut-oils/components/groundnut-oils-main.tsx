import { GroundnutOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { GoodnessSection } from './goodness-section';
import { AuthenticitySection } from './authenticity-section';
import type {
  GroundnutOilsHeroContent,
  GroundnutOilsRangeContent,
  GroundnutOilsGoodnessContent,
  GroundnutOilsAuthenticityContent,
} from '../types';

interface GroundnutOilsMainProps {
  sections: Map<string, unknown>;
}

/**
 * Section order follows the approved design screenshots:
 *   1. Hero  2. Range  3. The goodness within  4. Promising authenticity
 *
 * Sections 1 and 2 intentionally mirror the canola page's styling and
 * animation exactly; only their content differs.
 *
 * All sections render eagerly so their SEO-relevant copy ships in the ISR HTML
 * (performance.md §9.2). The interactive sections are lightweight client
 * islands — no next/dynamic skeleton swap, which avoids the
 * skeleton-then-content flash flagged in the production audit.
 */
export function GroundnutOilsMain({ sections }: GroundnutOilsMainProps) {
  return (
    <main>
      <GroundnutOilsHero data={sections.get('hero') as GroundnutOilsHeroContent | undefined} />
      <RangeSection data={sections.get('range') as GroundnutOilsRangeContent | undefined} />
      <GoodnessSection data={sections.get('goodness') as GroundnutOilsGoodnessContent | undefined} />
      <AuthenticitySection
        data={sections.get('authenticity') as GroundnutOilsAuthenticityContent | undefined}
      />
    </main>
  );
}
