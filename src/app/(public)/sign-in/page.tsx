import type { Metadata } from 'next';
import { SignInPanel } from '@/modules/platform/auth';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

/**
 * Public sign-in experience. Authentication is OPTIONAL — "Continue as Guest"
 * is always offered. Renders entirely from the provider registry, so new
 * providers appear with one registration and no page change.
 */
export default function SignInPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-24">
      <SignInPanel />
    </main>
  );
}
