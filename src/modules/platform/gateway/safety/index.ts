// ==========================================================================
// Gateway Safety & Intent — a small, PURE classifier that runs BEFORE any
// knowledge retrieval or provider call.
//
//   question (+ conversation state) → { security, intent, entity, language }
//
// It exists because two things must never depend on the LLM behaving well:
//
//  1. SECURITY. Requests for credentials, admin routes, env vars or the system
//     prompt are refused deterministically here. Gemini is never asked, so a
//     jailbreak ("ignore previous instructions") has nothing to subvert.
//  2. PUBLIC URL SAFETY. `isPublicUrl` gates every URL on its way to the UI, so
//     an internal path that somehow reached a Knowledge document cannot leak.
//
// No I/O, no Prisma, no RNG — safe to unit-test and to call on every turn.
// ==========================================================================

/** What the classifier decided about a turn. */
export interface TurnClassification {
  /** True when the question targets confidential/internal information. */
  security: boolean;
  /**
   * The turn's routed intent. Decided by deterministic rules — never by the LLM —
   * so the UI is predictable and cheap to compute.
   *
   *  security     → PRIVATE_ADMIN: refuse before retrieval
   *  purchase     → PURCHASE: send to the shop
   *  contact      → CONTACT: verified CMS contact details
   *  product_page → PRODUCT: that product's page
   *  all_products → PAGE_NAVIGATION for the range
   *  company      → COMPANY: about/essence pages, never products
   *  conversation → CONVERSATION: answer from chat history, not Knowledge
   *  general      → PUBLIC_KNOWLEDGE / UNKNOWN
   */
  intent:
    | 'security'
    | 'purchase'
    | 'contact'
    | 'product_page'
    | 'all_products'
    | 'company'
    | 'conversation'
    | 'social'
    | 'general';
  /** Product/topic slug the turn is about, resolved from context when implied. */
  entity: string | null;
  /** Language instruction to pass to the prompt (e.g. "Hinglish"). */
  language: string | null;
  /** True when the question used a pronoun that we resolved from context. */
  usedContext: boolean;
}

// ── 1) Security ──────────────────────────────────────────────
// Matched against the QUESTION only. Deliberately broad: a false positive costs
// one polite refusal, a false negative could leak a credential.
const SECURITY_PATTERNS: readonly RegExp[] = [
  /\b(admin|administrator)\b.*\b(url|link|page|panel|dashboard|login|route|portal|access)\b/i,
  /\b(url|link|page|panel|dashboard|login|route|portal)\b.*\badmin\b/i,
  /\b(password|passwd|credential|credentials|username and password)\b/i,
  /\bapi[\s_-]?key\b|\bgemini[\s_-]?api\b|\bsecret[\s_-]?key\b|\baccess[\s_-]?token\b/i,
  // "your secrets" / "the secret key", but NOT "the secret to good cooking oil".
  /\b(your|the|any|all|list|reveal|show)\s+secrets\b/i,
  /\bsecret\b(?!\s+(to|of|behind|ingredient|recipe|sauce))/i,
  /\b(database|db)\b.*\b(url|password|credential|connection|string|user)\b/i,
  /\bdatabase_url\b|\bconnection string\b/i,
  /\benv(ironment)?\b.*\b(variables?|vars?|file|config)\b|\.env\b/i,
  /\b(system|hidden|internal)\b.*\b(prompt|instruction|rule)s?\b/i,
  /\bprompt\b.*\b(show|reveal|print|repeat|display)\b|\b(show|reveal|print|repeat)\b.*\bprompt\b/i,
  /\bignore (all |your |the )?(previous|prior|above)\b/i,
  /\b(jwt|session token|auth token|bearer token|cookie)s?\b/i,
  /\b(source code|codebase|server path|file path|directory listing)\b/i,
  /\b(jivo-dev|\/admin)\b/i,
  /\bhow (are|is) (you|the site|it) (built|authenticated|secured)\b/i,
  /\b(sql|prisma)\b.*\b(query|schema|dump)\b/i,
];

/** The security refusal. Deliberately NOT "I don't have that information" —
 *  this is a refusal to disclose, not a gap in knowledge. */
export const SECURITY_REFUSAL =
  "I can help with public Jivo information, products, support, and purchasing, but I can't provide private or administrative access details.";

export function isSecurityRequest(question: string): boolean {
  return SECURITY_PATTERNS.some((re) => re.test(question));
}

// ── 2) Public URL allowlist ──────────────────────────────────
/** Path prefixes that must never reach a visitor, wherever they came from. */
const BLOCKED_PATH_PATTERNS: readonly RegExp[] = [
  /^\/jivo-dev(\/|$)/i,
  /^\/admin(\/|$)/i,
  /^\/api(\/|$)/i,
  /^\/sign-in(\/|$)/i,
  /^\/sign-up(\/|$)/i,
  /^\/auth(\/|$)/i,
  /^\/dashboard(\/|$)/i,
  /^\/_next(\/|$)/i,
];

/** External hosts the assistant may link to. */
const ALLOWED_EXTERNAL_HOSTS: readonly string[] = [
  'shop.jivo.in',
  'jivo.in',
  'www.jivo.in',
  'instagram.com',
  'www.instagram.com',
  'facebook.com',
  'www.facebook.com',
  'youtube.com',
  'www.youtube.com',
  'linkedin.com',
  'www.linkedin.com',
];

/**
 * Is this URL safe to show a visitor?
 *
 * Internal paths are checked against the blocked-prefix list; absolute URLs must
 * be on an allowlisted host. Anything unparseable is refused — the safe default.
 */
export function isPublicUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const value = url.trim();
  if (!value) return false;

  // Relative CMS path.
  if (value.startsWith('/')) {
    const path = value.split(/[?#]/)[0] ?? value;
    return !BLOCKED_PATH_PATTERNS.some((re) => re.test(path));
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const host = parsed.hostname.toLowerCase();
      if (!ALLOWED_EXTERNAL_HOSTS.includes(host)) return false;
      return !BLOCKED_PATH_PATTERNS.some((re) => re.test(parsed.pathname));
    } catch {
      return false;
    }
  }

  // mailto:/tel: are contact affordances, not navigation.
  if (/^(mailto|tel):/i.test(value)) return true;

  return false;
}

// ── 3) Products (registry-driven, not hardcoded conditionals) ──
/**
 * Known product entities and the keywords that name them. This is a small
 * lookup table, not per-question `if` branches: adding a product is one row and
 * every intent/context rule keeps working.
 */
export interface ProductEntity {
  key: string;
  label: string;
  keywords: readonly string[];
}

// Keywords include NATIVE-SCRIPT spellings so a Hindi/Devanagari question still
// resolves to the right product — the Knowledge base is English, so the entity is
// what lets us retrieve the correct documents for a foreign-language question.
export const PRODUCT_ENTITIES: readonly ProductEntity[] = [
  { key: 'canola', label: 'Jivo Canola Oil', keywords: ['canola', 'कैनोला', 'कनोला'] },
  { key: 'olive', label: 'Jivo Olive Oil', keywords: ['olive', 'ऑलिव', 'जैतून'] },
  { key: 'mustard', label: 'Jivo Mustard Oil', keywords: ['mustard', 'kachi ghani', 'सरसों', 'कच्ची घानी'] },
  { key: 'groundnut', label: 'Jivo Groundnut Oil', keywords: ['groundnut', 'peanut', 'मूंगफली'] },
];

/** The product explicitly named in a piece of text, if any. */
export function findProductEntity(text: string): ProductEntity | null {
  const t = text.toLowerCase();
  return PRODUCT_ENTITIES.find((p) => p.keywords.some((k) => t.includes(k))) ?? null;
}

// ── 4) Intent ────────────────────────────────────────────────
const PURCHASE_PATTERNS: readonly RegExp[] = [
  /\bwhere\b.*\b(buy|purchase|order|get|available|find)\b/i,
  /\bhow\b.*\b(buy|purchase|order|get)\b/i,
  /\b(buy|purchase|order)\b/i,
  /\bis it available\b|\bin stock\b|\bavailability\b/i,
  /\bi want (to buy|this|it)\b/i,
  /\badd to cart\b|\bcheckout\b|\bshop\b/i,
];

const ALL_PRODUCTS_PATTERNS: readonly RegExp[] = [
  /\b(what|which)\b.*\bproducts?\b.*\b(offer|have|sell|available)\b/i,
  /\ball (of your |your )?products\b/i,
  /\bproduct (range|list|catalogue|catalog|line)\b/i,
  /\b(show|see|view|go to)\b.*\bproducts?\b/i,
  /\bwhat do you (sell|offer)\b/i,
];

const CONTACT_PATTERNS: readonly RegExp[] = [
  /\bcontact\b|\bphone\b|\btelephone\b|\bmobile number\b/i,
  /\bemail\b|\be-?mail\b/i,
  /\baddress\b|\blocated\b|\blocation\b|\boffice\b/i,
  /\bsupport\b|\bcustomer (care|service)\b|\bhelpline\b/i,
  /\breach (you|your team|out)\b|\btalk to\b/i,
];

/**
 * COMPANY questions — about Jivo itself (mission, story, founder, values).
 * Routed away from products so "who is the founder?" never answers with an oil.
 */
const COMPANY_PATTERNS: readonly RegExp[] = [
  /\b(founder|founded|who started|owner|ceo|chairman|leadership)\b/i,
  /\b(mission|vision|motive|purpose|values?|philosophy|ethos|belief)\b/i,
  /\b(about|story|history|journey|heritage|legacy|background)\b.*\bjivo\b/i,
  /\bjivo\b.*\b(about|story|history|journey|motive|mission|vision|values?)\b/i,
  /\b(essence|capital|social initiative|fair share|mother earth|baru sahib)\b/i,
  /\b(company|brand|organisation|organization)\b/i,
  /\bmotive\b|\bmaqsad\b|\budeshya\b/i,
];

/**
 * CONVERSATION questions — about this chat itself (how long we've talked, what
 * was said). These must be answered from conversation data, never Knowledge.
 */
const CONVERSATION_PATTERNS: readonly RegExp[] = [
  /\b(this|our|the)\s+(chat|conversation|session)\b/i,
  /\bhow (long|many|much)\b.*\b(chat|chatting|talk|talking|conversation|messages?|been)\b/i,
  /\b(time|minutes?|hours?)\b.*\b(chat|chatting|talking|conversation)\b/i,
  /\b(what|which)\b.*\b(i|we)\s+(asked|said|discussed|talked about)\b/i,
  /\b(my|our)\s+(first|last|previous)\s+(question|message)\b/i,
  /\bwhat did (i|we|you) (say|ask)\b/i,
  /\bsummar(ise|ize)\b.*\b(chat|conversation)\b/i,
];

/** SOCIAL questions — where to follow Jivo. Answered from footer social links. */
const SOCIAL_PATTERNS: readonly RegExp[] = [
  /\b(instagram|insta|facebook|youtube|linkedin|twitter)\b/i,
  /\bsocial (media|links?|handles?|profiles?|channels?)\b/i,
  /\b(follow|following)\b.*\b(you|jivo|us)\b/i,
  /\bwhere can i (follow|find) (you|jivo|us)\b/i,
  /\b(handle|profile|page)\b.*\b(instagram|facebook|youtube|linkedin)\b/i,
];

/** Pronouns that mean "the thing we were just discussing". */
const PRONOUN_PATTERN =
  /\b(it|its|it's|this|that|these|those|the same|this one|this product|that product|this oil|that oil)\b/i;

/**
 * Follow-ups that carry no noun at all ("tell me more", "and the price?").
 * They too must inherit the active entity, otherwise the conversation resets to
 * a generic answer mid-thread.
 */
const CONTINUATION_PATTERN =
  /^\s*(tell me more|more details?|more info(rmation)?|go on|continue|and\??|what else|explain more|elaborate|ab hinglish|aur bata)/i;

// ── 5) Language ──────────────────────────────────────────────
/**
 * An explicit language request ("answer in Hinglish"), or Hinglish detected from
 * romanised Hindi in the question itself. Returning null means "keep whatever
 * the conversation was already using".
 */
const HINGLISH_MARKERS =
  /\b(hinglish|batao|bataiye|kya|kaise|kaha|kahan|mein|hai|hain|karo|kijiye|chahiye|ke baare|acha|thik|nahi|nahin|mujhe|aap|bata)\b/i;

const HINGLISH = 'Hinglish (simple Hindi written in Latin script, mixed with English)';

/**
 * Explicit "answer in X" requests. Hinglish is special-cased because it is a
 * romanised mix rather than a script, so it cannot be detected from characters.
 * Everything else is matched by NAME, which keeps the list open-ended: any
 * language Gemini can write is supported by naming it.
 */
const NAMED_LANGUAGES: readonly (readonly [RegExp, string])[] = [
  [/\bhinglish\b/i, HINGLISH],
  [/\b(hindi|हिंदी|हिन्दी)\b/i, 'Hindi'],
  [/\b(english|अंग्रे?ज़ी)\b/i, 'English'],
  [/\b(marathi|मराठी)\b/i, 'Marathi'],
  [/\b(gujarati|ગુજરાતી)\b/i, 'Gujarati'],
  [/\b(punjabi|panjabi|ਪੰਜਾਬੀ)\b/i, 'Punjabi'],
  [/\b(bengali|bangla|বাংলা)\b/i, 'Bengali'],
  [/\b(tamil|தமிழ்)\b/i, 'Tamil'],
  [/\b(telugu|తెలుగు)\b/i, 'Telugu'],
  [/\b(kannada|ಕನ್ನಡ)\b/i, 'Kannada'],
  [/\b(malayalam|മലയാളം)\b/i, 'Malayalam'],
  [/\b(urdu|اردو)\b/i, 'Urdu'],
  [/\b(arabic|العربية)\b/i, 'Arabic'],
  [/\b(spanish|espa[ñn]ol)\b/i, 'Spanish'],
  [/\b(french|fran[çc]ais)\b/i, 'French'],
  [/\b(german|deutsch)\b/i, 'German'],
  [/\b(portuguese|portugu[êe]s)\b/i, 'Portuguese'],
  [/\b(japanese|日本語)\b/i, 'Japanese'],
  [/\b(chinese|mandarin|中文)\b/i, 'Chinese'],
];

/** A request to switch language, e.g. "in Hindi", "हिंदी में बताओ", "reply in Tamil". */
const SWITCH_REQUEST = /\b(in|mein|me|answer|reply|respond|speak|tell|batao|bataiye)\b|में|में\s*बताओ/i;

/**
 * Script detection — the most reliable signal, since a question WRITTEN in a
 * script should be answered in that language without anyone asking.
 */
const SCRIPTS: readonly (readonly [RegExp, string])[] = [
  [/[ঀ-৿]/, 'Bengali'],
  [/[਀-੿]/, 'Punjabi'],
  [/[઀-૿]/, 'Gujarati'],
  [/[஀-௿]/, 'Tamil'],
  [/[ఀ-౿]/, 'Telugu'],
  [/[ಀ-೿]/, 'Kannada'],
  [/[ഀ-ൿ]/, 'Malayalam'],
  [/[؀-ۿ]/, 'Urdu'],
  [/[぀-ヿ]/, 'Japanese'],
  [/[一-鿿]/, 'Chinese'],
  // Devanagari last: Hindi and Marathi share it, and Hindi is the common case.
  [/[ऀ-ॿ]/, 'Hindi'],
];

/**
 * Resolve the language for a turn.
 *
 * Order matters: an explicit request ("अब Hinglish में बताओ") must win over the
 * script the request itself is written in, otherwise asking for Hinglish in
 * Devanagari would be read as a request for Hindi.
 *
 * Returns null when nothing indicates a language — the caller then keeps whatever
 * the conversation was already using.
 */
export function detectLanguage(question: string): string | null {
  // 1) Explicitly named language, when phrased as a request.
  for (const [re, language] of NAMED_LANGUAGES) {
    if (re.test(question) && SWITCH_REQUEST.test(question)) return language;
  }
  // 2) Non-Latin script in the question itself.
  for (const [re, language] of SCRIPTS) {
    if (re.test(question)) return language;
  }
  // 3) A bare language name with no request verb ("hinglish").
  for (const [re, language] of NAMED_LANGUAGES) {
    if (re.test(question)) return language;
  }
  // 4) Romanised Hindi markers → Hinglish.
  if (HINGLISH_MARKERS.test(question)) return HINGLISH;
  return null;
}

// ── 6) The classifier ────────────────────────────────────────
export interface ClassifyInput {
  question: string;
  /** `ConversationState.currentTopic` — the last product/topic discussed. */
  previousEntity?: string | null;
  /** `ConversationState.currentIntent` — carries the sticky language. */
  previousLanguage?: string | null;
}

/**
 * Classify one turn. Security wins over everything; otherwise the intent decides
 * which link the Experience layer should offer, and the entity is resolved from
 * conversation state when the user said "it".
 */
export function classifyTurn(input: ClassifyInput): TurnClassification {
  const q = input.question;

  if (isSecurityRequest(q)) {
    return { security: true, intent: 'security', entity: null, language: null, usedContext: false };
  }

  // Entity: explicitly named wins; otherwise a pronoun inherits the previous one.
  const named = findProductEntity(q);
  // A pronoun, a bare continuation ("tell me more"), or a pure language-switch
  // request ("हिंदी में बताओ" — a language name and nothing else) all inherit the
  // active entity: they re-ask the SAME question, only differently worded.
  const languageOnly =
    Boolean(detectLanguage(q)) && !findProductEntity(q) && q.trim().split(/\s+/).length <= 5;
  const refersBack = PRONOUN_PATTERN.test(q) || CONTINUATION_PATTERN.test(q) || languageOnly;
  const entity = named?.key ?? (refersBack ? (input.previousEntity ?? null) : null);
  const usedContext = !named && refersBack && Boolean(input.previousEntity);

  // Language: an explicit request sticks until changed.
  const language = detectLanguage(q) ?? input.previousLanguage ?? null;

  // Intent. Purchase is checked BEFORE the generic product/navigation rules so
  // "where can I buy it?" never resolves to a product information page.
  const askedAllProducts = ALL_PRODUCTS_PATTERNS.some((re) => re.test(q));
  const isPurchase = PURCHASE_PATTERNS.some((re) => re.test(q));

  // Order matters — most specific wins:
  //  conversation ("how long have we chatted") is about the chat, not the brand;
  //  purchase beats product, so "where can I buy it" goes to the shop;
  //  company beats product, so "who founded Jivo" isn't answered with an oil.
  const isConversation = CONVERSATION_PATTERNS.some((re) => re.test(q));
  const isSocial = SOCIAL_PATTERNS.some((re) => re.test(q));
  const isCompany = COMPANY_PATTERNS.some((re) => re.test(q));

  let intent: TurnClassification['intent'] = 'general';
  if (isConversation) intent = 'conversation';
  else if (isSocial) intent = 'social';
  else if (isPurchase) intent = 'purchase';
  else if (CONTACT_PATTERNS.some((re) => re.test(q))) intent = 'contact';
  else if (askedAllProducts) intent = 'all_products';
  else if (isCompany && !named) intent = 'company';
  else if (entity) intent = 'product_page';

  // A company question is NOT about a product, so drop any entity inherited from
  // earlier in the conversation — otherwise "who is the founder?" after a Canola
  // question would still surface the Canola card.
  const finalEntity =
    intent === 'company' || intent === 'conversation' || intent === 'social' ? null : entity;

  return {
    security: false,
    intent,
    entity: finalEntity,
    language,
    usedContext: usedContext && finalEntity !== null,
  };
}

/** Resolve a classification to the product's display label, for prompt context. */
export function entityLabel(key: string | null): string | null {
  if (!key) return null;
  return PRODUCT_ENTITIES.find((p) => p.key === key)?.label ?? null;
}
