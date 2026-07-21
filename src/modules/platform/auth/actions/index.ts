'use server';

import { auth } from '@/lib/auth';
import { mergeVisitorIntoUser } from '../services/identity';
import { getUserWithProfile, upsertUserProfile } from '../data';
import { profileUpdateSchema, visitorIdSchema } from '../validations';

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Link the current anonymous visitor to the authenticated user (visitor merge).
 * Called client-side right after login; the user id comes from the session, so
 * the client can never forge it.
 */
export async function linkVisitorAction(visitorId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const parsed = visitorIdSchema.safeParse(visitorId);
  if (!parsed.success) return { success: false, error: 'Invalid visitor id' };

  try {
    await mergeVisitorIntoUser(session.user.id, parsed.data);
    return { success: true };
  } catch (err) {
    console.error('[auth.linkVisitorAction]', err);
    return { success: false, error: 'Failed to link visitor' };
  }
}

/** Read the current user + modular profile (safe fields). */
export async function getCurrentUserAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: 'Not authenticated' };
  const user = await getUserWithProfile(session.user.id);
  return user
    ? { success: true as const, data: user }
    : { success: false as const, error: 'User not found' };
}

/** Update the current user's modular profile. */
export async function updateProfileAction(input: unknown): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid profile data' };

  try {
    await upsertUserProfile(session.user.id, parsed.data);
    return { success: true };
  } catch (err) {
    console.error('[auth.updateProfileAction]', err);
    return { success: false, error: 'Failed to update profile' };
  }
}
