import 'server-only';
import { prisma } from '@/lib/db';
import type { UserProfileData } from '../types';

/** Fetch a user + modular profile (safe fields only — never the password hash). */
export async function getUserWithProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
      profile: true,
    },
  });
  return user;
}

/** Update (or create) the modular profile for a user. */
export async function upsertUserProfile(
  userId: string,
  data: Partial<UserProfileData>,
): Promise<void> {
  await prisma.userProfile.upsert({
    where: { userId },
    update: {
      avatarUrl: data.avatarUrl ?? undefined,
      language: data.language ?? undefined,
      timezone: data.timezone ?? undefined,
      marketingOptIn: data.marketingOptIn ?? undefined,
      notificationPrefs: (data.notificationPrefs ?? undefined) as object | undefined,
      privacyPrefs: (data.privacyPrefs ?? undefined) as object | undefined,
      preferences: (data.preferences ?? undefined) as object | undefined,
    },
    create: {
      userId,
      avatarUrl: data.avatarUrl ?? null,
      language: data.language ?? null,
      timezone: data.timezone ?? null,
      marketingOptIn: data.marketingOptIn ?? false,
      notificationPrefs: (data.notificationPrefs ?? undefined) as object | undefined,
      privacyPrefs: (data.privacyPrefs ?? undefined) as object | undefined,
      preferences: (data.preferences ?? undefined) as object | undefined,
    },
  });
}
