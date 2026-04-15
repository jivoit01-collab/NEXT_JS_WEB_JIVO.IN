import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { authConfig } from '@/lib/auth.config';

/**
 * Full auth config (Node runtime).
 *
 * Extends the edge-safe `authConfig` with the Credentials provider that
 * does DB lookups + bcrypt password comparison. Do NOT import this from
 * middleware — use `auth.config.ts` there instead.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

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

        return null;
      },
    }),
  ],
});
