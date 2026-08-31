import type { ComponentType } from 'react';
import { RefinedGoldOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { HighlightsSection } from './highlights-section';
import { WhatIsGoldSection } from './what-is-gold-section';

/** Section key → component. Order + visibility come from the DB (sortOrder /
 *  isActive), not code. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: RefinedGoldOilsHero as ComponentType<{ data?: unknown }>,
  range: RangeSection as ComponentType<{ data?: unknown }>,
  keyHighlights: HighlightsSection as ComponentType<{ data?: unknown }>,
  whatIsGold: WhatIsGoldSection as ComponentType<{ data?: unknown }>,
};

interface RefinedGoldOilsMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function RefinedGoldOilsMain({ sections }: RefinedGoldOilsMainProps) {
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
