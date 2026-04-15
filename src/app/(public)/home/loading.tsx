import { SectionSkeleton } from '@/components/shared';
import { Skeleton } from '@/components/ui';

export default function HomeLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur sm:px-8">
        <Skeleton className="h-8 w-24" />
        <div className="ml-auto flex gap-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </header>

      <main>
        <SectionSkeleton height="hero" />
        <SectionSkeleton height="md" />
        <SectionSkeleton height="lg" />
      </main>
    </div>
  );
}
