// Importing this registers the core providers (side effect), then exposes the
// registry API. Client-safe: the OAuth/identity server helpers are NOT exported
// here (import them directly from their files in server code) so this stays
// importable from client UI without pulling `server-only` modules.

import './register-core-providers';
import './register-core-capabilities';

export {
  registerAuthProvider,
  getAuthProviders,
  getEnabledAuthProviders,
  getAuthProvider,
} from './provider-registry';

export {
  registerAuthCapability,
  getAuthCapability,
  getAuthCapabilities,
  isAuthCapabilityEnabled,
} from './capability-registry';
