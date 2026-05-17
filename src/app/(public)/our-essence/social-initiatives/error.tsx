'use client';

import { useEffect } from 'react';

export default function SocialInitiativesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[our-essence/social-initiatives error]', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030504] px-4 text-center text-white">
      <div className="max-w-md">
        <h1 className="font-jost-extrabold text-3xl uppercase">Unable to load page</h1>
        <p className="mt-3 text-sm text-white/70">
          The Social Initiatives story could not be loaded right now.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#030504]"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
