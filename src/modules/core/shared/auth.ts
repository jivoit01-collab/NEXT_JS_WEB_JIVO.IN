import { auth } from '@/lib/auth';

/** Failure envelope returned by the admin guard (narrow, so `.error` is always accessible). */
export interface AdminGuardFailure {
  success: false;
  error: string;
}

/**
 * Guard for admin-only server actions + admin GET routes.
 * Returns a failure envelope when the caller isn't an admin, else null.
 *
 * Ingestion endpoints are intentionally public and are protected by rate
 * limiting + validation instead — see the /api/analytics/* route handlers.
 */
export async function requireAdminGuard(): Promise<AdminGuardFailure | null> {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  const role = session.user.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Forbidden — admin role required' };
  }
  return null;
}
