'use client';

import { useEffect } from 'react';

export default function TheJivoCapitalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[TheJivoCapitalError]', error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#30302f] px-4 text-center text-white">
      <div className="max-w-md">
        <p className="font-jost-bold text-sm tracking-[0.24em] text-white/55 uppercase">
          Our Essence
        </p>
        <h1 className="font-jost-extrabold mt-4 text-3xl">Unable to load The Jivo Capital</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Something interrupted this page. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="font-jost-medium mt-6 rounded-full border border-white/20 px-5 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
