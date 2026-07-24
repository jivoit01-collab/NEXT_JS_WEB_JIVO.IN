export {
  readStoredConsent,
  writeStoredConsent,
  clearStoredConsent,
  getOrCreateVisitorId,
  getOrCreateSessionId,
} from './storage';
export {
  recordConsent,
  fetchServerConsent,
  identifyVisitor,
  startSession,
  endSession,
  sendEvent,
  type ServerConsent,
  type VisitorIdentifyPayload,
  type EventPayload,
} from './consent-api';
