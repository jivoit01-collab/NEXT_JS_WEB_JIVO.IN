'use client';

import { useEffect } from 'react';

export default function TheJivoCapitalAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[TheJivoCapitalAdminError]', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-jost-bold text-2xl">Unable to load The Jivo Capital editor</h1>
        <p className="text-muted-foreground mt-2 text-sm">Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="bg-primary font-jost-medium text-primary-foreground mt-5 rounded-lg px-4 py-2 text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
