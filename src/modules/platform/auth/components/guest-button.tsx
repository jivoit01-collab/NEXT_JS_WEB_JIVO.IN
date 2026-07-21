'use client';

import { useRouter } from 'next/navigation';
import { UserRound } from 'lucide-react';

/**
 * "Continue as Guest" — authentication is always optional. Navigates onward
 * without signing in (analytics keep working anonymously via the visitor id).
 */
export function GuestButton({ onGuest, href = '/' }: { onGuest?: () => void; href?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (onGuest ? onGuest() : router.push(href))}
      className="text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-jost-medium transition-colors"
    >
      <UserRound size={16} />
      Continue as Guest
    </button>
  );
}
