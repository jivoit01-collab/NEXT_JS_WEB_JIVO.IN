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
  /**
   * When the model omits [n] markers, how many retrieved documents to treat as
   * citations instead. Small on purpose: enough for one or two real page links,
   * not a dump of every document that was retrieved.
   */
  maxFallbackCitations: 3,
  /** Your site origin — links to it are treated as internal. */
  internalHosts: ['jivo.in', 'www.jivo.in', 'localhost'],
} as const;

/** Intent keyword sets that drive lead + contact detection (order-independent). */
export const INTENT_KEYWORDS = {
  buying: ['buy', 'price', 'cost', 'order', 'purchase', 'quote', 'pricing', 'discount', 'available', 'in stock'],
  // Includes the ways people ASK FOR contact details ("what is your phone
  // number", "your email", "where are you located") — not just requests to be
  // contacted. Without these the Contact card never renders for the most direct
  // contact questions of all.
  contact: [
    'contact', 'call me', 'reach me', 'reach you', 'get in touch', 'email me', 'connect',
    'representative', 'sales team', 'phone number', 'phone', 'telephone', 'mobile number',
    'email', 'email address', 'address', 'located', 'location', 'office', 'helpline',
    'customer care', 'support team', 'talk to',
  ],
  consultation: ['consult', 'consultation', 'appointment', 'book', 'schedule', 'demo', 'meeting'],
  subscribe: ['subscribe', 'newsletter', 'updates', 'notify me'],
} as const;
