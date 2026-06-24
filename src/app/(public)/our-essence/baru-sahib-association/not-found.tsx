import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BaruSahibAssociationNotFound() {
  return (
    <main className="container mx-auto flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-jost-extrabold">404 - page not found</h1>
      <p className="text-muted-foreground text-sm">
        The page you&apos;re looking for has moved or never existed.
      </p>
      <Button asChild className="gap-2">
        <Link href="/">
          <Home className="h-4 w-4" /> Back home
        </Link>
      </Button>
    </main>
  );
}
