import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type {
  CoreValuesHeroContent,
  CoreValuesFoundationContent,
  CoreValuesPrinciplesContent,
} from '../types';

// ── Default section content (matches screenshots) ────────────

export const defaultHeroContent: CoreValuesHeroContent = {
  heading: 'ESSENCE IN ACTION',
  subtitle: 'Where values transform into everyday actions that serve humanity.',
  paragraph:
    'These principles are not ideas—they are lived, practiced, and expressed in every action we take.',
  backgroundImage: '',
};

export const defaultFoundationContent: CoreValuesFoundationContent = {
  heading: 'TRUTH AS FOUNDATION',
  backgroundImage: '',
  blocks: [
    {
      label: 'TRUTH',
      description:
        'Truth is the recognition of the fundamental origin and unity in all things and all beings. This guides all actions toward absolute honesty, transparency, and integrity.',
    },
    {
      label: 'DEVOTION',
      description:
        'Work is approached as an expression of Devotion. This means tasks are undertaken selflessly, not for personal ambition, but as an all-inclusive expression of service to humanity. It is understood that in this state of devotion—devoid of self—a far greater intelligence, or grace, finds its expression.',
    },
  ],
};

export const defaultPrinciplesContent: CoreValuesPrinciplesContent = {
  backgroundImage: '',
  blocks: [
    {
      label: 'SEWA (SELFLESS SERVICE)',
      description:
        'All work is an absolute offering. Sewa is the practical, moment-to-moment action of Devotion and the chosen path to realizing the ultimate Truth.',
    },
    {
      label: 'INTELLIGENCE',
      description:
        'Intelligence is Truth manifest. This principle guides the organization to understand the fundamental "why" and "how" (cause and effect) in its work, to learn from facts, and to act with clarity.',
    },
    {
      label: 'INTEGRITY',
      description:
        'Integrity is defined as an absolute and unwavering commitment to the core principles of Truth, Devotion, Sewa, and Intelligence in every decision.',
    },
  ],
};

// ── SEO defaults ─────────────────────────────────────────────

export const defaultSeo = definePageSeo({
  metaTitle: 'Core Values | Our Essence | Jivo Wellness',
  metaDescription:
    'Truth, Devotion, Sewa, Intelligence, Integrity — the five principles that shape every action at Jivo Wellness, where values transform into everyday service to humanity.',
  keywords: [
    'jivo core values',
    'jivo essence',
    'truth devotion sewa',
    'sewa selfless service',
    'intelligence integrity',
    'jivo wellness values',
    'wellness values india',
    'essence in action',
    'truth as foundation',
    'value-based business',
  ],
  ogTitle: 'Our Core Values — Essence in Action',
  ogDescription:
    'Truth, Devotion, Sewa, Intelligence, Integrity — the principles behind every action at Jivo.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/our-essence/core-values`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'AboutPage',
    name: 'Core Values of Jivo Wellness',
    url: `${SITE_URL}/our-essence/core-values`,
    description:
      'The five core values — Truth, Devotion, Sewa, Intelligence, and Integrity — that guide every action at Jivo Wellness.',
  },
});
