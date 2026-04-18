import { SectionSkeleton } from '@/components/shared';

export default function CoreValuesLoading() {
  return (
    <div>
      <SectionSkeleton height="hero" />
      <SectionSkeleton height="lg" />
      <SectionSkeleton height="lg" />
    </div>
  );
}
