'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../hooks';
import type { AuthProviderDefinition } from '../types';

/** One sign-in button, rendered from a registered provider. */
export function ProviderButton({
  provider,
  callbackUrl,
}: {
  provider: AuthProviderDefinition;
  callbackUrl?: string;
}) {
  const { signInWith } = useAuth();
  const [pending, setPending] = useState(false);
  const Icon = provider.icon;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signInWith(provider.signInId, { callbackUrl });
      }}
      className={cn(
        'flex w-full items-center justify-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm font-jost-medium transition-all',
        'hover:border-primary/40 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
      <span>Continue with {provider.name}</span>
    </button>
  );
}
