// ==========================================================================
// Abuse moderation — a cheap, deterministic guard that runs BEFORE Gemini.
//
// It is intentionally NOT an AI call: abuse detection must be instant, free and
// predictable, and a blocked visitor must not consume any AI tokens at all.
//
// Detection normalises the message first (case, spacing, leetspeak, repeated
// letters) so common obfuscations — "f*ck", "fuuuck", "b.e.n.c.h.o.d" — collapse
// onto the same base form as the plain spelling. Matching is then done on WORD
// BOUNDARIES so ordinary words that merely contain a rude substring (classic
// "Scunthorpe" false positives such as "assessment" or "grass") are not flagged.
//
// Pure: no I/O, no Prisma, no RNG. Strike storage lives in the caller.
// ==========================================================================

/** Strikes allowed before a visitor is blocked. Configurable per deployment. */
export const MAX_ABUSE_STRIKES = Number(process.env.MAX_ABUSE_STRIKES ?? 5);

/**
 * Abusive terms across the languages this site serves. Kept as BASE forms —
 * normalisation handles the variants, so this list stays short and reviewable.
 */
const ABUSIVE_TERMS: readonly string[] = [
  // English
  'fuck', 'fucker', 'fucking', 'shit', 'bitch', 'bastard', 'asshole', 'arsehole',
  'cunt', 'dick', 'prick', 'slut', 'whore', 'motherfucker', 'retard', 'idiot',
  'stupid', 'moron', 'dumbass', 'jackass', 'douche', 'nigger', 'faggot',
  // Hindi / Hinglish (romanised)
  'chutiya', 'chutiye', 'bhenchod', 'behenchod', 'benchod', 'madarchod',
  'bhosdi', 'bhosdike', 'gandu', 'gaandu', 'harami', 'kamina', 'kamine',
  'kutta', 'kutte', 'kutiya', 'saala', 'saale', 'randi', 'lund', 'lauda',
  'chod', 'chodu', 'jhaat', 'tatti', 'gaand',
  // Devanagari
  'चूतिया', 'भोसड़ी', 'मादरचोद', 'बहनचोद', 'गांडू', 'हरामी', 'कमीना', 'रंडी',
  // Punjabi (Gurmukhi + romanised)
  'ਕੰਜਰ', 'ਭੈਣਚੋਦ', 'kanjar', 'pen di', 'penchod',
];

/** Insulting phrases aimed at the assistant — abusive without a single slur. */
const ABUSIVE_PHRASES: readonly RegExp[] = [
  /\byou (are|r) (so )?(useless|worthless|garbage|trash|pathetic|stupid|dumb)\b/i,
  /\bshut ?up\b/i,
  /\bget lost\b/i,
  /\b(kill|hurt) (yourself|urself)\b/i,
];

/** Leetspeak and lookalike substitutions used to dodge naive filters. */
const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i',
};

/**
 * Collapse a message to a comparable base form:
 *  lowercase → leet substitution → strip separators inside words
 *  ("f.u.c.k" → "fuck") → squeeze letter runs ("fuuuck" → "fuck").
 */
function normalize(text: string): string {
  const lowered = text.toLowerCase();
  const deLeet = lowered.replace(/[01345 7@$!]/g, (ch) => LEET[ch] ?? ch);
  // Remove punctuation used to break words apart, keeping spaces as separators.
  const deSeparated = deLeet.replace(/[.\-_*+~^|/\\]/g, '');
  // Squeeze runs of 3+ identical letters down to two, then to one for matching.
  return deSeparated.replace(/(.)\1{2,}/g, '$1');
}

/** Word-boundary matcher, so "grass" never trips on "ass". */
function containsTerm(haystack: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // \b is unreliable for non-Latin scripts, so those match on substring.
  const isLatin = /^[\x20-\x7f]+$/.test(term);
  const re = isLatin ? new RegExp(`\\b${escaped}s?\\b`, 'i') : new RegExp(escaped, 'i');
  return re.test(haystack);
}

export interface ModerationResult {
  /** True when the message is abusive. */
  abusive: boolean;
  /** The matched base term — for logging/analytics, never shown to the user. */
  matched: string | null;
}

/** Is this message abusive? Deterministic, and cheap enough to run every turn. */
export function moderate(message: string): ModerationResult {
  const raw = message.trim();
  if (!raw) return { abusive: false, matched: null };

  for (const re of ABUSIVE_PHRASES) {
    if (re.test(raw)) return { abusive: true, matched: 'phrase' };
  }

  const normalized = normalize(raw);
  // Also compare with spaces removed, catching "b h e n c h o d".
  const collapsed = normalized.replace(/\s+/g, '');
  for (const term of ABUSIVE_TERMS) {
    const base = normalize(term);
    if (containsTerm(normalized, base)) return { abusive: true, matched: term };

    // Vowel-masked spellings ("f*ck", "ch*tiya"). Compared per WORD and only
    // when the word is roughly the term's length — a loose substring test here
    // matches ordinary words ("where" → whr ≈ "whore", "analysis" → slt ≈
    // "slut") and would block real customers, which is far worse than a miss.
    const skeleton = base.replace(/\s+/g, '').replace(/[aeiou]/g, '');
    if (skeleton.length >= 3 && /^[\x20-\x7f]+$/.test(base)) {
      // Read masking characters from the ORIGINAL text; `normalize` strips them.
      const masked = raw.toLowerCase().match(/[a-z*@$!]+/g) ?? [];
      for (const word of masked) {
        if (!/[*@$!]/.test(word)) continue; // only genuinely masked words
        const wordSkeleton = word.replace(/[*@$!]/g, '').replace(/[aeiou]/g, '');
        if (wordSkeleton === skeleton) return { abusive: true, matched: term };
      }
    }
    // Space-stripped comparison needs a substring test; only apply it to terms
    // long enough that an accidental match is implausible.
    if (base.length >= 5 && collapsed.includes(base.replace(/\s+/g, ''))) {
      return { abusive: true, matched: term };
    }
  }

  return { abusive: false, matched: null };
}

/** Escalating, respectful warnings. The visitor is told where the line is. */
export function warningFor(strikes: number): string {
  const remaining = Math.max(0, MAX_ABUSE_STRIKES - strikes);
  if (remaining <= 1) {
    return "I'd like to keep helping you, but I can't continue with language like that. One more message like this and this chat will be paused.";
  }
  return "Let's keep things respectful, please. I'm happy to help with Jivo products, orders and support.";
}

/** Shown once the visitor is blocked. */
export const BLOCKED_MESSAGE =
  "This chat has been paused because of repeated inappropriate messages. If you need help, please contact our team and we'll be glad to assist you.";
