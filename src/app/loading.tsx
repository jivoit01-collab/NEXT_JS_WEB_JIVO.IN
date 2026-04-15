import { Skeleton } from '@/components/ui';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="mt-4 h-4 w-72" />
    </div>
  );
}
