import type { ProductCategory, ValuePillar, HeroSlideData } from '../types';

/**
 * Default content shown when:
 *   - the DB hasn't been seeded yet, or
 *   - a section row is missing/inactive, or
 *   - a stored image URL no longer resolves.
 *
 * IMPORTANT: every URL here must point to a file that exists on disk in
 * `/public/`. If you reference a missing file, the public page will render
 * a broken image. The `placeholder.jpg` is the safe always-exists default.
 */
const PLACEHOLDER = '/images/placeholder.jpg';

export const heroContent = {
  logo: PLACEHOLDER,
  backgroundImage: PLACEHOLDER,
  headline: 'LET NATURE RECLAIM YOU',
  subtitle:
    'The Heartbeat of Jivo — pure, honest products born from a mission of wellness and service.',
};

// Default carousel slides (sort order starts at 1 — hero section is slide 0)
export const defaultHeroSlides: HeroSlideData[] = [
  {
    id: 'default-1',
    backgroundImage: PLACEHOLDER,
    headline: 'SMALL MOMENTS OF JOY',
    subtitle: "India's largest seller of cold press canola oil. India's first patented wheatgrass product.",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'default-2',
    backgroundImage: PLACEHOLDER,
    headline: 'LEADING THE WAY TOUCHING LIVES',
    subtitle: 'A pure brand, built on the values of service — Bringing goodness from India for all of humanity.',
    sortOrder: 2,
    isActive: true,
  },
];

export const productCategories: ProductCategory[] = [
  {
    name: 'Cooking Oil',
    image: PLACEHOLDER,
    href: '/products?category=cooking-oil',
    bgColor: 'bg-jivo-green',
  },
  {
    name: 'Wheatgrass Juice',
    image: PLACEHOLDER,
    href: '/products?category=wheatgrass-juice',
    bgColor: 'bg-jivo-sage',
  },
  {
    name: 'Water',
    image: PLACEHOLDER,
    href: '/products?category=water',
    bgColor: 'bg-jivo-blue',
  },
  {
    name: 'Super Foods',
    image: PLACEHOLDER,
    href: '/products?category=super-foods',
    bgColor: 'bg-jivo-maroon',
  },
];

export const visionMissionContent = {
  backgroundImage: PLACEHOLDER,
  heading: 'LET NATURE RECLAIM YOU',
  subtitle: 'Our foundation is truth, our motive is service.',
  intro:
    'Jivo exists to prove that business can be a pure expression of service. Every product we make and every decision we take is guided by this single idea: wellness is a duty, not a market.',
  vision:
    'To create a world where wellness is accessible to all — through products rooted in truth, purity, and a deep respect for nature. Jivo envisions a future where every individual can reclaim their health and vitality through honest, natural solutions.',
  mission:
    'To serve humanity by offering the very best wellness products and services, crafted with integrity and guided by the principles of Truth, Devotion, and Sewa. Every Jivo product is a step toward universal well-being.',
};

export const productsFoundationContent = {
  productImage: PLACEHOLDER,
  section1: {
    heading: 'Our Products Are Our Service',
    paragraphs: [
      "For us, \"wellness\" is not a marketing category — it is the very core of our mission. Our commitment is to offer the \"very best\" products and services that contribute to health and well-being. This is not a business strategy; it is a direct expression of our core principle.",
      "Truth & Integrity: We are committed to absolute honesty and transparency about our products. Intelligence: We are guided by facts and a deep understanding of why and how our products contribute to wellness, ensuring we act with clarity and effectiveness.",
      "When you choose a Jivo product, you are choosing something created with an unwavering commitment to quality and integrity, because its very purpose is to serve you.",
    ],
  },
  section2: {
    heading: 'Our Foundation is Built on Values, Not Ambition',
    paragraphs: [
      "Our entire organization is designed to be a high-speed, effective vehicle for \"Sewa.\" Our operating principles are not posters on a wall, they are the guidelines for every decision we make.",
      "Truth: Recognition of unity and a commitment to absolute honesty.",
      "Sewa: All our work is seen as an offering, a path to realizing the ultimate Truth.",
      "This requires practical intelligence, efficiency, results via quantified direct communication, not bureaucracy. Our \"primary mandate\" is the mission. We are structured to remove all barriers to expressing this direction.",
    ],
  },
};

export const whyJivoContent = {
  heading: 'SO, WHY JIVO EXACTLY?',
  subheading: 'Because our motive is different.',
  leftText:
    'Jivo was started to serve all of humanity, beginning with products and services that support health and wellbeing, as a direct expression of our core mission: wellness and service.',
  rightParagraphs: [
    'When you engage with Jivo — as a customer, a partner, or a team member — you are doing more than a transaction.',
    'You are participating in a cycle of service. You are supporting a mission rooted in integrity, and you are enabling a vision of wellness and Universal Brotherhood for all.',
    'Jivo exists to prove that a business built on Truth, Devotion, and Sewa can be a powerful force for the wellbeing of humanity. That is why Jivo.',
  ],
};

export const valuePillars: ValuePillar[] = [
  {
    image: PLACEHOLDER,
    title: 'People',
    description:
      'The organization is built with people who strive to embody these principles as personal qualities.',
  },
  {
    image: PLACEHOLDER,
    title: 'Truth',
    description: 'Honesty, transparency, and personal integrity.',
  },
  {
    image: PLACEHOLDER,
    title: 'Devotion',
    description:
      'A motivation that comes from selfless service to the mission.',
  },
  {
    image: PLACEHOLDER,
    title: 'Sewa',
    description:
      'A spirit of selfless service, seeing all work as an offering.',
  },
  {
    image: PLACEHOLDER,
    title: 'Intelligence',
    description:
      'People who are curious, learn from facts, and seek to understand the "why" behind their actions, demonstrating the practical intelligence that stems from this pursuit of Truth.',
  },
  {
    image: PLACEHOLDER,
    title: 'Integrity & Dedication',
    description:
      'An unwavering commitment to these principles and a perseverance in service to the mission.',
  },
];
