import { TheStoryHeroSkeleton } from '@/modules/our-essence/the-story/components/hero-section';
import { FounderSectionSkeleton } from '@/modules/our-essence/the-story/components/founder-section';
import { VisionSectionSkeleton } from '@/modules/our-essence/the-story/components/vision-section';

export default function TheStoryLoading() {
  return (
    <main>
      <TheStoryHeroSkeleton />
      <FounderSectionSkeleton />
      <VisionSectionSkeleton />
    </main>
  );
}
