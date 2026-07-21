// Future auth capabilities — registered as infrastructure, ALL DISABLED.
// Enabling one later = flip its AUTH_FEATURES flag + set `enabled: true` here.
// No UI, no routes, no logic in this phase.

import { registerAuthCapability } from './capability-registry';

// Account foundation
registerAuthCapability({
  id: 'user-profile',
  name: 'User Profile',
  enabled: false,
  featureFlag: 'userProfile',
  description: 'Profile, avatar and basic account details.',
});
registerAuthCapability({
  id: 'user-preferences',
  name: 'Preferences',
  enabled: false,
  featureFlag: 'userPreferences',
  dependencies: ['user-profile'],
});
registerAuthCapability({
  id: 'notifications',
  name: 'Notifications',
  enabled: false,
  featureFlag: 'notifications',
  dependencies: ['user-profile'],
});
registerAuthCapability({
  id: 'privacy',
  name: 'Privacy Settings',
  enabled: false,
  featureFlag: 'privacy',
  dependencies: ['user-profile'],
});
registerAuthCapability({
  id: 'security',
  name: 'Security (MFA)',
  enabled: false,
  featureFlag: 'security',
  dependencies: ['user-profile'],
});
registerAuthCapability({
  id: 'connected-accounts',
  name: 'Connected Accounts',
  enabled: false,
  featureFlag: 'connectedAccounts',
  dependencies: ['user-profile'],
});
registerAuthCapability({
  id: 'session-management',
  name: 'Session Management',
  enabled: false,
  featureFlag: 'sessionManagement',
  dependencies: ['user-profile'],
});
registerAuthCapability({
  id: 'ai-profile',
  name: 'AI Profile',
  enabled: false,
  featureFlag: 'aiProfile',
  dependencies: ['user-profile'],
});

// Customer portal + commerce
registerAuthCapability({
  id: 'customer-portal',
  name: 'Customer Portal',
  enabled: false,
  featureFlag: 'customerPortal',
  dependencies: ['user-profile'],
});
registerAuthCapability({
  id: 'orders',
  name: 'Orders',
  enabled: false,
  featureFlag: 'orders',
  dependencies: ['customer-portal'],
});
registerAuthCapability({
  id: 'wishlist',
  name: 'Wishlist',
  enabled: false,
  featureFlag: 'wishlist',
  dependencies: ['customer-portal'],
});
registerAuthCapability({
  id: 'addresses',
  name: 'Addresses',
  enabled: false,
  featureFlag: 'addresses',
  dependencies: ['customer-portal'],
});
registerAuthCapability({
  id: 'loyalty',
  name: 'Loyalty',
  enabled: false,
  featureFlag: 'loyalty',
  dependencies: ['customer-portal'],
});
