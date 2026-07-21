'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Refresh button — re-runs the server render (safe no-op today since there is
 * no data; wired now so the control is real when data lands).
 */
export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);

  const onClick = () => {
    setSpinning(true);
    startTransition(() => router.refresh());
    // Stop the spin shortly after; refresh is instant with no data.
    window.setTimeout(() => setSpinning(false), 600);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={pending}
      className="h-9 gap-2"
      aria-label="Refresh analytics"
    >
      <RefreshCw size={15} className={cn((spinning || pending) && 'animate-spin')} />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  );
}

/**
 * Export button — disabled placeholder. Enabled in a later phase once report
 * generation exists.
 */
export function ExportButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled
      className="h-9 gap-2"
      title="Export is coming soon"
      aria-label="Export (coming soon)"
    >
      <Download size={15} />
      <span className="hidden sm:inline">Export</span>
    </Button>
  );
}
