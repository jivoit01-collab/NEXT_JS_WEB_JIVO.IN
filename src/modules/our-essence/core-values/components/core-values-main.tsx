import dynamic from 'next/dynamic';
import { CoreValuesHero } from './hero-section';
import { FoundationSectionSkeleton } from './foundation-section';
import { PrinciplesSectionSkeleton } from './principles-section';
import type {
  CoreValuesHeroContent,
  CoreValuesFoundationContent,
  CoreValuesPrinciplesContent,
} from '../types';

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

interface CoreValuesMainProps {
  sections: Map<string, unknown>;
}

export function CoreValuesMain({ sections }: CoreValuesMainProps) {
  return (
    <main>
      <CoreValuesHero data={sections.get('hero') as CoreValuesHeroContent | undefined} />
      <FoundationSection
        data={sections.get('foundation') as CoreValuesFoundationContent | undefined}
      />
      <PrinciplesSection
        data={sections.get('principles') as CoreValuesPrinciplesContent | undefined}
      />
    </main>
  );
}
