'use client';

import { LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../hooks';
import { getInitials } from '../utils';
import { getEnabledAuthProviders } from '../services';

/**
 * Compact identity control: avatar + sign-out when authenticated, a sign-in
 * link otherwise. Drop into a navbar/header. Optional convenience component.
 *
 * Visibility is 100% config-driven: when no provider is enabled (e.g. Marketing
 * Website mode with Google Login off) and no custom `onSignIn` is given, the
 * sign-in affordance renders nothing — no hardcoded provider.
 */
export function UserMenu({ onSignIn }: { onSignIn?: () => void }) {
  const { user, isAuthenticated, isLoading, signInWith, signOut } = useAuth();

  if (isLoading) return <span className="bg-muted h-8 w-8 animate-pulse rounded-full" />;

  if (!isAuthenticated || !user) {
    const providers = getEnabledAuthProviders();
    if (!onSignIn && providers.length === 0) return null;
    return (
      <button
        type="button"
        onClick={() => (onSignIn ? onSignIn() : signInWith(providers[0].signInId))}
        className="text-foreground/80 hover:text-primary flex items-center gap-1.5 text-sm font-jost-medium transition-colors"
      >
        <LogIn size={16} /> Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-jost-bold">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          getInitials(user.name, user.email)
        )}
      </span>
      <button
        type="button"
        onClick={() => signOut()}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
