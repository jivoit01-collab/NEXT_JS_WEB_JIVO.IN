import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SectionSkeletonProps {
  /** Approximate visual height of the section being deferred. */
  height?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

const HEIGHT_CLASS = {
  sm: 'min-h-[240px] py-12',
  md: 'min-h-[400px] py-16',
  lg: 'min-h-[560px] py-20',
  hero: 'min-h-[80vh] py-24',
} as const;

/**
 * Generic section-shaped skeleton. Used as the `loading` prop in
 * `next/dynamic` and inside `<LazyOnView fallback={...}>`.
 */
export function SectionSkeleton({ height = 'md', className }: SectionSkeletonProps) {
  return (
    <section
      aria-hidden
      className={cn('w-full bg-muted/30', HEIGHT_CLASS[height], className)}
    >
      <div className="container mx-auto flex flex-col items-center gap-4 px-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-3/4 max-w-2xl" />
        <Skeleton className="h-4 w-2/3 max-w-xl" />
        <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </section>
  );
}
