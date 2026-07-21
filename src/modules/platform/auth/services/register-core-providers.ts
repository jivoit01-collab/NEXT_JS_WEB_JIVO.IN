// Providers registered by Phase 5. Only Google is implemented; the rest plug
// into the SAME registry later with one call each — no login-page redesign.
//
// Google's button shows when NEXT_PUBLIC_AUTH_GOOGLE_ENABLED !== 'false'. The
// server side additionally requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
// (the provider is attached in src/lib/auth.ts only when those are present).

import { GoogleIcon } from '../components/provider-icons';
import { AUTH_FEATURES } from '../config';
import { registerAuthProvider } from './provider-registry';

registerAuthProvider({
  id: 'google',
  name: 'Google',
  icon: GoogleIcon,
  signInId: 'google',
  // Gated by the central feature flag (single source of truth).
  enabled: AUTH_FEATURES.googleLogin,
  priority: 10,
  featureFlag: 'googleLogin',
  supportedPlatforms: ['web', 'ios', 'android'],
  permissions: ['openid', 'email', 'profile'],
  futureCapabilities: ['connectedAccounts', 'userProfile'],
  description: 'Sign in with your Google account',
});

// ── Future providers (architecture ready — implement + enable later) ──────────
// registerAuthProvider({ id: 'microsoft', name: 'Microsoft', icon: MicrosoftIcon,
//   signInId: 'microsoft-entra-id', enabled: false, priority: 20, ... });
// registerAuthProvider({ id: 'apple', ... });
// registerAuthProvider({ id: 'facebook', ... });
// registerAuthProvider({ id: 'email-otp', ... });
// registerAuthProvider({ id: 'phone-otp', ... });
// registerAuthProvider({ id: 'enterprise-sso', ... });
