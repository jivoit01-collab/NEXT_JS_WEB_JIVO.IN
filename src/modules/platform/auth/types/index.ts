// ==========================================================================
// Authentication Platform — types (Phase 5)
//
// Google is the first provider; the architecture supports many more with only a
// registration (no redesign). Auth consumes the frozen Core (visitor, session,
// cookie, events) — it never re-implements them.
// ==========================================================================

import type { ElementType } from 'react';

/** Known provider ids. Additive — new providers append here (or use a string). */
export type AuthProviderId =
  | 'google'
  | 'microsoft'
  | 'apple'
  | 'facebook'
  | 'email-otp'
  | 'phone-otp'
  | 'enterprise-sso';

/** Platforms a provider supports (for future native apps). */
export type AuthPlatform = 'web' | 'ios' | 'android';

/**
 * A registered authentication provider. This is the ONLY thing a future
 * provider must supply to appear in the auth UI.
 */
export interface AuthProviderDefinition {
  id: AuthProviderId | string;
  /** Display name, e.g. "Google". */
  name: string;
  /** Icon component (brand SVG or lucide). */
  icon: ElementType;
  /** NextAuth provider id passed to `signIn(...)`. */
  signInId: string;
  /** Whether the provider is shown/usable. */
  enabled: boolean;
  /** Lower sorts first in the UI. */
  priority: number;
  /** Optional platform feature flag name that also gates it. */
  featureFlag?: string;
  /** Platforms this provider is available on. */
  supportedPlatforms?: AuthPlatform[];
  /** OAuth scopes / permissions requested. */
  permissions?: string[];
  /** Capabilities this provider will unlock later (e.g. 'connectedAccounts'). */
  futureCapabilities?: string[];
  /** Short helper line under the button. */
  description?: string;
}

/**
 * A future auth capability (Orders, Wishlist, Addresses, Notifications, Customer
 * Dashboard, AI Profile, Loyalty, …). Registered now as INFRASTRUCTURE ONLY —
 * no UI, no routes — so a future phase enables it via config, not code.
 */
export interface AuthCapabilityDefinition {
  id: string;
  name: string;
  /** Whether the capability itself is turned on (default false). */
  enabled: boolean;
  /** The AUTH_FEATURES flag that also gates it. */
  featureFlag?: string;
  /** Other capability ids that must be enabled first. */
  dependencies?: string[];
  /** One-line description. */
  description?: string;
}

/**
 * The identity lifecycle. A visitor can progress; each stage is a superset of
 * capabilities, never a new identity (analytics/sessions/events carry over).
 */
export type IdentityStage =
  | 'anonymous' // Core Visitor only
  | 'authenticated' // signed-in User
  | 'customer' // future: has placed an order
  | 'distributor' // future: B2B partner
  | 'admin'; // ADMIN / SUPER_ADMIN

/** The user as exposed to the client (mirrors the NextAuth session user). */
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}

/** Modular profile data (mirrors the `UserProfile` model). */
export interface UserProfileData {
  avatarUrl?: string | null;
  language?: string | null;
  timezone?: string | null;
  marketingOptIn?: boolean;
  notificationPrefs?: Record<string, unknown> | null;
  privacyPrefs?: Record<string, unknown> | null;
  preferences?: Record<string, unknown> | null;
}

/** Auth event names published on the platform event bus (open strings). */
export const AUTH_EVENTS = {
  // ── Live today ──────────────────────────────────────────────
  USER_LOGIN: 'auth:user_login',
  USER_LOGOUT: 'auth:user_logout',
  USER_REGISTER: 'auth:user_register',
  PROFILE_UPDATED: 'auth:profile_updated',
  ACCOUNT_LINKED: 'auth:account_linked',
  ACCOUNT_UNLINKED: 'auth:account_unlinked',
  PROVIDER_CONNECTED: 'auth:provider_connected',
  PROVIDER_DISCONNECTED: 'auth:provider_disconnected',
  // ── Prepared for future capabilities (architecture only, no logic yet) ──
  PASSWORD_CHANGED: 'auth:password_changed',
  MFA_ENABLED: 'auth:mfa_enabled',
  ACCOUNT_DELETED: 'auth:account_deleted',
  ORDER_CONNECTED: 'auth:order_connected',
  LOYALTY_UPDATED: 'auth:loyalty_updated',
} as const;

export type AuthEventName = (typeof AUTH_EVENTS)[keyof typeof AUTH_EVENTS];
