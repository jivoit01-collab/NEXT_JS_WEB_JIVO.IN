'use client';

import { CheckCircle2 } from 'lucide-react';
import { getEnabledAuthProviders } from '../services';
import { isAuthFeatureEnabled } from '../config';
import { useAuth } from '../hooks';
import { getInitials } from '../utils';
import { ProviderButton } from './provider-button';
import { GuestButton } from './guest-button';
import { AuthBenefits } from './auth-benefits';
import { AuthPrivacyNote } from './auth-privacy-note';

/**
 * The reusable authentication experience — provider buttons (registry-driven),
 * Continue as Guest, benefits and privacy note. Rendering entirely from the
 * provider registry means a new provider needs ONE registration, no redesign.
 */
export function SignInPanel({
  callbackUrl,
  onGuest,
  guestHref = '/',
  title = 'Welcome to Jivo Wellness',
  subtitle = 'Sign in to personalise your experience — or continue as a guest.',
}: {
  callbackUrl?: string;
  onGuest?: () => void;
  guestHref?: string;
  title?: string;
  subtitle?: string;
}) {
  const providers = getEnabledAuthProviders();
  const { user, isAuthenticated, signOut } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="bg-card mx-auto w-full max-w-md rounded-2xl border p-6 text-center 2xl:p-8">
        <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg font-jost-bold">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            getInitials(user.name, user.email)
          )}
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 font-jost-bold">
          <CheckCircle2 size={16} className="text-primary" /> Signed in
        </p>
        <p className="text-muted-foreground mt-1 text-sm">{user.name ?? user.email}</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-foreground mt-5 text-sm underline-offset-2 hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card mx-auto w-full max-w-md rounded-2xl border p-6 2xl:p-8">
      <div className="text-center">
        <h1 className="font-jost-bold text-xl 2xl:text-2xl">{title}</h1>
        <p className="text-muted-foreground mt-1.5 text-sm 2xl:text-base">{subtitle}</p>
      </div>

      <div className="mt-6 grid gap-2.5">
        {providers.length > 0 ? (
          providers.map((p) => <ProviderButton key={p.id} provider={p} callbackUrl={callbackUrl} />)
        ) : (
          <p className="text-muted-foreground rounded-xl border border-dashed py-4 text-center text-sm">
            No sign-in providers are enabled yet.
          </p>
        )}
      </div>

      {isAuthFeatureEnabled('guestLogin') && (
        <>
          <div className="my-5 flex items-center gap-3">
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-[11px] uppercase tracking-wider">or</span>
            <span className="bg-border h-px flex-1" />
          </div>
          <GuestButton onGuest={onGuest} href={guestHref} />
        </>
      )}

      <div className="mt-6 border-t pt-5">
        <p className="text-muted-foreground mb-3 text-xs font-jost-medium uppercase tracking-wider">
          Why sign in?
        </p>
        <AuthBenefits />
      </div>

      <div className="mt-5">
        <AuthPrivacyNote />
      </div>
    </div>
  );
}
