import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe auth config.
 *
 * Used by middleware (which runs on the Edge runtime) to read the JWT
 * without pulling in Node-only dependencies like bcrypt or the pg pool.
 *
 * The full config with the Credentials provider + DB lookup lives in
 * `src/lib/auth.ts` and is used by route handlers / server components.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  providers: [], // Providers are only attached in the Node-runtime auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: string }).role ?? 'ADMIN';
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public paths
      const isPublic =
        !pathname.startsWith('/admin') ||
        pathname === '/admin/login';

      if (isPublic) return true;

      // Admin area requires login
      return isLoggedIn;
    },
  },
};
