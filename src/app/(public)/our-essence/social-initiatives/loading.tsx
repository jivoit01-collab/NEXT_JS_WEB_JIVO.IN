import {
  EducateEmpowerSectionSkeleton,
  SocialInitiativesCtaSectionSkeleton,
  SocialInitiativesHeroSkeleton,
  SplitStorySectionSkeleton,
} from '@/modules/our-essence/social-initiatives';

export default function LoadingSocialInitiativesPage() {
  return (
    <main>
      <SocialInitiativesHeroSkeleton />
      <SplitStorySectionSkeleton />
      <SplitStorySectionSkeleton />
      <EducateEmpowerSectionSkeleton />
      <SocialInitiativesCtaSectionSkeleton />
    </main>
  );
}
