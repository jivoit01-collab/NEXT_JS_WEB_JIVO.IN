import { SectionSkeleton } from '@/components/shared';

export default function TheStoryLoading() {
  return (
    <div>
      <SectionSkeleton height="hero" />
      <SectionSkeleton height="lg" />
      <SectionSkeleton height="md" />
    </div>
  );
}
