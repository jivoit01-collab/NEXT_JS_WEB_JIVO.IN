# Authentication Platform (Phase 5)

> A reusable, provider-agnostic authentication platform. **Google is the first
> provider**; Microsoft, Apple, Facebook, Email/Phone OTP and Enterprise SSO plug
> into the same registry with one registration each — no login redesign.
> Reuses the existing NextAuth setup + the frozen Core (visitor, session, cookie,
> events). It does **not** create a new session system.

- **Module:** `src/modules/platform/auth/`
- **Reuses:** NextAuth v5 (`src/lib/auth.ts`), Core Visitor/Session/Cookie/Events, Analytics Dashboard registry
- **Public route:** `/sign-in` · **Admin login unchanged:** `/jivo-dev/login`

---

## 1. Architecture

```
                         ┌──────────── Auth Provider Registry ────────────┐
 registerAuthProvider({id,name,icon,signInId,enabled,priority,…}) ─▶ Map  │
                         └───────────────┬────────────────────────────────┘
                                         │ getEnabledAuthProviders()
                                         ▼
                                    <SignInPanel>  (Continue with Google · Guest · Benefits · Privacy)
                                         │ signIn('google')
                                         ▼
                                   NextAuth (src/lib/auth.ts, JWT)
                            ┌── signIn cb: handleOAuthSignIn → upsert User + Account
                            └── jwt cb:    enrich token.id + token.role
                                         │ session authenticated
                                         ▼
                              <AuthProvider> (SessionProvider + AuthBridge)
                            ├── platformEvents.emit('auth:login', USER_LOGIN)
                            └── linkVisitorAction(visitorId) → UserVisitorLink  (visitor merge)
```

### Folder structure
```
src/modules/platform/auth/
├── components/   SignInPanel, ProviderButton, GuestButton, AuthBenefits,
│                 AuthPrivacyNote, UserMenu, provider-icons (GoogleIcon)
├── providers/    AuthProvider (SessionProvider + auth↔platform bridge)
├── hooks/        useAuth (user, status, signInWith, signOut, stage, isAdmin)
├── actions/      linkVisitorAction, getCurrentUserAction, updateProfileAction  (server)
├── services/     provider-registry, register-core-providers,
│                 oauth (server), identity/visitor-merge (server)
├── data/         user-queries (server)
├── types/        AuthProviderDefinition, IdentityStage, AuthUser, AUTH_EVENTS …
├── validations/  provider / profile / visitorId zod schemas
├── utils/        resolveIdentityStage, isAdminRole, getInitials
├── analytics.ts  AUTH_ANALYTICS_MODULE descriptor (for the dashboard)
└── index.ts      client-safe barrel (server code via explicit subpaths)
```

> **Import boundaries:** client/runtime → the barrel; server actions →
> `…/auth/actions`; server services → `…/auth/services/{oauth,identity}`;
> dashboard descriptor → `…/auth/analytics`. Keeps `server-only` code out of
> client bundles.

---

## 2. Identity lifecycle

```
Anonymous Visitor  →  Authenticated User  →  Customer  →  Distributor  →  Admin
   (Core Visitor)       (NextAuth User)     (future)      (future)     (role)
```

`resolveIdentityStage(user)` maps the session to a stage. Progression is additive
— a visitor never becomes a *different* identity; their analytics, sessions,
events, feedback (and future AI conversations / orders / recommendations) carry
forward via the visitor merge.

---

## 3. Visitor merge flow

```
guest browses  → Core Visitor `visitorId` (localStorage) + sessions + events
user signs in  → AuthProvider detects 'authenticated'
              → linkVisitorAction(visitorId)  [server; userId from session]
              → UserVisitorLink.upsert({ visitorId (unique) → userId })
result         → all prior analytics stay attached to the same visitorId,
                 now attributable to the user. No duplicate users (User upsert by
                 email), no duplicate links (upsert by visitorId), no data loss.
```

`UserVisitorLink.visitorId` is a **soft reference** (no FK) so the **frozen Core
`Visitor` model is untouched**. Multiple devices → multiple links per user.

---

## 4. Provider architecture & registry

Providers are **not hardcoded**. Each is a registration:

```ts
registerAuthProvider({
  id: 'google', name: 'Google', icon: GoogleIcon,
  signInId: 'google',              // passed to next-auth signIn()
  enabled: true, priority: 10,
  featureFlag: 'auth.google',
  supportedPlatforms: ['web','ios','android'],
  permissions: ['openid','email','profile'],
});
```

`<SignInPanel>` renders `getEnabledAuthProviders()`. Adding Microsoft/Apple/
Facebook/OTP/SSO = one `registerAuthProvider(...)` + attaching the NextAuth
provider in `src/lib/auth.ts` (guarded by env). No page redesign.

**Google implementation:** attached in `auth.ts` only when `GOOGLE_CLIENT_ID` +
`GOOGLE_CLIENT_SECRET` are set; the button shows unless
`NEXT_PUBLIC_AUTH_GOOGLE_ENABLED='false'`. Under the JWT strategy (no adapter),
`handleOAuthSignIn` upserts the `User` + `Account` and creates a modular
`UserProfile`.

---

## 5. User model (modular, future-ready)

- `User` (existing) — id, name, email, `password?` (now optional for OAuth), role, image.
- `UserProfile` (new, 1:1) — avatar, language, timezone, marketingOptIn, and JSON
  bags `notificationPrefs` / `privacyPrefs` / `preferences` / `aiProfile` (additive
  without migrations).
- `UserVisitorLink` (new) — visitor↔user merge.
- Future siblings (addresses, orders, loyalty, wishlist) attach to `User` the
  same way — the core row stays lean.

---

## 6. Event bus integration

Published on the platform event bus (`@/modules/core/events`):

| Event | When |
|---|---|
| `auth:login` (core-typed) + `auth:user_login` | session becomes authenticated |
| `auth:account_linked` | visitor merge succeeds |
| `auth:logout` (core-typed) + `auth:user_logout` | session ends |
| `auth:user_register`, `auth:profile_updated`, `auth:provider_connected/disconnected` | reserved (constants in `AUTH_EVENTS`) |

Auth **emits**; AI / analytics / business modules **subscribe** — auth imports
none of them (one-way dependency preserved).

---

## 7. Analytics integration

- Reuses Visitor / Tracking / Cookie Consent / Analytics Events / Event Bus — no
  duplicate tracking logic.
- **Dashboard registration:** `AUTH_ANALYTICS_MODULE` (a plain descriptor) is
  registered by the dashboard's `register-platform-modules.ts` (dashboard → auth,
  one-way). "Authentication" appears in the Analytics sidebar + Overview grid at
  `/jivo-dev/analytics/authentication` with placeholder sections: **Logins,
  Registrations, Provider Usage, Returning Users, Failed Logins, Device Types,
  Countries, Login Timeline**. (Layout only — no charts yet; data lands in a later
  phase via the Core event log + these auth events.)
- This used one **additive** extension to the Phase-4 registry contract: an
  optional `sections?: string[]` field. Existing modules are unaffected.

---

## 8. Security

- **CSRF & OAuth validation** — NextAuth's built-in CSRF token + PKCE/state for
  the Google OAuth flow.
- **Secure cookies** — the existing hardened cookie config (`__Secure-` prefix
  from `AUTH_URL`/`x-forwarded-proto`) is reused unchanged.
- **Replay protection** — OAuth `state`/`nonce`; the visitor merge is an
  idempotent upsert (replays are no-ops).
- **Rate limiting** — credentials login keeps the existing IP failure lockout;
  ingestion endpoints keep Core's per-IP limits.
- **Session validation** — server actions derive `userId` from `auth()`; the
  client can never forge identity (visitorId is validated + only *linked* to the
  authenticated user).
- **No secrets client-side** — Google secret stays server-only; the client sees
  only a public enable flag.
- **MFA-ready** — the provider registry + JWT callbacks leave room for a second
  factor / step-up without redesign.

---

## 9. Future providers

Microsoft · Apple · Facebook · Email OTP · Phone OTP · Enterprise SSO — each is
(1) `registerAuthProvider({...})` for the UI + (2) attach the NextAuth provider
in `auth.ts` (env-guarded). `handleOAuthSignIn` already generalises to any OAuth
provider. No login-page or dashboard changes.

---

## 9.2 Operating modes (Phase 5.2)

The complete Authentication Platform stays implemented; a **single flag** selects
the mode.

### Marketing Website mode (current default)
`AUTH_FEATURES.googleLogin = false` (env `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` unset/≠"true").

- Public site: Cookie Consent + anonymous browsing only. **No Google button, no
  auth prompts, no account menu, no profile, no customer features.**
- `getEnabledAuthProviders()` is empty → `SignInPanel`/`UserMenu` show no provider
  (UserMenu renders nothing without a provider). `/sign-in` still exists but offers
  only "Continue as Guest" (not linked from anywhere).
- Server: the Google provider is **not attached** in `src/lib/auth.ts` (gated by
  the same flag) — no OAuth endpoint is active.
- **Still fully implemented (nothing deleted):** Provider Registry, Google provider
  definition, OAuth persistence (`handleOAuthSignIn`), Visitor Merge, Auth Events,
  Analytics registration + widgets, Capability Registry.

### E-commerce mode (future)
`AUTH_FEATURES.googleLogin = true` — the Google button returns, OAuth attaches,
logins persist + merge visitors, and auth analytics populate. **No code changes.**

### How to enable Google Login
1. Set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` (or change `AUTH_FEATURES.googleLogin`
   to `true` in `config.ts`).
2. Ensure `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set (server).
3. Redeploy. That's it.

### How to enable Customer Features (later)
Flip the relevant `AUTH_FEATURES` flag(s) (`userProfile`, `customerPortal`,
`orders`, `wishlist`, `addresses`, `loyalty`, …) + set the matching capability
`enabled: true` (respecting `dependencies`), then build that feature's UI/route in
a later phase. Flags, capabilities, events, config and DB models are already wired.

> Nothing is hardcoded: every auth affordance (buttons, menu, server provider,
> analytics) is driven by `AUTH_FEATURES` / the registries — flip config, no redesign.

---

## 9.3 Roadmap: Marketing Website → Digital Business Platform

> Documentation only. Describes how the current Marketing Website evolves into a
> full Digital Business Platform by **enabling existing capabilities** — not by
> redesigning anything.

### Current platform — Marketing Website (production mode today)

| Capability | Status |
|---|---|
| Cookie Consent | ✅ Live |
| Visitor Tracking | ✅ Live |
| Analytics Platform | ✅ Live |
| Authentication Infrastructure | ✅ Implemented |
| Google Provider | ⚙️ Implemented, **disabled** (`AUTH_FEATURES.googleLogin = false`) |
| Feature Flag System | ✅ Live |
| Customer Accounts | ❌ Prepared, off |
| Orders | ❌ Prepared, off |
| Wishlist | ❌ Prepared, off |
| Loyalty | ❌ Prepared, off |
| Customer Dashboard | ❌ Prepared, off |

Authentication is **intentionally implemented but disabled**. Guests get Cookie
Consent + anonymous browsing; nothing account-related is visible.

### Future E-commerce Platform

When **shop.jivo.in migrates into jivo.in**, the Authentication Platform simply
**enables existing capabilities** — the registries, flags, events, config and DB
models are already in place.

| Capability | Future status |
|---|---|
| Cookie Consent | ✅ |
| Visitor Tracking | ✅ |
| Analytics | ✅ |
| Google Login | ✅ (flip flag) |
| Customer Accounts | ✅ |
| Wishlist | ✅ |
| Orders | ✅ |
| Addresses | ✅ |
| Notifications | ✅ |
| Loyalty | ✅ |
| AI Personalization | ✅ |
| Recommendation Engine | ✅ |

**No redesign required — only enable feature flags and implement business logic.**

### Future Activation Guide (sequence)

Each step = flip the `AUTH_FEATURES` flag + set the matching capability
`enabled: true` (respecting `dependencies`) + build that step's business logic/UI.
Every capability already has architecture prepared (flag, capability entry, events,
config slot, and — where relevant — a DB model).

```
Phase 1  Enable Google Login        AUTH_FEATURES.googleLogin = true              (+ Google creds)
   ↓
Phase 2  Customer Accounts          userProfile            → cap: user-profile
   ↓
Phase 3  Orders                     orders + customerPortal → cap: customer-portal, orders
   ↓
Phase 4  Wishlist                   wishlist               → cap: wishlist
   ↓
Phase 5  Addresses                  addresses              → cap: addresses
   ↓
Phase 6  Notifications              notifications          → cap: notifications
   ↓
Phase 7  Loyalty                    loyalty                → cap: loyalty
   ↓
Phase 8  AI Personalization         aiProfile              → cap: ai-profile   (+ core PLATFORM_FEATURES.ai)
   ↓
Phase 9  Recommendations            (core PLATFORM_FEATURES.recommendations)    gate with canShowRecommendations()
```

Dependency chain (already encoded in the capability registry):
`user-profile → customer-portal → {orders, wishlist, addresses, loyalty}`;
`user-profile → {notifications, privacy, security, connected-accounts, session-management, ai-profile}`.

### Feature Flag Strategy

- **One source of truth:** `src/modules/platform/auth/config.ts` (`AUTH_FEATURES`,
  `AUTH_CONFIG`). Cross-cutting product flags live in `src/modules/core/config`
  (`PLATFORM_FEATURES`: `ai`, `recommendations`, `ecommerce`, …).
- **Gate, never hardcode:** UI/menus via `getEnabledAuthProviders()` + flags;
  server behaviour via the same flags; features via `isAuthCapabilityEnabled(id)`.
- **Additive rollout:** enabling a flag never breaks a shipped phase; disabling one
  cleanly hides its surface. Ship dark, flip on when ready.

### Business Growth Roadmap

```
Marketing Website ─▶ Accounts ─▶ Commerce (orders/wishlist/addresses)
   (today)               │            │
                         ▼            ▼
                    Engagement ─▶ Loyalty ─▶ AI Personalization + Recommendations
                  (notifications)         (Digital Business Platform)
```

Analytics grows with it automatically: each new area registers its own analytics
module/widgets (per the admin-module convention) into the existing dashboard —
Products, Orders, Loyalty, AI, etc. — with no dashboard redesign.

---

## 9.1 Feature readiness (Phase 5.1)

Infrastructure-only hardening: future capabilities exist behind flags, disabled
until needed. **Public site behaviour is unchanged** (Guest + Google login only;
no profile/account/settings/dashboard).

### Feature flag system — `config.ts` (single source of truth)
```ts
AUTH_FEATURES = {
  googleLogin: true, guestLogin: true,          // live today
  userProfile: false, userPreferences: false, notifications: false, privacy: false,
  security: false, connectedAccounts: false, customerPortal: false, wishlist: false,
  orders: false, addresses: false, loyalty: false, aiProfile: false, sessionManagement: false,
}
isAuthFeatureEnabled('orders')  // → false today
```
Enabling a future feature later = flip ONE flag here. No code changes.

### Authentication configuration — `AUTH_CONFIG`
One place for `features`, `redirects` (afterSignIn/afterSignOut/signIn/adminSignIn),
`session` options, storage keys, and reserved slots for future providers / customer
/ admin config.

### Capability registry — `services/capability-registry.ts`
```ts
registerAuthCapability({ id, name, enabled, featureFlag, dependencies });
isAuthCapabilityEnabled('orders');   // enabled? flag on? all deps enabled? → false today
```
Registered (infrastructure only, **all disabled**): `user-profile`, `user-preferences`,
`notifications`, `privacy`, `security`, `connected-accounts`, `session-management`,
`ai-profile`, `customer-portal`, and `orders`/`wishlist`/`addresses`/`loyalty`
(which depend on `customer-portal`). No UI, no routes.

### Provider registry improvement
`AuthProviderDefinition` gained `futureCapabilities`. Google's `enabled` now derives
from `AUTH_FEATURES.googleLogin` (single source of truth); `featureFlag: 'googleLogin'`.

### Authentication analytics → widgets
The Authentication analytics page no longer uses placeholder `sections`; it lists
**widget ids** rendered by the Analytics Widget Platform. Auth exposes
`AUTH_ANALYTICS_WIDGETS` (data) — the dashboard registers each as a placeholder
widget and lists them (`overview` + `auth-logins`, `auth-registrations`,
`auth-provider-usage`, `auth-returning-users`, `auth-failed-logins`,
`auth-device-types`, `auth-countries`, `auth-login-timeline`). Still placeholder
UI — no real analytics. Auth never imports the dashboard (one-way dependency).

### Future events (architecture only)
`AUTH_EVENTS` gained `PASSWORD_CHANGED`, `MFA_ENABLED`, `ACCOUNT_DELETED`,
`ORDER_CONNECTED`, `LOYALTY_UPDATED` — names reserved on the event bus; no logic.

### Visitor merge (reviewed)
Verified: User upsert by unique email (no duplicate users), `UserVisitorLink`
upsert by unique `visitorId` (no duplicate links / visitors), analytics + sessions
+ events keep their `visitorId` and become attributable to the user (no loss).
Improvement: the client now runs the merge **once per session** (sessionStorage
guard) — reloads no longer re-fire it (the server write was already idempotent).

### How to enable a future feature (no redesign)
1. Set its `AUTH_FEATURES.<flag> = true` in `config.ts`.
2. Set the matching capability `enabled: true` (and ensure its dependencies are on).
3. Build the feature's UI/route/logic in a later phase — the flags/capabilities/
   events/config are already wired.

---

## 10. Architecture improvements (this phase)

- **Reusable identity helpers** — `resolveIdentityStage`, `isAdminRole`,
  `getInitials`, `mergeVisitorIntoUser`, `handleOAuthSignIn`.
- **Provider abstraction** — the registry mirrors the analytics registry pattern
  (consistent, learn-once).
- **Additive registry contract** — optional `sections` on analytics modules
  (backward compatible).
- **No breaking changes** — `password` made optional (safe), new models/relations
  are additive, admin credentials login and all Core modules untouched.

---

## 11. Testing checklist (manual — per staged testing strategy)

| Scenario | Expected |
|---|---|
| Visit `/sign-in` as guest | Panel shows Google + Continue as Guest + benefits + privacy |
| Continue as Guest | Navigates on; analytics keep working anonymously |
| Continue with Google (configured) | OAuth → User + Account upserted; session authenticated |
| After Google login | `auth:login` + `auth:user_login` emitted; `UserVisitorLink` created; `auth:account_linked` emitted |
| Sign out | `auth:logout` + `auth:user_logout` emitted |
| Admin `/jivo-dev/login` (credentials) | Unchanged — still works with role gating |
| Google env absent | Provider simply not attached; no crash; button can be hidden via `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=false` |
| Analytics dashboard | "Authentication" appears in sidebar + Overview; its page shows the 8 placeholder sections |
```
