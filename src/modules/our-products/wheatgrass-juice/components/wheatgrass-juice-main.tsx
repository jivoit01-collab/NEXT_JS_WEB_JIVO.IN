import type { ComponentType } from 'react';
import { WheatgrassHero } from './hero-section';
import { RangeSection } from './range-section';
import { WellnessSection } from './wellness-section';
import { DifferenceSection } from './difference-section';
import { HighlightsSection } from './highlights-section';

/** Section key → component. Order + visibility come from the DB (sortOrder /
 *  isActive), not code. Adding a section = one entry here. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: WheatgrassHero as ComponentType<{ data?: unknown }>,
  range: RangeSection as ComponentType<{ data?: unknown }>,
  wellness: WellnessSection as ComponentType<{ data?: unknown }>,
  difference: DifferenceSection as ComponentType<{ data?: unknown }>,
  highlights: HighlightsSection as ComponentType<{ data?: unknown }>,
};

interface WheatgrassMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function WheatgrassMain({ sections }: WheatgrassMainProps) {
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
