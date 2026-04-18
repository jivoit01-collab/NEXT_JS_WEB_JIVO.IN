'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function CoreValuesAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin/our-essence-core-values error]', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset} className="gap-2">
        <RotateCw className="h-4 w-4" /> Try again
      </Button>
    </div>
  );
}
