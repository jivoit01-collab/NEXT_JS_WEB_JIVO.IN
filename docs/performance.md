# Web Performance and Lighthouse Standard

This is the permanent performance, accessibility, best-practices, and SEO ruleset for this Next.js project. Every new or edited page must pass the checklist at the end of this file before the work is considered done.

## 1. How To Use This File

Read this file before creating or editing any public page, shared page component, image-heavy section, layout, metadata helper, or CMS-driven page module.

Every page should target Lighthouse scores as close as possible to `100 / 100 / 100 / 100` for Performance, Accessibility, Best Practices, and SEO. If a page cannot meet a rule because of CMS content, document the reason and fix the source content when possible.

## 2. Performance

### Images

Use `SafeImage` from `@/components/shared/public` for project images. It wraps `next/image` and resolves CMS/upload paths safely.

Hero/LCP rules:

- Use WebP or AVIF for CMS uploads whenever possible.
- Keep hero/LCP images around `200KB` after compression.
- Never lazy-load the hero image.
- Use `priority` and `fetchPriority="high"` for the LCP image.
- Always provide `sizes`.
- For `fill`, the parent must have stable dimensions.
- For non-`fill`, provide explicit `width` and `height`.
- Lazy-load all below-the-fold images by leaving `priority` off.

```tsx
import { SafeImage } from '@/components/shared/public';

export function PageHero({ image, title }: { image: string; title: string }) {
  return (
    <section className="relative min-h-[60svh] overflow-hidden bg-[#1c261f] lg:min-h-screen">
      <SafeImage
        src={image}
        alt={title}
        fill
        priority
        fetchPriority="high"
        quality={90}
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 1920px"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
        <h1 className="font-jost-extrabold text-3xl text-white lg:text-6xl">{title}</h1>
      </div>
    </section>
  );
}
```

Decorative background images must use empty alt text. Content images must describe the content.

```tsx
<SafeImage src={backgroundImage} alt="" fill className="object-cover" sizes="100vw" />
<SafeImage src={founderImage} alt="Baba Iqbal Singh Ji, founding father" width={384} height={384} />
```

### Fonts

Use WOFF2 only for production fonts. This project currently loads Jost from `public/fonts` as `.ttf`; convert these to `.woff2` and update `src/app/layout.tsx`.

```tsx
import localFont from 'next/font/local';

const jost = localFont({
  src: [
    { path: '../../public/fonts/Jost-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Jost-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/Jost-ExtraBold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-jost',
  display: 'swap',
  preload: true,
});
```

Font rules:

- Use `font-display: swap`.
- Self-host fonts in `public/fonts`.
- Keep only the weights used by the UI.
- Preload the headline font through `next/font/local`.
- Avoid loading remote font CSS.

### JS and CSS

Production builds are minified by Next.js. Keep page code split by using server components, `next/dynamic`, and lazy client islands.

```tsx
import dynamic from 'next/dynamic';

const PrinciplesSection = dynamic(
  () => import('./principles-section').then((mod) => mod.PrinciplesSection),
  { loading: () => <PrinciplesSectionSkeleton /> },
);
```

Rules:

- Keep interactive components client-side only when they need hooks.
- Do not put `use client` on full page trees unless required.
- Defer non-critical widgets with `LazyOnView`.
- Remove unused CSS and avoid one-off global CSS.
- Inline only truly critical above-the-fold styles through component classes.
- Do not initialize sliders, observers, video, or animation loops before the page is interactive.
- Use `useReducedMotion()` for heavy motion.

### Server and Caching

`next.config.ts` already enables compression and production cache headers for static assets. Keep this pattern:

```ts
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/api/uploads/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' }],
      },
    ];
  },
};
```

At deploy time, enable Brotli and Gzip at Nginx/CDN. Do not depend on local dev for compression audits.

## 3. Best Practices

### HTTPS and Security Headers

HTTPS and real-domain certificate checks happen in production, not on `localhost` or a local IP.

Deploy checklist:

- Redirect all HTTP traffic to HTTPS.
- Serve with a valid TLS certificate.
- Add CSP after verifying all image/script/style sources used by the app.
- Keep zero console errors and zero 404s.
- Serve images at their display dimensions.
- Avoid deprecated browser and React/Next APIs.

```nginx
server {
  listen 80;
  server_name jivo.in www.jivo.in;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name jivo.in www.jivo.in;

  add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https://utfs.io https://uploadthing.com https://lh3.googleusercontent.com; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header X-Frame-Options "DENY" always;

  brotli on;
  gzip on;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
  }
}
```

## 4. Accessibility

Rules:

- Text contrast must be at least `4.5:1`.
- Photo backgrounds with text must include a dark overlay.
- Every content image needs useful `alt`.
- Decorative images use `alt=""`.
- Icon-only buttons need `aria-label`.
- Every input needs a visible label or `aria-label`.
- Use one `<h1>` per page.
- Keep heading order logical: `h1`, then `h2`, then `h3`.
- Root layout must keep `<html lang="en">`.
- Interactive elements must have visible focus styles.

```tsx
<button
  type="button"
  aria-label="Open navigation menu"
  className="rounded-md focus-visible:ring-2 focus-visible:ring-white"
>
  <Menu className="h-5 w-5" />
</button>
```

## 5. SEO

Every indexable public page needs:

- Unique title.
- Unique meta description.
- Canonical URL.
- Open Graph title, description, and image.
- Twitter card metadata.
- Descriptive link text.
- `viewport` meta from the root layout.
- Inclusion in `src/app/sitemap.ts` when public.
- Valid robots policy in `src/app/robots.ts`.
- JSON-LD when the page represents a business, article, product, event, or about page.

Use the existing SEO helpers:

```tsx
import { JsonLd } from '@/components/shared/public';
import { getStructuredData, resolveSeo } from '@/modules/seo/utils';
import { defaultSeo } from '@/modules/our-essence/core-values/data/defaults';

export async function generateMetadata() {
  return resolveSeo('our-essence-core-values', defaultSeo);
}

export default async function CoreValuesPage() {
  const structuredData = await getStructuredData('our-essence-core-values', defaultSeo);

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <main>{/* page sections */}</main>
    </>
  );
}
```

## 6. Semantic HTML

Prefer semantic elements and real controls. Do not ship clickable `div`s.

| Use this                               | Instead of this                                |
| -------------------------------------- | ---------------------------------------------- |
| `<header>`                             | `<div className="header">`                     |
| `<nav aria-label="Main">`              | `<div className="nav">`                        |
| `<main>`                               | `<div id="main">`                              |
| `<section aria-labelledby="...">`      | unrelated nested `<div>` wrappers              |
| `<article>`                            | repeated content cards as plain `<div>`        |
| `<aside>`                              | sidebar/complementary content as plain `<div>` |
| `<footer>`                             | `<div className="footer">`                     |
| `<button type="button">`               | `<div onClick={...}>`                          |
| `<a href="/path">Descriptive text</a>` | `<button>` for navigation                      |

```tsx
<main>
  <section aria-labelledby="quality-heading" className="py-16">
    <h2 id="quality-heading">Quality From Farm To Bottle</h2>
    <p>Describe the section clearly.</p>
  </section>
</main>
```

## 7. Meta Tags

In this app-router project, pages should use `generateMetadata()` instead of hand-writing `<head>`. The rendered head must be equivalent to this:

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>The Jivo Capital | Jivo Wellness</title>
  <meta name="description" content="A concise unique page description." />
  <link rel="canonical" href="https://jivo.in/our-essence/the-jivo-capital" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="The Jivo Capital | Jivo Wellness" />
  <meta property="og:description" content="A concise unique page description." />
  <meta property="og:image" content="https://jivo.in/api/uploads/hero.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://utfs.io" crossorigin />
  <link rel="preload" href="/fonts/Jost-ExtraBold.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="icon" href="/favicon.ico" />
</head>
```

Project-style SEO defaults:

```ts
import { SITE_URL } from '@/lib/constants';
import { definePageSeo } from '@/modules/seo';

export const defaultSeo = definePageSeo({
  metaTitle: 'The Jivo Capital | Our Essence | Jivo Wellness',
  metaDescription: 'Explore Jivo Wellness manufacturing excellence and quality standards.',
  ogTitle: 'The Jivo Capital | Jivo Wellness',
  ogDescription: 'A cinematic look at Jivo Wellness manufacturing and quality.',
  ogImage: '/api/uploads/the-jivo-capital-hero.webp',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/our-essence/the-jivo-capital`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'AboutPage',
    name: 'The Jivo Capital',
    url: `${SITE_URL}/our-essence/the-jivo-capital`,
  },
});
```

JSON-LD:

```tsx
import { JsonLd } from '@/components/shared/public';

<JsonLd
  data={{
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'The Jivo Capital',
    url: 'https://jivo.in/our-essence/the-jivo-capital',
  }}
/>;
```

## 8. Per-Page Checklist

Copy this checklist into the task notes before finishing any new or edited page.

Performance:

- [ ] Hero/LCP image is WebP/AVIF and around `200KB`.
- [ ] Hero/LCP image uses `priority`, `fetchPriority="high"`, and accurate `sizes`.
- [ ] Below-the-fold images are lazy-loaded.
- [ ] All non-`fill` images have `width` and `height`.
- [ ] All `fill` images have stable parent dimensions.
- [ ] Fonts are WOFF2, self-hosted, preloaded through `next/font/local`, and use `display: swap`.
- [ ] Client JS is split; no unnecessary `use client` at page level.
- [ ] Heavy animations/sliders wait until after interaction or viewport entry.
- [ ] Production cache headers and compression remain intact.

Best Practices:

- [ ] Page has no console errors.
- [ ] Page has no missing assets or 404s.
- [ ] No deprecated APIs are introduced.
- [ ] Image dimensions match display needs.
- [ ] HTTPS/security-header deployment checklist is still satisfied.

Accessibility:

- [ ] One `<h1>` exists on the page.
- [ ] Heading order is logical.
- [ ] Text contrast is at least `4.5:1`.
- [ ] Text over images has a readable overlay.
- [ ] Content images have meaningful alt text.
- [ ] Decorative images use `alt=""`.
- [ ] Icon-only buttons have `aria-label`.
- [ ] Inputs have labels.
- [ ] Focus states are visible.
- [ ] Keyboard navigation works.

SEO:

- [ ] Unique title and meta description are configured.
- [ ] Canonical URL is correct.
- [ ] Open Graph and Twitter metadata are configured.
- [ ] Public page is present in `src/app/sitemap.ts`.
- [ ] Robots rules do not block the page.
- [ ] Links use descriptive text.
- [ ] JSON-LD is present when relevant.
