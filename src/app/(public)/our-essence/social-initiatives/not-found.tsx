import Link from 'next/link';

export default function SocialInitiativesNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030504] px-4 text-center text-white">
      <div className="max-w-md">
        <h1 className="font-jost-extrabold text-3xl uppercase">Social Initiatives</h1>
        <p className="mt-3 text-sm text-white/70">This page is not available.</p>
        <Link
          href="/our-essence/the-story"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#030504]"
        >
          Back to Our Essence
        </Link>
      </div>
    </main>
  );
}
