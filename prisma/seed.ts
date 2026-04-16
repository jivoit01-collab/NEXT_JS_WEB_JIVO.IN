/**
 * Seed script — populates initial Home page content + admin user.
 * Run: npm run db:seed
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin user ───────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@jivo.in';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin@dev02';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      name: 'Jivo Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log(`✓ Admin user: ${admin.email}`);

  // All seeded image fields point to the placeholder. Admin uploads
  // override these via /admin/home, and the SafeImage component on the
  // public page falls back to the placeholder if any uploaded file is
  // ever deleted from disk.
  const PLACEHOLDER = '/images/placeholder.jpg';

  // ── Home page sections ───────────────────────────────────────
  const homeSections = [
    {
      section: 'hero',
      title: 'Hero',
      sortOrder: 0,
      content: {
        logo: PLACEHOLDER,
        backgroundImage: PLACEHOLDER,
        headline: 'LET NATURE RECLAIM YOU',
        subtitle:
          'The Heartbeat of Jivo — pure, honest products born from a mission of wellness and service.',
      },
    },
    {
      section: 'categories',
      title: 'Product Categories',
      sortOrder: 1,
      content: {
        heading: 'MADE FOR EVERYDAY LOVE',
        items: [
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
        ],
      },
    },
    {
      section: 'vision_mission',
      title: 'Vision & Mission',
      sortOrder: 2,
      content: {
        backgroundImage: PLACEHOLDER,
        heading: 'LET NATURE RECLAIM YOU',
        subtitle: 'Our foundation is truth, our motive is service.',
        intro:
          'Jivo exists to prove that business can be a pure expression of service. Every product we make and every decision we take is guided by this single idea: wellness is a duty, not a market.',
        vision:
          'To create a world where wellness is accessible to all — through products rooted in truth, purity, and a deep respect for nature. Jivo envisions a future where every individual can reclaim their health and vitality through honest, natural solutions.',
        mission:
          'To serve humanity by offering the very best wellness products and services, crafted with integrity and guided by the principles of Truth, Devotion, and Sewa. Every Jivo product is a step toward universal well-being.',
      },
    },
    {
      section: 'products_foundation',
      title: 'Products & Foundation',
      sortOrder: 3,
      content: {
        productImage: PLACEHOLDER,
        section1: {
          heading: 'Our Products Are Our Service',
          paragraphs: [
            'For us, "wellness" is not a marketing category — it is the very core of our mission. Our commitment is to offer the "very best" products and services that contribute to health and well-being. This is not a business strategy; it is a direct expression of our core principle.',
            'Truth & Integrity: We are committed to absolute honesty and transparency about our products. Intelligence: We are guided by facts and a deep understanding of why and how our products contribute to wellness, ensuring we act with clarity and effectiveness.',
            'When you choose a Jivo product, you are choosing something created with an unwavering commitment to quality and integrity, because its very purpose is to serve you.',
          ],
        },
        section2: {
          heading: 'Our Foundation is Built on Values, Not Ambition',
          paragraphs: [
            'Our entire organization is designed to be a high-speed, effective vehicle for "Sewa." Our operating principles are not posters on a wall, they are the guidelines for every decision we make.',
            'Truth: Recognition of unity and a commitment to absolute honesty.',
            'Sewa: All our work is seen as an offering, a path to realizing the ultimate Truth.',
            'This requires practical intelligence, efficiency, results via quantified direct communication, not bureaucracy. Our "primary mandate" is the mission. We are structured to remove all barriers to expressing this direction.',
          ],
        },
      },
    },
    {
      section: 'why_jivo',
      title: 'Why Jivo Exactly',
      sortOrder: 4,
      content: {
        heading: 'SO, WHY JIVO EXACTLY?',
        subheading: 'Because our motive is different.',
        leftText:
          'Jivo was started to serve all of humanity, beginning with products and services that support health and wellbeing, as a direct expression of our core mission: wellness and service.',
        rightParagraphs: [
          'When you engage with Jivo — as a customer, a partner, or a team member — you are doing more than a transaction.',
          'You are participating in a cycle of service. You are supporting a mission rooted in integrity, and you are enabling a vision of wellness and Universal Brotherhood for all.',
          'Jivo exists to prove that a business built on Truth, Devotion, and Sewa can be a powerful force for the wellbeing of humanity. That is why Jivo.',
        ],
        valuePillars: [
          {
            icon: 'Users',
            title: 'People',
            description:
              'The organization is built with people who strive to embody these principles as personal qualities.',
          },
          {
            icon: 'Scale',
            title: 'Truth',
            description: 'Honesty, transparency, and personal integrity.',
          },
          {
            icon: 'Heart',
            title: 'Devotion',
            description: 'A motivation that comes from selfless service to the mission.',
          },
          {
            icon: 'HandHeart',
            title: 'Sewa',
            description: 'A spirit of selfless service, seeing all work as an offering.',
          },
          {
            icon: 'Lightbulb',
            title: 'Intelligence',
            description:
              'People who are curious, learn from facts, and seek to understand the "why" behind their actions.',
          },
          {
            icon: 'ShieldCheck',
            title: 'Integrity & Dedication',
            description:
              'An unwavering commitment to these principles and perseverance in service to the mission.',
          },
        ],
      },
    },
  ];

  for (const s of homeSections) {
    await prisma.homePage.upsert({
      where: { section: s.section },
      update: { title: s.title, content: s.content, sortOrder: s.sortOrder, isActive: true },
      create: {
        section: s.section,
        title: s.title,
        content: s.content,
        sortOrder: s.sortOrder,
        isActive: true,
      },
    });
  }
  console.log(`✓ Home sections: ${homeSections.map((s) => s.section).join(', ')}`);

  // ── Hero carousel slides ─────────────────────────────────────
  // Sort order starts at 1 — sort order 0 is the hero section itself
  // (managed from Sections tab, not the Hero Carousel tab)
  const heroSlides = [
    {
      backgroundImage: PLACEHOLDER,
      headline: 'SMALL MOMENTS OF JOY',
      subtitle:
        "India's largest seller of cold press canola oil. India's first patented wheatgrass product.",
      sortOrder: 1,
    },
    {
      backgroundImage: PLACEHOLDER,
      headline: 'LEADING THE WAY TOUCHING LIVES',
      subtitle:
        'A pure brand, built on the values of service — Bringing goodness from India for all of humanity.',
      sortOrder: 2,
    },
  ];

  // Wipe & re-create hero slides for a clean seed
  await prisma.heroSlide.deleteMany();
  for (const slide of heroSlides) {
    await prisma.heroSlide.create({
      data: { ...slide, isActive: true },
    });
  }
  console.log(`✓ Hero slides: ${heroSlides.length}`);

  // ── Navbar links ─────────────────────────────────────────────
  // Exact labels/links from the reference screenshot.
  const navLinks = [
    { title: 'Products', href: '/products', sortOrder: 0 },
    { title: 'Our Essence', href: '/our-essence', sortOrder: 1 },
    { title: 'Media', href: '/media', sortOrder: 2 },
    { title: 'Community', href: '/community', sortOrder: 3 },
  ];

  // Upsert by title (best-effort — schema has no unique on title, so we match manually)
  for (const l of navLinks) {
    const existing = await prisma.navLink.findFirst({ where: { title: l.title } });
    if (existing) {
      await prisma.navLink.update({
        where: { id: existing.id },
        data: { href: l.href, sortOrder: l.sortOrder, isVisible: true },
      });
    } else {
      await prisma.navLink.create({
        data: { title: l.title, href: l.href, sortOrder: l.sortOrder, isVisible: true },
      });
    }
  }
  console.log(`✓ Nav links: ${navLinks.map((l) => l.title).join(', ')}`);

  // ── Footer — columns + links + settings ──────────────────────
  const footerColumns = [
    {
      title: 'OUR ESSENCE',
      sortOrder: 0,
      links: [
        { title: 'Our Story', href: '/our-story' },
        { title: 'Barusahib Association', href: '/barusahib-association' },
        { title: 'Jivo Journey', href: '/jivo-journey' },
        { title: 'Resources', href: '/resources' },
        { title: 'Our Values', href: '/our-values' },
        { title: 'Social Initiatives', href: '/social-initiatives' },
        { title: 'Why Jivo', href: '/why-jivo' },
      ],
    },
    {
      title: 'OUR PRODUCTS',
      sortOrder: 1,
      links: [
        { title: 'Jivo Cold Press Canola Oil', href: '/products/cold-press-canola-oil' },
        { title: 'Jivo Olive Oil', href: '/products/olive-oil' },
        { title: 'Jivo Mustard Oil', href: '/products/mustard-oil' },
        { title: 'Jivo Wheatgrass Drink', href: '/products/wheatgrass-drink' },
        { title: 'Jivo immunity Booster Tablets', href: '/products/immunity-booster-tablets' },
        { title: 'Jivo Pure Desi Ghee', href: '/products/pure-desi-ghee' },
        { title: 'Jivo Muesli', href: '/products/muesli' },
        { title: 'A2-Desi Ghee', href: '/products/a2-desi-ghee' },
        { title: 'FAQs', href: '/faqs' },
        { title: 'Recipes', href: '/recipes' },
        { title: 'Nutrition Benefits', href: '/nutrition-benefits' },
        { title: 'Product Procedures', href: '/product-procedures' },
      ],
    },
    {
      title: 'JIVO MEDIA',
      sortOrder: 2,
      links: [
        { title: 'What is Canola', href: '/media/what-is-canola' },
        { title: 'Where is it found', href: '/media/where-is-canola-found' },
        { title: 'How is Canola Oil Extracted', href: '/media/how-is-canola-oil-extracted' },
        { title: 'Health Benefit of Canola', href: '/media/health-benefit-of-canola' },
        { title: 'Why should Canola preferred', href: '/media/why-should-canola-preferred' },
        { title: 'Canola Versus other Oils', href: '/media/canola-versus-other-oils' },
        { title: 'Why Canola', href: '/media/why-canola' },
        {
          title: 'What is Cold Press procedure of extrating Oil',
          href: '/media/cold-press-procedure',
        },
        {
          title: "Doctor's Speak Global Medical Authenticity of Canola - Researches",
          href: '/media/doctors-speak-canola',
        },
      ],
    },
    {
      title: 'COMMUNITY',
      sortOrder: 3,
      links: [
        { title: 'What is Wheatgrass', href: '/community/what-is-wheatgrass' },
        { title: 'Where is it found', href: '/community/where-is-wheatgrass-found' },
        { title: 'How is it grown', href: '/community/how-is-wheatgrass-grown' },
        {
          title: 'How is Wheatgrass Juice Extracted',
          href: '/community/wheatgrass-juice-extracted',
        },
        {
          title: 'Health Benefit of Wheatgrass (Power of Green)',
          href: '/community/health-benefit-of-wheatgrass',
        },
        {
          title: 'Why should Wheatgrass be preferred',
          href: '/community/why-wheatgrass-preferred',
        },
        { title: 'Why Wheatgrass', href: '/community/why-wheatgrass' },
        { title: "Doctor's Speak", href: '/community/doctors-speak' },
        {
          title: 'Global Medical Authenticity of Wheatgrass',
          href: '/community/medical-authenticity-wheatgrass',
        },
      ],
    },
    {
      title: 'QUICK LINKS',
      sortOrder: 4,
      links: [
        { title: 'Awards & Recognition', href: '/awards-and-recognition' },
        { title: 'Store Locator', href: '/store-locator' },
        { title: 'Careers', href: '/careers' },
        { title: 'Contact us', href: '/contact' },
        { title: 'Disclaimer', href: '/disclaimer' },
        { title: 'Refund Policy', href: '/refund-policy' },
        { title: 'Privacy Policy', href: '/privacy-policy' },
        { title: 'Terms & conditions', href: '/terms-and-conditions' },
      ],
    },
  ];

  // Wipe & re-create footer rows for clean seed (small enough to do this)
  await prisma.footerLink.deleteMany();
  await prisma.footerColumn.deleteMany();

  for (const col of footerColumns) {
    const createdCol = await prisma.footerColumn.create({
      data: { title: col.title, sortOrder: col.sortOrder, isVisible: true },
    });
    await prisma.footerLink.createMany({
      data: col.links.map((link, i) => ({
        columnId: createdCol.id,
        title: link.title,
        href: link.href,
        sortOrder: i,
        isVisible: true,
      })),
    });
  }
  console.log(
    `✓ Footer columns: ${footerColumns.length} (${footerColumns.reduce((n, c) => n + c.links.length, 0)} total links)`,
  );

  // ── SEO defaults ─────────────────────────────────────────────
  // Seed only pages that actually exist as routes today.
  // Add new entries here whenever a new public page is built.
  const seoSeeds = [
    {
      page: 'home',
      metaTitle: "Jivo Wellness — India's Largest Cold Press Canola Oil Seller",
      metaDescription:
        'Premium cold press canola oil, wheatgrass juice, natural minerals & superfoods — crafted with truth, devotion, and sewa. Discover wellness products you can trust.',
      keywords: [
        'jivo wellness',
        'cold press canola oil',
        'canola oil india',
        'wheatgrass juice',
        'cooking oil',
        'super foods',
        'natural mineral water',
        'pure desi ghee',
      ],
      ogTitle: 'Jivo Wellness — Pure, Honest, Wellness-First Products',
      ogDescription:
        'Cold press oils, wheatgrass juice, superfoods & wellness products born from a mission of service.',
      ogImage: '/images/common/og-default.png',
      twitterCard: 'summary_large_image',
      canonicalUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://jivo.in',
      robots: 'index,follow',
      structuredData: {
        '@type': 'WebSite',
        name: 'Jivo Wellness',
        url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://jivo.in',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://jivo.in'}/products?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    },
  ];

  for (const seo of seoSeeds) {
    await prisma.seoMeta.upsert({
      where: { page: seo.page },
      create: seo,
      update: {
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        keywords: seo.keywords,
        ogTitle: seo.ogTitle,
        ogDescription: seo.ogDescription,
        ogImage: seo.ogImage,
        twitterCard: seo.twitterCard,
        canonicalUrl: seo.canonicalUrl,
        robots: seo.robots,
        structuredData: seo.structuredData,
      },
    });
  }
  console.log(`✓ SEO entries: ${seoSeeds.map((s) => s.page).join(', ')}`);

  await prisma.footerSetting.upsert({
    where: { id: 'default' },
    update: {
      logoUrl: '/images/Jivo Logo.png',
      logoAlt: 'Jivo',
      copyrightText: `All Right Reserved © ${new Date().getFullYear()}`,
      address: 'Jt/190, Nehru Market, Rajouri Garden, New Delhi - 110027',
      email: 'info@jivo.in',
      phone: '1800 137 4433',
      phoneLabel: '(TOLL FREE)',
    },
    create: {
      id: 'default',
      logoUrl: '/images/Jivo Logo.png',
      logoAlt: 'Jivo',
      copyrightText: `All Right Reserved © ${new Date().getFullYear()}`,
      address: 'Jt/190, Nehru Market, Rajouri Garden, New Delhi - 110027',
      email: 'info@jivo.in',
      phone: '1800 137 4433',
      phoneLabel: '(TOLL FREE)',
    },
  });
  console.log('✓ Footer settings');

  console.log('🎉 Seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
