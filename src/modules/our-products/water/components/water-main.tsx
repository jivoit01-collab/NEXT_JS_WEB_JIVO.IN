import type { ComponentType } from 'react';
import { WaterHero } from './hero-section';
import { RangeSection } from './range-section';
import { BetterBottleSection } from './better-bottle-section';
import { MissionSection } from './mission-section';

/** Section key → component. Order + visibility come from the DB (sortOrder /
 *  isActive), not code. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: WaterHero as ComponentType<{ data?: unknown }>,
  range: RangeSection as ComponentType<{ data?: unknown }>,
  betterBottle: BetterBottleSection as ComponentType<{ data?: unknown }>,
  mission: MissionSection as ComponentType<{ data?: unknown }>,
};

interface WaterMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function WaterMain({ sections }: WaterMainProps) {
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
