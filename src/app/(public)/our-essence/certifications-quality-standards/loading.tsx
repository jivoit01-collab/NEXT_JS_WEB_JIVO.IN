import {
  CertificationsHeroSkeleton,
} from '@/modules/our-essence/certifications-quality-standards/components/hero-section';
import {
  BadgesGridSectionSkeleton,
} from '@/modules/our-essence/certifications-quality-standards/components/badges-grid-section';

export default function CertificationsQualityStandardsLoading() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#3d413f] pb-16 sm:pb-20 lg:pb-24 2xl:pb-28">
      <CertificationsHeroSkeleton />
      <BadgesGridSectionSkeleton />
    </main>
  );
}
