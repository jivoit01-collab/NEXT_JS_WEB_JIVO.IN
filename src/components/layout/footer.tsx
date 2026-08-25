import Link from 'next/link';
import { MapPin, Mail, Phone, Copyright, ArrowRight, Leaf, MessageSquarePlus } from 'lucide-react';
import { SafeImage } from '@/components/shared/public';
import { SmartLink } from '@/components/shared/smart-link';
import { HoverUnderlineText } from '@/components/shared/hover-underline-text';
import { FeedbackDialog } from '@/modules/platform/feedback';
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

/** Prefer the admin-set map link; otherwise build a Google Maps search from the address. */
function resolveMapHref(setting: VisibleFooterSetting): string | null {
  if (setting.addressMapUrl && setting.addressMapUrl.trim()) return setting.addressMapUrl.trim();
  if (setting.address && setting.address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(setting.address.trim())}`;
  }
  return null;
}

export async function Footer() {
  const { columns, setting, socials, certificates } = await getVisibleFooter();

  const logoSrc = assetUrl(setting.logoUrl);
  const year = new Date().getFullYear();
  const copyright = setting.copyrightText || `© ${year} Jivo Wellness Pvt. Ltd. All Rights Reserved.`;
  const followLabel = setting.followLabel || 'FOLLOW US';
  const brandPromise = setting.brandPromise || 'Pure. Natural. Trusted.';
  const brandPromiseSub = setting.brandPromiseSub || 'Since 2016';
  const ctaLabel = setting.ctaLabel || 'Products';
  const ctaRawHref = setting.ctaHref || '/products';
  const mapHref = resolveMapHref(setting);
  const leafTop = setting.leafImageTop;
  const leafBottom = setting.leafImageBottom;

  return (
    <footer className="bg-[#f5f4ef] text-[#2c352c]">
      {/* Container mirrors the navbar's so the footer edges line up with the nav
          links on wide screens instead of sitting in a narrower column. */}
      <div className="mx-auto w-full px-4 py-6 sm:px-8 sm:py-8 lg:px-18 2xl:py-10">
        {/* ── Top: brand card + link columns ─────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-10 2xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)] 2xl:gap-14">
          {/* ── Brand card ── */}
          <div className="relative overflow-hidden rounded-3xl bg-[#edece4] px-6 pt-8 pb-6 sm:px-7 sm:pt-9 sm:pb-7 2xl:px-9">
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

              {/* CTAs — Explore Products (primary) + Share Feedback (secondary).
                  Stacked on mobile; side by side from sm up. Equal-width with
                  small no-wrap text so both fit one row in the narrow lg card. */}
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-stretch sm:gap-2">
                {ctaLabel && (
                  <SmartLink
                    href={ctaRawHref}
                    fallback="/products"
                    className="group inline-flex min-h-10 w-full min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0a7d3f] px-4 py-2 text-sm whitespace-nowrap font-jost-medium text-white shadow-[0_10px_24px_rgba(10,125,63,0.28)] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#edece4] focus-visible:outline-none [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:bg-[#0c6f39] 2xl:text-sm"
                  >
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 [@media(hover:hover)]:group-hover:translate-x-1" />
                  </SmartLink>
                )}

                {/* Opens the reusable Feedback dialog (Phase 6.2) — secondary/outline. */}
                <FeedbackDialog
                  trigger={
                    <button
                      type="button"
                      className="inline-flex min-h-10 w-full min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#0a7d3f]/40 bg-transparent px-2.5 py-2 text-sm whitespace-nowrap font-jost-medium text-[#0a7d3f] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#edece4] focus-visible:outline-none [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:bg-[#0a7d3f]/8 2xl:text-sm"
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5 shrink-0" />
                     Feedback
                    </button>
                  }
                />
              </div>

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
          {/*
            The grid fills the card's full width (no `w-fit`, which left big
            empty margins). The certification column is `auto` so it grows or
            shrinks with however many badges an admin uploads, while the three
            text columns share the remaining space via `1fr`.

            `lg:items-stretch` makes every cell the full row height, so the
            `divide-x` rules are all the SAME length — with `items-center` each
            cell shrank to its own content and the dividers came out ragged.
            Each cell then centres its own content internally.
          */}
          <div className="grid w-full grid-cols-1 divide-y divide-[#e0dfd4] sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 sm:divide-y-0 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:gap-0 lg:divide-x lg:divide-[#dcdbd0]">
            {/* Certifications — one horizontal badge row, caption to its right */}
            <div className="flex min-w-0 flex-col items-start gap-2 py-4 first:pt-0 sm:py-0 lg:flex-row lg:items-center lg:justify-center lg:gap-3 lg:px-8 2xl:px-10">
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
            <div className="flex min-w-0 items-center justify-start gap-2.5 py-4 sm:py-0 lg:justify-center lg:px-8 2xl:px-10">
              <Copyright className="h-5 w-5 shrink-0 text-[#0a7d3f] 2xl:h-6 2xl:w-6" aria-hidden />
              {/* Capped measure so the line breaks to two rows and matches the
                  height of the certification and address cells. */}
              <p className="min-w-0 text-[clamp(0.8rem,0.72rem+0.3vw,1rem)] leading-relaxed whitespace-pre-line text-[#586055]">
                {copyright}
              </p>
            </div>

            {/* Contact — mail + phone with hover underline. `items-start` keeps
                the two rows left-aligned to each other, while the wrapper is
                centred in the cell by `w-fit mx-auto`. */}
            <div className="flex w-full min-w-0 flex-col items-start justify-center gap-2.5 py-4 sm:py-0 lg:mx-auto lg:w-fit lg:px-8 2xl:px-10">
              {setting.email && (
                <Link
                  href={`mailto:${setting.email}`}
                  className="group flex items-center gap-2.5 text-[clamp(0.8rem,0.72rem+0.3vw,1rem)] text-[#586055]"
                >
                  <Mail className="h-5 w-5 shrink-0 text-[#0a7d3f] 2xl:h-6 2xl:w-6" aria-hidden />
                  <HoverUnderlineText>
                    <span className="break-all sm:break-normal">{setting.email}</span>
                  </HoverUnderlineText>
                </Link>
              )}
              {setting.phone && (
                <Link
                  href={`tel:${setting.phone.replace(/\s+/g, '')}`}
                  className="group flex items-center gap-2.5 text-[clamp(0.8rem,0.72rem+0.3vw,1rem)] text-[#586055]"
                >
                  <Phone className="h-5 w-5 shrink-0 text-[#0a7d3f] 2xl:h-6 2xl:w-6" aria-hidden />
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
            <div className="flex min-w-0 items-center justify-start py-4 last:pb-0 sm:py-0 lg:justify-center lg:px-8 2xl:px-10">
              {setting.address &&
                (mapHref ? (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open address in maps"
                    className="group flex min-w-0 items-center gap-2.5 text-[clamp(0.8rem,0.72rem+0.3vw,1rem)] text-[#586055]"
                  >
                    <MapPin className="h-5 w-5 shrink-0 text-[#0a7d3f] 2xl:h-6 2xl:w-6" aria-hidden />
                    <HoverUnderlineText>
                      <span className="block leading-relaxed">{setting.address}</span>
                    </HoverUnderlineText>
                  </a>
                ) : (
                  <div className="flex min-w-0 items-center gap-2.5 text-[clamp(0.8rem,0.72rem+0.3vw,1rem)] text-[#586055]">
                    <MapPin className="h-5 w-5 shrink-0 text-[#0a7d3f] 2xl:h-6 2xl:w-6" aria-hidden />
                    <span className="block leading-relaxed">{setting.address}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
