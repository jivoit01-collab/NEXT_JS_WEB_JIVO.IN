import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Use inside a route handler or server action to enforce ADMIN / SUPER_ADMIN.
 *
 *   export async function POST(req: Request) {
 *     const guard = await requireAdmin();
 *     if (guard) return guard;
 *     // …protected logic…
 *   }
 *
 * Returns a 401/403 NextResponse if unauthorized, or `null` if the user is allowed.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const role = session.user.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Forbidden — admin role required' },
      { status: 403 },
    );
  }

  return null;
}
