// ==========================================================================
// AI Response configuration — flags + thresholds. Client-safe.
// ==========================================================================

export const RESPONSE_FEATURES = {
  validation: true,
  normalization: true,
  markdownParsing: true,
  citationExtraction: true,
  entityExtraction: true,
  linkExtraction: true,
  actionExtraction: true,
  leadDetection: true,
  contactDetection: true,

  // Prepared, off until consumed.
  sentiment: false,
  languageDetection: false,
  toxicityFilter: false,
} as const;

export type ResponseFeature = keyof typeof RESPONSE_FEATURES;

export function isResponseFeatureEnabled(feature: ResponseFeature): boolean {
  return RESPONSE_FEATURES[feature] === true;
}

export const RESPONSE_CONFIG = {
  /** Below this char length a response is flagged as suspiciously short. */
  minLength: 2,
  /** Above this a response is flagged (possible runaway). */
  maxLength: 20_000,
  /** Max blocks kept (guards pathological output). */
  maxBlocks: 200,
  /** Lead score at/above which `isLead` is true. */
  leadThreshold: 0.5,
  /** Max suggested actions returned. */
  maxActions: 4,
  /** Your site origin — links to it are treated as internal. */
  internalHosts: ['jivo.in', 'www.jivo.in', 'localhost'],
} as const;

/** Intent keyword sets that drive lead + contact detection (order-independent). */
export const INTENT_KEYWORDS = {
  buying: ['buy', 'price', 'cost', 'order', 'purchase', 'quote', 'pricing', 'discount', 'available', 'in stock'],
  contact: ['contact', 'call me', 'reach me', 'get in touch', 'email me', 'connect', 'representative', 'sales team'],
  consultation: ['consult', 'consultation', 'appointment', 'book', 'schedule', 'demo', 'meeting'],
  subscribe: ['subscribe', 'newsletter', 'updates', 'notify me'],
} as const;
