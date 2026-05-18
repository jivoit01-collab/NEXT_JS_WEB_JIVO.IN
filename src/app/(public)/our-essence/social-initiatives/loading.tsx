import {
  EducateEmpowerSectionSkeleton,
  SocialInitiativesHeroSkeleton,
  SplitStorySectionSkeleton,
} from '@/modules/our-essence/social-initiatives';

export default function LoadingSocialInitiativesPage() {
  return (
    <main>
      <SocialInitiativesHeroSkeleton />
      <SplitStorySectionSkeleton />
      <EducateEmpowerSectionSkeleton />
    </main>
  );
}
