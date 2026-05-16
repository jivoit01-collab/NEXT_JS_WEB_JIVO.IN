'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui';

export default function BaruSahibAssociationAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin/our-essence-baru-sahib-association error]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="text-destructive h-10 w-10" />
      <h1 className="text-xl font-semibold">Something broke in this editor.</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        Retry the editor. If it keeps happening, check the console details.
      </p>
      {process.env.NODE_ENV !== 'production' && (
        <pre className="bg-muted max-w-2xl overflow-auto rounded-lg px-3 py-2 text-left text-xs">
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
