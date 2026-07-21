import type { AuthUser, IdentityStage } from '../types';

/** Resolve the identity stage from a user (or null for anonymous visitors). */
export function resolveIdentityStage(user: AuthUser | null | undefined): IdentityStage {
  if (!user) return 'anonymous';
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return 'admin';
  // 'customer' / 'distributor' are future stages derived from orders/partnership.
  return 'authenticated';
}

/** True when the user has an admin role. */
export function isAdminRole(role: string | undefined | null): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/** Initials for an avatar fallback. */
export function getInitials(name?: string | null, email?: string | null): string {
  const base = (name ?? email ?? '?').trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}
