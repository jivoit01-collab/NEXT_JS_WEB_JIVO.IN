import {
  FarmToBottleSectionSkeleton,
  FreshLockSectionSkeleton,
  PlantSectionSkeleton,
  TheJivoCapitalHeroSkeleton,
} from '@/modules/our-essence/the-jivo-capital';

export default function LoadingTheJivoCapitalPage() {
  return (
    <main>
      <TheJivoCapitalHeroSkeleton />
      <PlantSectionSkeleton />
      <PlantSectionSkeleton align="right" />
      <FarmToBottleSectionSkeleton />
      <FreshLockSectionSkeleton />
    </main>
  );
}
