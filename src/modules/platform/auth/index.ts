// ==========================================================================
// Platform / Authentication — public barrel (Phase 5).
//
// Reusable authentication platform. Google is the first provider; more plug
// into the same registry with one call. Reuses the existing NextAuth setup +
// the frozen Core (visitor, session, cookie, events) — no new session system.
//
// IMPORTANT import boundaries (avoid pulling server code into client bundles):
//   • Client/runtime  → '@/modules/platform/auth'           (this barrel)
//   • Server actions  → '@/modules/platform/auth/actions'
//   • Server services → '@/modules/platform/auth/services/{oauth,identity}'
//   • Analytics data  → '@/modules/platform/auth/analytics'
//
// Docs: docs/authentication-platform.md
// ==========================================================================

export { AuthProvider } from './providers';
export { useAuth } from './hooks';

export {
  SignInPanel,
  ProviderButton,
  GuestButton,
  AuthBenefits,
  AuthPrivacyNote,
  UserMenu,
  GoogleIcon,
} from './components';

export {
  registerAuthProvider,
  getAuthProviders,
  getEnabledAuthProviders,
  getAuthProvider,
  registerAuthCapability,
  getAuthCapability,
  getAuthCapabilities,
  isAuthCapabilityEnabled,
} from './services';

// Central config + feature flags (single source of truth).
export { AUTH_FEATURES, AUTH_CONFIG, isAuthFeatureEnabled, type AuthFeatureId } from './config';

export { resolveIdentityStage, isAdminRole, getInitials } from './utils';

export { AUTH_EVENTS } from './types';
export type {
  AuthProviderDefinition,
  AuthProviderId,
  AuthCapabilityDefinition,
  AuthUser,
  IdentityStage,
  UserProfileData,
  AuthEventName,
} from './types';
