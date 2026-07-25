// ==========================================================================
// AI Chat Widget configuration — flags + UI defaults. Client-safe (no secrets).
// ==========================================================================

export const CHAT_FEATURES = {
  widget: true,
  launcher: true,
  conversationList: true,
  experienceCards: true,
  suggestedQuestions: true,
  typingIndicator: true,
  messageStatus: true,
  autoScroll: true,
  restoreConversation: true,
  minimize: true,
  themeSupport: true,
  welcomeScreen: true,
  messageActions: true,
  conversationHistory: true,
  launcherPulse: true,
  notificationBadge: true,

  // Prepared UI only — off until wired (Future Ready section).
  streaming: false, // panel is streaming-READY; provider streaming lands later
  fileUpload: false, // attachment UI present, no processing
  voiceInput: false, // voice button placeholder
  screenShare: false,
  shoppingAssistant: false,
  orderTracking: false,
  customerAccount: false,
  virtualizeMessages: true, // windowing for very long conversations
} as const;

export type ChatFeature = keyof typeof CHAT_FEATURES;

export function isChatFeatureEnabled(feature: ChatFeature): boolean {
  return CHAT_FEATURES[feature] === true;
}

export const CHAT_CONFIG = {
  /** Consent category required to run the chat (personalized → PREFERENCES). */
  requiredConsent: 'PREFERENCES' as const,
  /** localStorage keys (client). */
  storage: {
    conversationId: 'jivo.chat.conversationId',
    panelState: 'jivo.chat.panel',
  },
  /** Max chars in the composer. */
  maxInputLength: 2000,
  /** Default opening questions when no plan has run yet. */
  defaultQuestions: [
    'What products do you offer?',
    'Tell me about Jivo',
    'How can I contact you?',
  ],
  /** Welcome-screen suggested questions (6, per spec). */
  welcomeQuestions: [
    'Tell me about Jivo',
    'Which oil is best?',
    'Where can I buy products?',
    'Show certifications',
    'Contact support',
    'Healthy recipes',
  ],
  /** Popular topics shown on the welcome screen. */
  popularTopics: ['Products', 'Wellness', 'Certifications', 'Recipes', 'Support'],
  /** Attachment kinds prepared in the UI (not processed). */
  attachmentTypes: ['Image', 'PDF', 'Document'] as const,
  /** Typing-indicator minimum visible time (ms) — smooths fast responses. */
  typingMinMs: 400,
  brand: {
    title: 'Jivo AI Assistant',
    subtitle: 'Online · typically replies instantly',
    welcomeTitle: 'Hi! I’m your Jivo AI Assistant 👋',
    welcomeSubtitle: 'Ask me about our products, wellness, certifications or anything else.',
  },
} as const;
