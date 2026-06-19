'use client';

import { useEffect } from 'react';

export default function SocialInitiativesAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin/our-essence-social-initiatives error]', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-jost-bold text-2xl">Unable to load Social Initiatives CMS</h1>
        <p className="text-muted-foreground mt-2 text-sm">Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="bg-primary text-primary-foreground mt-5 rounded-lg px-5 py-2 text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
