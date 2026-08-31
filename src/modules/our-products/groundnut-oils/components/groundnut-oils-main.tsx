import type { ComponentType } from 'react';
import { GroundnutOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { GoodnessSection } from './goodness-section';
import { AuthenticitySection } from './authenticity-section';

/** Section key → component. Order + visibility come from the DB (sortOrder /
 *  isActive), not code. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: GroundnutOilsHero as ComponentType<{ data?: unknown }>,
  range: RangeSection as ComponentType<{ data?: unknown }>,
  goodness: GoodnessSection as ComponentType<{ data?: unknown }>,
  authenticity: AuthenticitySection as ComponentType<{ data?: unknown }>,
};

interface GroundnutOilsMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function GroundnutOilsMain({ sections }: GroundnutOilsMainProps) {
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
