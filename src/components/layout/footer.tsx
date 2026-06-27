import Link from 'next/link';
import { MapPin, Mail, Phone, Heart } from 'lucide-react';
import { SafeImage } from '@/components/shared/public';
import { getVisibleFooter } from '@/modules/footer';
import type { VisibleFooterColumnWithLinks } from '@/modules/footer/types';
import { FooterSocialIcons } from './footer-social-icons';

/** Resolve a stored asset value (bare filename, absolute path, or URL) to a src. */
function assetUrl(raw: string | null | undefined, fallback = '/api/uploads/placeholder.png') {
  if (!raw) return fallback;
  return raw.startsWith('/') || raw.startsWith('http') ? raw : `/api/uploads/${raw}`;
}

// Muted link → black + underline on hover, gated to devices that support hover.
const LINK_TEXT =
  'underline-offset-4 transition-colors duration-200 [@media(hover:hover)]:group-hover:text-black [@media(hover:hover)]:group-hover:underline';

function ColumnBody({ column }: { column: VisibleFooterColumnWithLinks }) {
  return (
    <>
      <h4 className="font-jost-bold mb-3 text-sm tracking-[0.15em] text-[#222] uppercase sm:mb-4 sm:text-base md:mb-5 md:text-lg 2xl:mb-6 2xl:text-xl">
        {column.title}
      </h4>
      <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 2xl:space-y-4">
        {column.links.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href}
              className="group inline-flex items-start gap-1.5 text-xs leading-snug text-[#555] sm:gap-2 sm:text-sm md:text-base 2xl:text-lg"
            >
              <span className="mt-[1px] shrink-0 text-[#0a7d3f]">&gt;</span>
              <span className={`break-words text-[#555] ${LINK_TEXT}`}>{link.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export async function Footer() {
  const { columns, setting, socials, certificates } = await getVisibleFooter();

  const logoSrc = assetUrl(setting.logoUrl);
  const year = new Date().getFullYear();
  const copyright = setting.copyrightText || `All Right Reserved © ${year}`;
  const followLabel = setting.followLabel || 'FOLLOW US';

  return (
    <footer className="bg-[#e8e8e8] text-[#333]">
      {/* ── Upper section: brand block + link columns ──────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:py-14 lg:px-8 lg:py-12 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-16">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-0 2xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          {/* Brand block */}
          <div className="min-w-0 lg:pr-10 2xl:pr-14">
            <SafeImage
              src={logoSrc}
              alt={setting.logoAlt || 'Jivo'}
              width={160}
              height={64}
              className="h-9 w-auto object-contain sm:h-10 2xl:h-12"
            />

            {/* —— WELLNESS —— lockup */}
            <div className="mt-2 flex items-center gap-2">
              <span className="h-px w-5 bg-[#bbb] sm:w-6" aria-hidden />
              <span className="font-jost-medium text-[10px] tracking-[0.34em] text-[#666] uppercase sm:text-xs">
                Wellness
              </span>
              <span className="h-px w-5 bg-[#bbb] sm:w-6" aria-hidden />
            </div>

            {setting.tagline && (
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-pretty text-[#555] sm:text-base 2xl:max-w-sm 2xl:text-lg">
                {setting.tagline}
              </p>
            )}

            <div className="mt-5 h-px w-12 bg-[#bbb] 2xl:mt-6" />

            <p className="font-jost-bold mt-5 text-xs tracking-[0.2em] text-[#222] uppercase sm:text-sm 2xl:mt-6 2xl:text-base">
              {followLabel}
            </p>
            <FooterSocialIcons socials={socials} className="mt-3 2xl:mt-4" />
          </div>

          {/* Link columns — vertical dividers between them at md+, content unchanged */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-y-10 md:grid-cols-4 md:gap-x-0 md:gap-y-12 md:divide-x md:divide-[#ccc] lg:border-l lg:border-[#ccc]">
            {columns.map((column, idx) => (
              <div
                key={column.id}
                className={`min-w-0 md:px-5 2xl:px-7 ${idx === 0 ? 'md:pl-5 lg:pl-8 2xl:pl-10' : ''}`}
              >
                <ColumnBody column={column} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom section: single 4-column row ────────────────── */}
      <div className="border-t border-[#c4c4c4]">
        <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#c4c4c4]">
            {/* Col 1 — Certifications */}
            <div className="lg:px-6 lg:first:pl-0">
              {certificates.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {certificates.map((cert) => (
                    <SafeImage
                      key={cert.id}
                      src={assetUrl(cert.imageUrl)}
                      alt={cert.alt || ''}
                      width={88}
                      height={44}
                      className="h-9 w-auto object-contain sm:h-10 2xl:h-12"
                    />
                  ))}
                </div>
              )}
              {setting.certificationText && (
                <p className="text-xs leading-relaxed whitespace-pre-line text-[#555] sm:text-sm 2xl:text-base">
                  {setting.certificationText}
                </p>
              )}
            </div>

            {/* Col 2 — Copyright (no logo) */}
            <div className="lg:px-6">
              <p className="text-xs leading-relaxed whitespace-pre-line text-[#555] sm:text-sm 2xl:text-base">
                {copyright}
              </p>
            </div>

            {/* Col 3 — Contact links */}
            <div className="flex flex-col gap-2 lg:px-6 2xl:gap-2.5">
              {setting.email && (
                <Link
                  href={`mailto:${setting.email}`}
                  className="group flex items-center gap-2 text-xs text-[#555] sm:text-sm 2xl:text-base"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[#888] 2xl:h-5 2xl:w-5" />
                  <span className={`break-all text-[#555] sm:break-normal ${LINK_TEXT}`}>
                    {setting.email}
                  </span>
                </Link>
              )}
              {setting.phone && (
                <Link
                  href={`tel:${setting.phone.replace(/\s+/g, '')}`}
                  className="group flex items-center gap-2 text-xs text-[#555] sm:text-sm 2xl:text-base"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#888] 2xl:h-5 2xl:w-5" />
                  <span className={`whitespace-nowrap text-[#555] ${LINK_TEXT}`}>
                    {setting.phone}
                    {setting.phoneLabel ? ` ${setting.phoneLabel}` : ''}
                  </span>
                </Link>
              )}
            </div>

            {/* Col 4 — Address + made-in */}
            <div className="flex flex-col gap-2 lg:px-6 lg:last:pr-0 2xl:gap-2.5">
              {setting.address && (
                <div className="flex items-start gap-2 text-xs leading-relaxed text-[#555] sm:text-sm 2xl:text-base">
                  <MapPin className="mt-px h-4 w-4 shrink-0 text-[#888] 2xl:h-5 2xl:w-5" />
                  <span className="break-words">{setting.address}</span>
                </div>
              )}
              {setting.madeInText && (
                <div className="flex items-center gap-2 text-xs text-[#555] sm:text-sm 2xl:text-base">
                  <Heart
                    className="h-4 w-4 shrink-0 text-[#0a7d3f] 2xl:h-5 2xl:w-5"
                    fill="currentColor"
                  />
                  <span>{setting.madeInText}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
