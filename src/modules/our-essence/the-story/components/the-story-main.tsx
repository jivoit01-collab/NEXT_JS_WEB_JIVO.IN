import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { TheStoryHero } from './hero-section';
import { FounderSectionSkeleton } from './founder-section';
import { VisionSectionSkeleton } from './vision-section';

// Hero is above-the-fold — eager (server-rendered) for instant LCP.
// Below-the-fold sections use next/dynamic for JS code splitting.
const FounderSection = dynamic(
  () => import('./founder-section').then((m) => m.FounderSection),
  { loading: () => <FounderSectionSkeleton /> },
);
const VisionSection = dynamic(
  () => import('./vision-section').then((m) => m.VisionSection),
  { loading: () => <VisionSectionSkeleton /> },
);

// Section key → component. Order + visibility come from the DB (sortOrder /
// isActive), not code. The dynamic-imported sections above are referenced here.
const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: TheStoryHero as ComponentType<{ data?: unknown }>,
  founder: FounderSection as unknown as ComponentType<{ data?: unknown }>,
  vision: VisionSection as unknown as ComponentType<{ data?: unknown }>,
};

interface TheStoryMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function TheStoryMain({ sections }: TheStoryMainProps) {
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
