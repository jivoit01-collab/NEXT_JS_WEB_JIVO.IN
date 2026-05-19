import {
  HealthcareSectionSkeleton,
  OurFairShareHeroSectionSkeleton,
  WomenEmpowermentSectionSkeleton,
} from '@/modules/our-essence/our-fair-share';

export default function LoadingOurFairSharePage() {
  return (
    <main>
      <OurFairShareHeroSectionSkeleton />
      <HealthcareSectionSkeleton />
      <WomenEmpowermentSectionSkeleton />
    </main>
  );
}
