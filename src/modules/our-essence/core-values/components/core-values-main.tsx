import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { CoreValuesHero } from './hero-section';
import { FoundationSectionSkeleton } from './foundation-section';
import { PrinciplesSectionSkeleton } from './principles-section';

// Hero is above-the-fold — eager (server-rendered) for instant LCP.
// Below-the-fold sections use next/dynamic for JS code splitting.
const FoundationSection = dynamic(
  () => import('./foundation-section').then((m) => m.FoundationSection),
  { loading: () => <FoundationSectionSkeleton /> },
);
const PrinciplesSection = dynamic(
  () => import('./principles-section').then((m) => m.PrinciplesSection),
  { loading: () => <PrinciplesSectionSkeleton /> },
);

const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: CoreValuesHero as ComponentType<{ data?: unknown }>,
  foundation: FoundationSection as unknown as ComponentType<{ data?: unknown }>,
  principles: PrinciplesSection as unknown as ComponentType<{ data?: unknown }>,
};

interface CoreValuesMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function CoreValuesMain({ sections }: CoreValuesMainProps) {
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
