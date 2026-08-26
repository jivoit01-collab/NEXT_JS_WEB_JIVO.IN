// ── Section 1: Hero ──────────────────────────────────────────
export interface PrivacyHeroContent {
  /** Wordmark/logo lockup shown centered on top. */
  logoImage: string;
  heading: string;
  /** Short intro paragraph under the heading. */
  intro: string;
  /** Illustration shown on the right. */
  image: string;
}

// ── Section 2: Body (repeatable heading + paragraph blocks) ──
export interface PrivacyBlock {
  heading: string;
  /** Body copy; blank lines separate paragraphs. */
  body: string;
}

export interface PrivacyBodyContent {
  blocks: PrivacyBlock[];
}

// ── Section registry ─────────────────────────────────────────
export type PrivacyPolicySectionKey = 'hero' | 'body';

export interface PrivacyPolicySectionRow {
  id: string;
  section: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
