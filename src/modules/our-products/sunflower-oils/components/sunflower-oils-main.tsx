import { SunflowerOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { BenefitsSection } from './benefits-section';
import { WhyItMattersSection } from './why-it-matters-section';
import type {
  SunflowerOilsHeroContent,
  SunflowerOilsRangeContent,
  SunflowerOilsBenefitsContent,
  SunflowerOilsWhyItMattersContent,
} from '../types';

interface SunflowerOilsMainProps {
  sections: Map<string, unknown>;
}

/**
 * Section order follows the approved design screenshots:
 *   1. Hero  2. Range  3. Benefits  4. Why it matters
 *
 * Sections 1 and 2 intentionally mirror the groundnut page's styling and
 * animation exactly; only their content differs.
 *
 * All sections render eagerly so their SEO-relevant copy ships in the ISR HTML
 * (performance.md §9.2). The interactive sections are lightweight client
 * islands — no next/dynamic skeleton swap, which avoids the
 * skeleton-then-content flash flagged in the production audit.
 */
export function SunflowerOilsMain({ sections }: SunflowerOilsMainProps) {
  return (
    <main>
      <SunflowerOilsHero data={sections.get('hero') as SunflowerOilsHeroContent | undefined} />
      <RangeSection data={sections.get('range') as SunflowerOilsRangeContent | undefined} />
      <BenefitsSection data={sections.get('benefits') as SunflowerOilsBenefitsContent | undefined} />
      <WhyItMattersSection
        data={sections.get('whyItMatters') as SunflowerOilsWhyItMattersContent | undefined}
      />
    </main>
  );
}
