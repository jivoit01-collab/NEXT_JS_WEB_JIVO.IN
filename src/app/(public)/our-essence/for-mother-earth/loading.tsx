import {
  CleanTreeSectionSkeleton,
  DisasterSectionSkeleton,
  MotherEarthHeroSectionSkeleton,
} from '@/modules/our-essence/for-mother-earth';

export default function LoadingForMotherEarthPage() {
  return (
    <main>
      <MotherEarthHeroSectionSkeleton />
      <CleanTreeSectionSkeleton />
      <DisasterSectionSkeleton />
    </main>
  );
}
