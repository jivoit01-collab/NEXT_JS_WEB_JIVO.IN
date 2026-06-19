import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth.config';
import { recordFailedAttempt } from '@/lib/admin-security-store';

class AdminIpBlockedError extends CredentialsSignin {
  code = 'blocked';
}

/**
 * Full auth config (Node runtime).
 *
 * Extends the edge-safe `authConfig` with the Credentials provider that
 * does DB lookups + bcrypt password comparison. Do NOT import this from
 * middleware — use `auth.config.ts` there instead.
 */
function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;

  const first = ip.split(',')[0]?.trim();
  if (!first) return null;

  const withoutPort = /^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(first)
    ? first.slice(0, first.lastIndexOf(':'))
    : first;

  return withoutPort.startsWith('::ffff:')
    ? withoutPort.slice('::ffff:'.length)
    : withoutPort;
}

async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();

  return (
    normalizeIp(requestHeaders.get('x-real-ip')) ??
    normalizeIp(requestHeaders.get('x-forwarded-for')) ??
    normalizeIp(requestHeaders.get('cf-connecting-ip')) ??
    'unknown'
  );
}

async function recordFailedLogin(ip: string): Promise<null> {
  try {
    const result = await recordFailedAttempt(ip);
    if (result.blocked) {
      throw new AdminIpBlockedError();
    }
  } catch (error) {
    if (error instanceof AdminIpBlockedError) {
      throw error;
    }

    console.error('[auth.recordFailedLogin]', { ip, error });
  }

  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const ip = await getClientIp();
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;

        if (!email || !password) return recordFailedLogin(ip);

        // 1. DB lookup (seeded admin user)
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user?.password) {
            const ok = await bcrypt.compare(password, user.password);
            if (ok) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image ?? undefined,
              };
            }
          }
        } catch (err) {
          console.error('[auth] DB lookup failed:', err);
        }

        // 2. Env-based fallback (useful before DB is seeded)
        if (
          process.env.ADMIN_EMAIL &&
          process.env.ADMIN_PASSWORD &&
          email === process.env.ADMIN_EMAIL.toLowerCase() &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: 'admin-env',
            name: 'Admin',
            email,
            role: 'SUPER_ADMIN',
          };
        }

        return recordFailedLogin(ip);
      },
    }),
  ],
});
