import type { ComponentType } from 'react';
import { CoffeeHero } from './hero-section';
import { RangeSection } from './range-section';
import { KeyHighlightsSection } from './highlights-section';
import { BeyondBeansSection } from './beyond-beans-section';

/** Section key → the component that renders it. Adding a new section = one entry
 *  here; order + visibility come from the DB (sortOrder / isActive), not code. */
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: CoffeeHero as ComponentType<{ data?: unknown }>,
  range: RangeSection as ComponentType<{ data?: unknown }>,
  keyHighlights: KeyHighlightsSection as ComponentType<{ data?: unknown }>,
  beyondBeans: BeyondBeansSection as ComponentType<{ data?: unknown }>,
};

interface CoffeeMainProps {
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
export function CoffeeMain({ sections }: CoffeeMainProps) {
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
