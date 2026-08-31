import type { ComponentType } from 'react';
import { CanolaOilsHero } from './hero-section';
import { RangeSection } from './range-section';
import { WhatIsCanolaSection } from './what-is-canola-section';
import { ScienceSection } from './science-section';
import { ColdPressedSection } from './cold-pressed-section';

/** Section key → component. Order + visibility come from the DB (sortOrder /
 *  isActive), not code. Adding a section = one entry here. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: CanolaOilsHero as ComponentType<{ data?: unknown }>,
  range: RangeSection as ComponentType<{ data?: unknown }>,
  whatIsCanola: WhatIsCanolaSection as ComponentType<{ data?: unknown }>,
  science: ScienceSection as ComponentType<{ data?: unknown }>,
  coldPressed: ColdPressedSection as ComponentType<{ data?: unknown }>,
};

interface CanolaOilsMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/**
 * Renders only the ACTIVE sections, in the admin-set order (DB `sortOrder`).
 * Deactivated sections are absent from `sections`, so they are not rendered.
 * All sections render eagerly so their SEO copy ships in the ISR HTML.
 */
export function CanolaOilsMain({ sections }: CanolaOilsMainProps) {
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
