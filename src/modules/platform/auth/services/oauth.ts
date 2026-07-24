import 'server-only';
import type { Account, Profile } from 'next-auth';
import { prisma } from '@/lib/db';

/**
 * Persist an OAuth sign-in under the JWT session strategy (no DB adapter).
 * Upserts the User by email + the linked Account, and creates a modular
 * UserProfile on first sign-in. Returns false to reject the sign-in.
 *
 * No duplicate users (upsert by unique email) and no duplicate accounts
 * (upsert by provider + providerAccountId).
 */
export async function handleOAuthSignIn(params: {
  email?: string | null;
  name?: string | null;
  image?: string | null;
  account: Account | null;
  profile?: Profile;
}): Promise<boolean> {
  const email = params.email?.trim().toLowerCase();
  if (!email || !params.account) return false;

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: params.name ?? undefined,
        image: params.image ?? undefined,
      },
      create: {
        email,
        name: params.name ?? email.split('@')[0],
        image: params.image ?? null,
        role: 'CUSTOMER',
        profile: { create: { avatarUrl: params.image ?? null } },
      },
    });

    const a = params.account;
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: a.provider,
          providerAccountId: a.providerAccountId,
        },
      },
      update: {
        access_token: a.access_token ?? null,
        refresh_token: a.refresh_token ?? null,
        expires_at: typeof a.expires_at === 'number' ? a.expires_at : null,
        token_type: a.token_type ?? null,
        scope: a.scope ?? null,
        id_token: a.id_token ?? null,
      },
      create: {
        userId: user.id,
        type: a.type,
        provider: a.provider,
        providerAccountId: a.providerAccountId,
        access_token: a.access_token ?? null,
        refresh_token: a.refresh_token ?? null,
        expires_at: typeof a.expires_at === 'number' ? a.expires_at : null,
        token_type: a.token_type ?? null,
        scope: a.scope ?? null,
        id_token: a.id_token ?? null,
      },
    });

    return true;
  } catch (err) {
    console.error('[auth.handleOAuthSignIn]', err);
    return false;
  }
}
