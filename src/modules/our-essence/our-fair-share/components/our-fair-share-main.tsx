import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { OurFairShareHeroSection } from './hero-section';
import { HealthcareSectionSkeleton } from './healthcare-section';
import { WomenEmpowermentSectionSkeleton } from './women-empowerment-section';

const HealthcareSection = dynamic(
  () => import('./healthcare-section').then((mod) => mod.HealthcareSection),
  { loading: () => <HealthcareSectionSkeleton /> },
);

const WomenEmpowermentSection = dynamic(
  () => import('./women-empowerment-section').then((mod) => mod.WomenEmpowermentSection),
  { loading: () => <WomenEmpowermentSectionSkeleton /> },
);

const SECTION_COMPONENTS: Record<string, ComponentType<{ data?: unknown }>> = {
  hero: OurFairShareHeroSection as ComponentType<{ data?: unknown }>,
  healthcare: HealthcareSection as unknown as ComponentType<{ data?: unknown }>,
  women: WomenEmpowermentSection as unknown as ComponentType<{ data?: unknown }>,
};

interface OurFairShareMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/** Renders only ACTIVE sections in the admin-set DB order. */
export function OurFairShareMain({ sections }: OurFairShareMainProps) {
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
