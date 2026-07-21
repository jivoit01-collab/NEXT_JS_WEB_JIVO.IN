// ==========================================================================
// Authentication configuration — the SINGLE SOURCE OF TRUTH (Phase 5.1).
//
// Feature flags gate every current + future auth capability. Enabling a future
// feature later is a ONE-LINE config change here — no code changes elsewhere.
// Client-safe (pure constants).
// ==========================================================================

/**
 * Auth feature flags. Current site behaviour = Google + Guest login only;
 * everything else is OFF until a future phase turns it on here.
 */
export const AUTH_FEATURES = {
  // ── Live today ──────────────────────────────────────────────
  // Marketing Website mode: Google Login is DISABLED. The whole auth platform
  // stays implemented — flip this to `true` (or set NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true)
  // to switch to E-commerce mode. No other code changes required.
  googleLogin: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true',
  guestLogin: true,

  // ── Prepared, disabled until needed ─────────────────────────
  userProfile: false,
  userPreferences: false,
  notifications: false,
  privacy: false,
  security: false,
  connectedAccounts: false,
  customerPortal: false,
  wishlist: false,
  orders: false,
  addresses: false,
  loyalty: false,
  aiProfile: false,
  sessionManagement: false,
} as const;

export type AuthFeatureId = keyof typeof AUTH_FEATURES;

/** Is an auth feature enabled? Accepts a feature id (or any flag string). */
export function isAuthFeatureEnabled(id: AuthFeatureId | string): boolean {
  return (AUTH_FEATURES as Record<string, boolean>)[id] === true;
}

/**
 * One place for every reusable auth setting: flags, redirects, session options,
 * and slots for future providers / customer / admin features.
 */
export const AUTH_CONFIG = {
  features: AUTH_FEATURES,

  redirects: {
    /** Where to send a user after a successful sign-in / sign-out. */
    afterSignIn: '/',
    afterSignOut: '/',
    /** Public + admin sign-in routes. */
    signIn: '/sign-in',
    adminSignIn: '/jivo-dev/login',
  },

  session: {
    strategy: 'jwt' as const,
    // Future: maxAge / updateAge / MFA step-up config live here.
  },

  storageKeys: {
    /** Marks that this session's visitor→user merge already ran. */
    merged: 'jivo.auth.merged',
  },

  // Reserved, intentionally empty — future providers / customer / admin config
  // slot in here so there is still ONE source of truth.
  futureProviders: {} as Record<string, unknown>,
  customer: {} as Record<string, unknown>,
  admin: {} as Record<string, unknown>,
} as const;
