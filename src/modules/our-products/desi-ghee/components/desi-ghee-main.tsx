import type { ComponentType } from 'react';
import { DesiGheeHero } from './hero-section';
import { RangeSection } from './range-section';
import { HighlightsSection } from './highlights-section';
import { BilonaSection } from './bilona-section';

/** Section key → the component that renders it. Adding a new section = one entry
 *  here; order + visibility come from the DB (sortOrder / isActive), not code. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: DesiGheeHero as ComponentType<{ data?: unknown }>,
  range: RangeSection as ComponentType<{ data?: unknown }>,
  keyHighlights: HighlightsSection as ComponentType<{ data?: unknown }>,
  bilona: BilonaSection as ComponentType<{ data?: unknown }>,
};

interface DesiGheeMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/**
 * Renders only the ACTIVE sections, in the order the admin arranged them
 * (DB `sortOrder`). A deactivated section is absent from `sections`, so it is
 * NOT rendered at all — reorder/hide is fully data-driven, no code change.
 *
 * All sections render eagerly so their SEO copy ships in the ISR HTML.
 */
export function DesiGheeMain({ sections }: DesiGheeMainProps) {
  return (
    <main>
      {sections.map(({ section, content }) => {
        const Component = SECTION_COMPONENTS[section];
        if (!Component) return null; // unknown key → skip safely
        return <Component key={section} data={content} />;
      })}
    </main>
  );
}
