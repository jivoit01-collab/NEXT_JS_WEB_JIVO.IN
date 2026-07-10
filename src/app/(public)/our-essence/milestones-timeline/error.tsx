'use client';

import { useEffect } from 'react';

export default function MilestonesTimelineError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[our-essence/milestones-timeline error]', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-black px-4 pt-14 text-white lg:pt-16 2xl:pt-20">
      <div className="max-w-sm text-center">
        <h1 className="font-jost-bold text-2xl">Video unavailable</h1>
        <p className="mt-2 text-sm text-white/65">The milestones timeline could not load.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-jost-bold text-black"
        >
          Try again
        </button>
      </div>
    </main>
  );
}