'use client';

import { useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { AuthUser } from '../types';
import { resolveIdentityStage, isAdminRole } from '../utils';

/**
 * The single client hook for auth. No-op-safe everywhere: components can call it
 * without knowing whether the user is signed in.
 *
 *   const { user, isAuthenticated, signInWith, signOut } = useAuth();
 *   <button onClick={() => signInWith('google')}>Continue with Google</button>
 */
export function useAuth() {
  const { data, status } = useSession();

  const user: AuthUser | null = useMemo(() => {
    if (!data?.user?.id) return null;
    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      image: data.user.image,
      role: data.user.role,
    };
  }, [data]);

  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isAdmin: isAdminRole(user?.role),
    stage: resolveIdentityStage(user),
    /** Start sign-in with a registered provider (returns to the current page). */
    signInWith: (providerId: string, opts?: { callbackUrl?: string }) =>
      signIn(providerId, {
        callbackUrl:
          opts?.callbackUrl ?? (typeof window !== 'undefined' ? window.location.href : '/'),
      }),
    signOut: (opts?: { callbackUrl?: string }) => signOut({ callbackUrl: opts?.callbackUrl ?? '/' }),
  };
}
