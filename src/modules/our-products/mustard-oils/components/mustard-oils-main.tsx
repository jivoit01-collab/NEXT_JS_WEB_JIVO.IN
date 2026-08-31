import type { ComponentType } from 'react';
import { MustardOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { ExtractionSection } from './extraction-section';
import { WarmthSection } from './warmth-section';

/** Section key → component. Order + visibility come from the DB (sortOrder /
 *  isActive), not code. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: MustardOilsHero as ComponentType<{ data?: unknown }>,
  range: RangeSection as ComponentType<{ data?: unknown }>,
  extraction: ExtractionSection as ComponentType<{ data?: unknown }>,
  warmth: WarmthSection as ComponentType<{ data?: unknown }>,
};

interface MustardOilsMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function MustardOilsMain({ sections }: MustardOilsMainProps) {
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
