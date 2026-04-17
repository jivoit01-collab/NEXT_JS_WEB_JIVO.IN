import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jivo Media',
  robots: { index: false, follow: false },
};

export default function MediaPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-jost-bold text-3xl">Jivo Media</h1>
        <p className="mt-2 text-muted-foreground">Coming soon.</p>
      </div>
    </main>
  );
}
