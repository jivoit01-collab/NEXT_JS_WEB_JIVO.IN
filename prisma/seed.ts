/**
 * Seed script — populates MISSING data only. Never overwrites existing records.
 *
 *   npm run db:seed          → safe mode (insert-only, skips existing)
 *   npm run db:seed:reset    → destructive mode (wipes + re-creates everything)
 *
 * PRODUCTION GUARD: in production, --force is required for reset mode.
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

// ── CLI flags ────────────────────────────────────────────────
const args = process.argv.slice(2);
const FORCE_RESET = args.includes('--reset');
const isProd = process.env.NODE_ENV === 'production';

// ── Counters for summary ─────────────────────────────────────
let created = 0;
let skipped = 0;

const PLACEHOLDER = 'placeholder.png';

async function main() {
  // ── Production guard ───────────────────────────────────────
  if (FORCE_RESET && isProd && !args.includes('--force')) {
    console.error(
      '\n❌ REFUSED: --reset on a production database requires --force flag.\n' +
        '   This will DELETE all admin-uploaded content and images.\n' +
        '   If you really want this: npm run db:seed:reset -- --force\n',
    );
    process.exit(1);
  }

  if (FORCE_RESET) {
    console.log('⚠️  RESET MODE — all existing content will be overwritten.\n');
  } else {
    console.log('🌱 Safe seed — only creating MISSING records (existing data is untouched).\n');
  }

  // ── Admin user (always upsert — password may change) ───────
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

  // ── Home page sections ─────────────────────────────────────
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
          { name: 'Cooking Oil', image: PLACEHOLDER, href: '/products?category=cooking-oil', bgColor: 'bg-jivo-green' },
          { name: 'Wheatgrass Juice', image: PLACEHOLDER, href: '/products?category=wheatgrass-juice', bgColor: 'bg-jivo-sage' },
          { name: 'Water', image: PLACEHOLDER, href: '/products?category=water', bgColor: 'bg-jivo-blue' },
          { name: 'Super Foods', image: PLACEHOLDER, href: '/products?category=super-foods', bgColor: 'bg-jivo-maroon' },
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
        intro: 'Jivo exists to prove that business can be a pure expression of service. Every product we make and every decision we take is guided by this single idea: wellness is a duty, not a market.',
        vision: 'To create a world where wellness is accessible to all — through products rooted in truth, purity, and a deep respect for nature. Jivo envisions a future where every individual can reclaim their health and vitality through honest, natural solutions.',
        mission: 'To serve humanity by offering the very best wellness products and services, crafted with integrity and guided by the principles of Truth, Devotion, and Sewa. Every Jivo product is a step toward universal well-being.',
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
            'For us, "wellness" is not a marketing category — it is the very core of our mission.',
            'Truth & Integrity: We are committed to absolute honesty and transparency about our products.',
            'When you choose a Jivo product, you are choosing something created with an unwavering commitment to quality and integrity.',
          ],
        },
        section2: {
          heading: 'Our Foundation is Built on Values, Not Ambition',
          paragraphs: [
            'Our entire organization is designed to be a high-speed, effective vehicle for "Sewa."',
            'Truth: Recognition of unity and a commitment to absolute honesty.',
            'Sewa: All our work is seen as an offering, a path to realizing the ultimate Truth.',
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
        leftText: 'Jivo was started to serve all of humanity, beginning with products and services that support health and wellbeing.',
        rightParagraphs: [
          'When you engage with Jivo — as a customer, a partner, or a team member — you are doing more than a transaction.',
          'You are participating in a cycle of service.',
          'Jivo exists to prove that a business built on Truth, Devotion, and Sewa can be a powerful force for the wellbeing of humanity.',
        ],
        valuePillars: [
          { icon: 'Users', title: 'People', description: 'The organization is built with people who strive to embody these principles.' },
          { icon: 'Scale', title: 'Truth', description: 'Honesty, transparency, and personal integrity.' },
          { icon: 'Heart', title: 'Devotion', description: 'A motivation that comes from selfless service to the mission.' },
          { icon: 'HandHeart', title: 'Sewa', description: 'A spirit of selfless service, seeing all work as an offering.' },
          { icon: 'Lightbulb', title: 'Intelligence', description: 'People who are curious, learn from facts, and seek to understand.' },
          { icon: 'ShieldCheck', title: 'Integrity & Dedication', description: 'An unwavering commitment to these principles.' },
        ],
      },
    },
  ];

  if (FORCE_RESET) {
    // Destructive: wipe and re-create
    await prisma.homePage.deleteMany();
    for (const s of homeSections) {
      await prisma.homePage.create({
        data: { section: s.section, title: s.title, content: s.content, sortOrder: s.sortOrder, isActive: true },
      });
    }
    created += homeSections.length;
    console.log(`✓ Home sections: RESET (${homeSections.length} created)`);
  } else {
    // Safe: only create missing sections
    for (const s of homeSections) {
      const exists = await prisma.homePage.findUnique({ where: { section: s.section } });
      if (exists) {
        skipped++;
      } else {
        await prisma.homePage.create({
          data: { section: s.section, title: s.title, content: s.content, sortOrder: s.sortOrder, isActive: true },
        });
        created++;
      }
    }
    console.log(`✓ Home sections: ${created} created, ${skipped} skipped (already exist)`);
  }

  // ── Hero carousel slides ───────────────────────────────────
  const heroSlides = [
    { backgroundImage: PLACEHOLDER, headline: 'SMALL MOMENTS OF JOY', subtitle: "India's largest seller of cold press canola oil.", sortOrder: 1 },
    { backgroundImage: PLACEHOLDER, headline: 'LEADING THE WAY TOUCHING LIVES', subtitle: 'A pure brand, built on the values of service.', sortOrder: 2 },
  ];

  if (FORCE_RESET) {
    await prisma.heroSlide.deleteMany();
    for (const slide of heroSlides) {
      await prisma.heroSlide.create({ data: { ...slide, isActive: true } });
    }
    console.log(`✓ Hero slides: RESET (${heroSlides.length} created)`);
  } else {
    const slideCount = await prisma.heroSlide.count();
    if (slideCount === 0) {
      for (const slide of heroSlides) {
        await prisma.heroSlide.create({ data: { ...slide, isActive: true } });
      }
      console.log(`✓ Hero slides: ${heroSlides.length} created (table was empty)`);
    } else {
      console.log(`✓ Hero slides: skipped (${slideCount} already exist)`);
    }
  }

  // ── Navbar links ───────────────────────────────────────────
  const navLinks = [
    { title: 'Our Essence', href: '/our-essence', sortOrder: 0 },
    { title: 'Our Products', href: '/our-products', sortOrder: 1 },
    { title: 'Jivo Media', href: '/media', sortOrder: 2 },
    { title: 'Community', href: '/community', sortOrder: 3 },
  ];

  if (FORCE_RESET) {
    await prisma.navSubLink.deleteMany();
    await prisma.navLink.deleteMany();
  }
  for (const l of navLinks) {
    const existing = await prisma.navLink.findFirst({ where: { title: l.title } });
    if (existing) {
      skipped++;
    } else {
      await prisma.navLink.create({ data: { title: l.title, href: l.href, sortOrder: l.sortOrder, isVisible: true } });
      created++;
    }
  }
  console.log(`✓ Nav links: done`);

  // ── Footer columns + links ─────────────────────────────────
  const footerColumns = [
    {
      title: 'OUR ESSENCE', sortOrder: 0,
      links: [
        { title: 'Our Story', href: '/our-essence/the-story' },
        { title: 'Our Values', href: '/our-values' },
        { title: 'Why Jivo', href: '/why-jivo' },
        { title: 'Social Initiatives', href: '/social-initiatives' },
        { title: 'Barusahib Association', href: '/barusahib-association' },
      ],
    },
    {
      title: 'OUR PRODUCTS', sortOrder: 1,
      links: [
        { title: 'Jivo Cold Press Canola Oil', href: '/products/cold-press-canola-oil' },
        { title: 'Jivo Olive Oil', href: '/products/olive-oil' },
        { title: 'Jivo Mustard Oil', href: '/products/mustard-oil' },
        { title: 'Jivo Wheatgrass Drink', href: '/products/wheatgrass-drink' },
        { title: 'Jivo Pure Desi Ghee', href: '/products/pure-desi-ghee' },
        { title: 'FAQs', href: '/faqs' },
      ],
    },
    {
      title: 'JIVO MEDIA', sortOrder: 2,
      links: [
        { title: 'What is Canola', href: '/media/what-is-canola' },
        { title: 'Health Benefit of Canola', href: '/media/health-benefit-of-canola' },
        { title: 'Canola Versus other Oils', href: '/media/canola-versus-other-oils' },
        { title: "Doctor's Speak", href: '/media/doctors-speak-canola' },
      ],
    },
    {
      title: 'COMMUNITY', sortOrder: 3,
      links: [
        { title: 'What is Wheatgrass', href: '/community/what-is-wheatgrass' },
        { title: 'Health Benefit of Wheatgrass', href: '/community/health-benefit-of-wheatgrass' },
        { title: "Doctor's Speak", href: '/community/doctors-speak' },
      ],
    },
    {
      title: 'QUICK LINKS', sortOrder: 4,
      links: [
        { title: 'Careers', href: '/careers' },
        { title: 'Contact us', href: '/contact' },
        { title: 'Privacy Policy', href: '/privacy-policy' },
        { title: 'Terms & Conditions', href: '/terms-and-conditions' },
        { title: 'Refund Policy', href: '/refund-policy' },
      ],
    },
  ];

  if (FORCE_RESET) {
    await prisma.footerLink.deleteMany();
    await prisma.footerColumn.deleteMany();
    for (const col of footerColumns) {
      const c = await prisma.footerColumn.create({ data: { title: col.title, sortOrder: col.sortOrder, isVisible: true } });
      await prisma.footerLink.createMany({
        data: col.links.map((link, i) => ({ columnId: c.id, title: link.title, href: link.href, sortOrder: i, isVisible: true })),
      });
    }
    console.log(`✓ Footer: RESET (${footerColumns.length} columns)`);
  } else {
    const colCount = await prisma.footerColumn.count();
    if (colCount === 0) {
      for (const col of footerColumns) {
        const c = await prisma.footerColumn.create({ data: { title: col.title, sortOrder: col.sortOrder, isVisible: true } });
        await prisma.footerLink.createMany({
          data: col.links.map((link, i) => ({ columnId: c.id, title: link.title, href: link.href, sortOrder: i, isVisible: true })),
        });
      }
      console.log(`✓ Footer: ${footerColumns.length} columns created (table was empty)`);
    } else {
      console.log(`✓ Footer: skipped (${colCount} columns already exist)`);
    }
  }

  // ── Footer settings (only create if missing — never overwrite logo) ─
  const footerSetting = await prisma.footerSetting.findUnique({ where: { id: 'default' } });
  if (!footerSetting || FORCE_RESET) {
    await prisma.footerSetting.upsert({
      where: { id: 'default' },
      update: FORCE_RESET
        ? {
            logoUrl: 'jivo-logo.png',
            logoAlt: 'Jivo',
            copyrightText: `All Right Reserved © ${new Date().getFullYear()}`,
            address: 'Jt/190, Nehru Market, Rajouri Garden, New Delhi - 110027',
            email: 'info@jivo.in',
            phone: '1800 137 4433',
            phoneLabel: '(TOLL FREE)',
          }
        : {},
      create: {
        id: 'default',
        logoUrl: 'jivo-logo.png',
        logoAlt: 'Jivo',
        copyrightText: `All Right Reserved © ${new Date().getFullYear()}`,
        address: 'Jt/190, Nehru Market, Rajouri Garden, New Delhi - 110027',
        email: 'info@jivo.in',
        phone: '1800 137 4433',
        phoneLabel: '(TOLL FREE)',
      },
    });
    console.log(`✓ Footer settings: ${FORCE_RESET ? 'RESET' : 'created'}`);
  } else {
    console.log('✓ Footer settings: skipped (already exist)');
  }

  // ── Navbar settings (only create if missing — never overwrite logo) ─
  const navSetting = await prisma.navbarSetting.findUnique({ where: { id: 'default' } });
  if (!navSetting) {
    await prisma.navbarSetting.create({ data: { id: 'default' } });
    console.log('✓ Navbar settings: created');
  } else {
    console.log('✓ Navbar settings: skipped (already exist)');
  }

  // ── SEO defaults (only create if page doesn't exist in SeoMeta) ────
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jivo.in';

  const seoSeeds = [
    {
      page: 'home',
      metaTitle: "Jivo Wellness — India's Largest Cold Press Canola Oil Seller",
      metaDescription: 'Premium cold press canola oil, wheatgrass juice, natural minerals & superfoods.',
      keywords: ['jivo wellness', 'cold press canola oil', 'canola oil india', 'wheatgrass juice', 'cooking oil', 'super foods'],
      ogTitle: 'Jivo Wellness — Pure, Honest, Wellness-First Products',
      ogDescription: 'Cold press oils, wheatgrass juice, superfoods & wellness products born from a mission of service.',
      ogImage: 'og-default.png',
      twitterCard: 'summary_large_image',
      canonicalUrl: BASE,
      robots: 'index,follow',
      structuredData: { '@type': 'WebSite', name: 'Jivo Wellness', url: BASE },
    },
    {
      page: 'our-essence-the-story',
      metaTitle: 'The Story of Jivo Wellness | Inspired by Seva & Baba Iqbal Singh Ji',
      metaDescription: "Discover the journey of Jivo Wellness — rooted in the vision of Baba Iqbal Singh Ji.",
      keywords: ['jivo wellness story', 'baba iqbal singh ji', 'jivo journey', 'seva wellness', 'kirat karmai'],
      ogTitle: 'The Jivo Journey — Wellness Rooted in Seva',
      ogDescription: "From selfless service to wellness for all — the story behind Jivo's mission.",
      ogImage: 'og-default.png',
      twitterCard: 'summary_large_image',
      canonicalUrl: `${BASE}/our-essence/the-story`,
      robots: 'index,follow',
      structuredData: { '@type': 'AboutPage', name: 'The Story of Jivo Wellness', url: `${BASE}/our-essence/the-story` },
    },
  ];

  for (const seo of seoSeeds) {
    const exists = await prisma.seoMeta.findUnique({ where: { page: seo.page } });
    if (exists && !FORCE_RESET) {
      console.log(`  SEO "${seo.page}": skipped (already exists)`);
    } else {
      await prisma.seoMeta.upsert({
        where: { page: seo.page },
        create: seo,
        update: seo,
      });
      console.log(`  SEO "${seo.page}": ${exists ? 'RESET' : 'created'}`);
    }
  }

  // ── Our Essence — The Story sections ───────────────────────
  const theStorySections = [
    {
      section: 'hero', title: 'Hero', sortOrder: 0,
      content: {
        heading: 'JIVO JOURNEY',
        paragraph: "Inspired by Baba Iqbal Singh ji's vision, Jivo blends integrity, compassion, and innovation to promote health, uplift communities, and empower humanity.",
        backgroundImage: PLACEHOLDER,
      },
    },
    {
      section: 'founder', title: 'Founder', sortOrder: 1,
      content: {
        sectionHeading: 'FOR HUMANITY, WITH PURPOSE',
        title: 'WELLNESS ROOTED IN SEVA',
        paragraph: 'Our founding father, Baba Iqbal Singh ji, offered his entire life to selfless service (sewa).',
        founderImage: PLACEHOLDER,
      },
    },
    {
      section: 'vision', title: 'Vision', sortOrder: 2,
      content: {
        sectionHeading: 'WHERE PURPOSE BECOMES WELLNESS',
        title: 'VISION OF SEVA & GROWTH',
        leftColumn: "He envisioned that the organization should also be supported by the principle of 'kirat karmai'.",
        rightColumn: 'Jivo was started to fulfill this vision. Its purpose is to serve all of humanity.',
      },
    },
  ];

  if (FORCE_RESET) {
    await prisma.ourEssenceTheStory.deleteMany();
    for (const s of theStorySections) {
      await prisma.ourEssenceTheStory.create({
        data: { section: s.section, title: s.title, content: s.content, sortOrder: s.sortOrder, isActive: true },
      });
    }
    console.log(`✓ The Story: RESET (${theStorySections.length} sections)`);
  } else {
    for (const s of theStorySections) {
      const exists = await prisma.ourEssenceTheStory.findUnique({ where: { section: s.section } });
      if (exists) {
        console.log(`  The Story "${s.section}": skipped`);
      } else {
        await prisma.ourEssenceTheStory.create({
          data: { section: s.section, title: s.title, content: s.content, sortOrder: s.sortOrder, isActive: true },
        });
        console.log(`  The Story "${s.section}": created`);
      }
    }
  }

  // ── Summary ────────────────────────────────────────────────
  console.log('\n========================================');
  if (FORCE_RESET) {
    console.log('⚠️  RESET complete — all data restored to defaults.');
    console.log('   Re-upload images via the admin dashboard.');
  } else {
    console.log(`🎉 Safe seed complete.`);
    console.log(`   Your existing content and images are untouched.`);
  }
  console.log('========================================\n');
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
