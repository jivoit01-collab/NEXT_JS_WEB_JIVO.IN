'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function TheStoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[our-essence/the-story error]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h1 className="text-xl font-semibold">Something broke on this page.</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We&apos;ve logged the issue. You can retry, or head back home while we look at it.
      </p>
      {process.env.NODE_ENV !== 'production' && (
        <pre className="max-w-2xl overflow-auto rounded-lg bg-muted px-3 py-2 text-left text-xs">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ''}
        </pre>
      )}
      <Button onClick={reset} className="gap-2">
        <RotateCw className="h-4 w-4" /> Try again
      </Button>
    </main>
  );
}
