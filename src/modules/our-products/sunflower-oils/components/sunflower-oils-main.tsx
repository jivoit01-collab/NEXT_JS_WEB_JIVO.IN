import type { ComponentType } from 'react';
import { SunflowerOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { BenefitsSection } from './benefits-section';
import { WhyItMattersSection } from './why-it-matters-section';

/** Section key → component. Order + visibility come from the DB (sortOrder /
 *  isActive), not code. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: SunflowerOilsHero as ComponentType<{ data?: unknown }>,
  range: RangeSection as ComponentType<{ data?: unknown }>,
  benefits: BenefitsSection as ComponentType<{ data?: unknown }>,
  whyItMatters: WhyItMattersSection as ComponentType<{ data?: unknown }>,
};

interface SunflowerOilsMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function SunflowerOilsMain({ sections }: SunflowerOilsMainProps) {
  return (
    <main>
      {sections.map(({ section, content }) => {
        const Component = SECTION_COMPONENTS[section];
        if (!Component) return null;
        return <Component key={section} data={content} />;
      })}
    </main>
  );
}
