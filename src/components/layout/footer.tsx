import Link from 'next/link';
import { MapPin, Mail, Phone, Copyright, ArrowRight, Leaf } from 'lucide-react';
import { SafeImage } from '@/components/shared/public';
import { getVisibleFooter } from '@/modules/footer';
import type { VisibleFooterSetting } from '@/modules/footer/types';
import { FooterSocialIcons } from './footer-social-icons';
import { FooterColumns } from './footer-columns';
import { FooterCertificates } from './footer-certificates';

/** Resolve a stored asset value (bare filename, absolute path, or URL) to a src. */
function assetUrl(raw: string | null | undefined, fallback = '/api/uploads/placeholder.png') {
  if (!raw) return fallback;
  return raw.startsWith('/') || raw.startsWith('http') ? raw : `/api/uploads/${raw}`;
}

/**
 * Normalise a CTA link. Full URLs, protocol-relative links, and bare domains
 * (e.g. "shop.jivo.in") are treated as EXTERNAL and open in a new tab; internal
 * paths ("/products") stay in-app.
 */
function resolveCtaLink(raw: string): { href: string; external: boolean } {
  const href = raw.trim();
  if (/^https?:\/\//i.test(href)) return { href, external: true };
  if (href.startsWith('//')) return { href: `https:${href}`, external: true };
  const isSpecial =
    href.startsWith('/') ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:');
  // Bare domain like "shop.jivo.in" or "www.foo.com/x" — first path segment has a dot.
  if (!isSpecial && (href.split('/')[0]?.includes('.') ?? false)) {
    return { href: `https://${href}`, external: true };
  }
  return { href, external: false };
}

/** Prefer the admin-set map link; otherwise build a Google Maps search from the address. */
function resolveMapHref(setting: VisibleFooterSetting): string | null {
  if (setting.addressMapUrl && setting.addressMapUrl.trim()) return setting.addressMapUrl.trim();
  if (setting.address && setting.address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(setting.address.trim())}`;
  }
  return null;
}

/** Text with the shared green growing-underline hover effect. */
function HoverUnderlineText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative transition-colors duration-300 [@media(hover:hover)]:group-hover:text-[#111]">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-[#0a7d3f] transition-all duration-300 [@media(hover:hover)]:group-hover:w-full" />
    </span>
  );
}

export async function Footer() {
  const { columns, setting, socials, certificates } = await getVisibleFooter();

  const logoSrc = assetUrl(setting.logoUrl);
  const year = new Date().getFullYear();
  const copyright = setting.copyrightText || `© ${year} Jivo Wellness Pvt. Ltd. All Rights Reserved.`;
  const followLabel = setting.followLabel || 'FOLLOW US';
  const brandPromise = setting.brandPromise || 'Pure. Natural. Trusted.';
  const brandPromiseSub = setting.brandPromiseSub || 'Since 2016';
  const ctaLabel = setting.ctaLabel || 'Explore Products';
  const { href: ctaHref, external: ctaExternal } = resolveCtaLink(setting.ctaHref || '/products');
  const mapHref = resolveMapHref(setting);
  const leafTop = setting.leafImageTop;
  const leafBottom = setting.leafImageBottom;

  return (
    <footer className="bg-[#f5f4ef] text-[#2c352c]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 2xl:max-w-screen-2xl 2xl:px-16 2xl:py-10">
        {/* ── Top: brand card + link columns ─────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-8 2xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          {/* ── Brand card ── */}
          <div className="relative overflow-hidden rounded-3xl bg-[#edece4] px-6 pt-10 pb-7 sm:px-8 sm:pt-12 sm:pb-8 2xl:px-10">
            {/* Decorative leaves (top-left, bottom-right) — admin images, else icon */}
            {leafTop ? (
              <SafeImage
                src={assetUrl(leafTop)}
                alt=""
                width={220}
                height={220}
                className="pointer-events-none absolute top-0 left-0 h-24 w-auto object-contain sm:h-28 2xl:h-36"
              />
            ) : (
              <Leaf
                aria-hidden
                className="pointer-events-none absolute -top-3 -left-3 h-20 w-20 -rotate-12 text-[#0a7d3f]/15 2xl:h-24 2xl:w-24"
              />
            )}
            {leafBottom ? (
              <SafeImage
                src={assetUrl(leafBottom)}
                alt=""
                width={220}
                height={220}
                className="pointer-events-none absolute right-0 bottom-0 h-24 w-auto object-contain sm:h-28 2xl:h-36"
              />
            ) : (
              <Leaf
                aria-hidden
                className="pointer-events-none absolute -right-4 -bottom-4 h-24 w-24 rotate-[200deg] text-[#0a7d3f]/15 2xl:h-28 2xl:w-28"
              />
            )}

            <div className="relative">
              {/* Logo — centered so it clears the corner leaf */}
              <div className="flex flex-col items-center">
                <SafeImage
                  src={logoSrc}
                  alt={setting.logoAlt || 'Jivo'}
                  width={180}
                  height={72}
                  className="h-11 w-auto object-contain sm:h-12 2xl:h-14"
                />
                {/* —— WELLNESS —— lockup */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-px w-5 bg-[#bdbcb2] sm:w-6" aria-hidden />
                  <span className="font-jost-medium text-[10px] tracking-[0.34em] text-[#6c7266] uppercase sm:text-xs">
                    Wellness
                  </span>
                </div>
              </div>

              {/* Tagline — large serif italic */}
              {setting.tagline && (
                <p className="mt-6 max-w-[15rem] font-serif text-2xl leading-tight text-pretty text-[#26312a] italic sm:text-[28px] 2xl:mt-7 2xl:text-3xl">
                  {setting.tagline}
                </p>
              )}

              <div className="mt-6 h-px w-12 bg-[#c3c2b8] 2xl:mt-7" />

              {/* Brand promise line */}
              {brandPromise && (
                <p className="font-jost-medium mt-5 text-sm text-[#3a423a] sm:text-[15px] 2xl:text-base">
                  {brandPromise}
                </p>
              )}
              {brandPromiseSub && (
                <p className="mt-1 text-xs text-[#6c7266] sm:text-sm 2xl:text-base">
                  {brandPromiseSub}
                </p>
              )}

              {/* Explore Products CTA */}
              {ctaLabel && (
                <Link
                  href={ctaHref}
                  {...(ctaExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0a7d3f] px-6 py-3 text-sm font-jost-medium text-white shadow-[0_10px_24px_rgba(10,125,63,0.28)] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#edece4] focus-visible:outline-none [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:bg-[#0c6f39] sm:w-auto 2xl:text-base"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 [@media(hover:hover)]:group-hover:translate-x-1" />
                </Link>
              )}

              {/* Follow us */}
              <p className="font-jost-bold mt-7 text-xs tracking-[0.2em] text-[#3a423a] uppercase 2xl:text-sm">
                {followLabel}
              </p>
              <FooterSocialIcons socials={socials} className="mt-3" />
            </div>
          </div>

          {/* ── Link columns (accordion on mobile, grid on desktop) ── */}
          <FooterColumns columns={columns} />
        </div>

        {/* ── Bottom bar: rounded bordered card ───────────────────── */}
        <div className="mt-6 rounded-2xl border border-[#d8d7cb] bg-white/50 px-5 py-2 sm:mt-8 sm:px-8 sm:py-5">
          <div className="grid grid-cols-1 divide-y divide-[#e0dfd4] sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 sm:divide-y-0 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#dcdbd0]">
            {/* Certifications — badge images (click to preview) + caption beside */}
            <div className="flex items-center gap-3 py-4 first:pt-0 sm:py-0 lg:px-6 lg:first:pl-0">
              <FooterCertificates
                certificates={certificates.map((cert) => ({
                  id: cert.id,
                  src: assetUrl(cert.imageUrl),
                  alt: cert.alt || 'Certification',
                }))}
                caption={setting.certificationText}
              />
            </div>

            {/* Copyright */}
            <div className="flex items-start gap-2.5 py-4 sm:py-0 lg:px-6">
              <Copyright className="mt-0.5 h-5 w-5 shrink-0 text-[#0a7d3f]" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs leading-relaxed whitespace-pre-line text-[#586055] sm:text-sm 2xl:text-base">
                  {copyright}
                </p>
                <a
                  href="#feedback"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[#586055] underline-offset-2 transition-colors [@media(hover:hover)]:hover:text-[#0a7d3f] hover:underline"
                >
                  Send feedback
                </a>
              </div>
            </div>

            {/* Contact — mail + phone with hover underline */}
            <div className="flex flex-col gap-2.5 py-4 sm:py-0 lg:px-6">
              {setting.email && (
                <Link
                  href={`mailto:${setting.email}`}
                  className="group flex items-center gap-2.5 text-xs text-[#586055] sm:text-sm 2xl:text-base"
                >
                  <Mail className="h-5 w-5 shrink-0 text-[#0a7d3f]" aria-hidden />
                  <HoverUnderlineText>
                    <span className="break-all sm:break-normal">{setting.email}</span>
                  </HoverUnderlineText>
                </Link>
              )}
              {setting.phone && (
                <Link
                  href={`tel:${setting.phone.replace(/\s+/g, '')}`}
                  className="group flex items-center gap-2.5 text-xs text-[#586055] sm:text-sm 2xl:text-base"
                >
                  <Phone className="h-5 w-5 shrink-0 text-[#0a7d3f]" aria-hidden />
                  <HoverUnderlineText>
                    <span className="whitespace-nowrap">
                      {setting.phone}
                      {setting.phoneLabel ? ` ${setting.phoneLabel}` : ''}
                    </span>
                  </HoverUnderlineText>
                </Link>
              )}
            </div>

            {/* Address — opens the map on click, with hover underline */}
            <div className="py-4 last:pb-0 sm:py-0 lg:px-6 lg:last:pr-0">
              {setting.address &&
                (mapHref ? (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open address in maps"
                    className="group flex items-start gap-2.5 text-xs text-[#586055] sm:text-sm 2xl:text-base"
                  >
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#0a7d3f]" aria-hidden />
                    <HoverUnderlineText>
                      <span className="leading-relaxed">{setting.address}</span>
                    </HoverUnderlineText>
                  </a>
                ) : (
                  <div className="flex items-start gap-2.5 text-xs text-[#586055] sm:text-sm 2xl:text-base">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#0a7d3f]" aria-hidden />
                    <span className="leading-relaxed">{setting.address}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
