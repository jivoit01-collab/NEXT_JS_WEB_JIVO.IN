import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Products',
  robots: { index: false, follow: false },
};

export default function OurProductsPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-jost-bold text-3xl">Our Products</h1>
        <p className="mt-2 text-muted-foreground">Coming soon.</p>
      </div>
    </main>
  );
}
