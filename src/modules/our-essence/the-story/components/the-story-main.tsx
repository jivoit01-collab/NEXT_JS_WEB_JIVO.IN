import dynamic from 'next/dynamic';
import { TheStoryHero } from './hero-section';
import { FounderSectionSkeleton } from './founder-section';
import { VisionSectionSkeleton } from './vision-section';
import type {
  TheStoryHeroContent,
  TheStoryFounderContent,
  TheStoryVisionContent,
} from '../types';

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

interface TheStoryMainProps {
  sections: Map<string, unknown>;
}

export function TheStoryMain({ sections }: TheStoryMainProps) {
  return (
    <main>
      <TheStoryHero data={sections.get('hero') as TheStoryHeroContent | undefined} />
      <FounderSection data={sections.get('founder') as TheStoryFounderContent | undefined} />
      <VisionSection data={sections.get('vision') as TheStoryVisionContent | undefined} />
    </main>
  );
}
