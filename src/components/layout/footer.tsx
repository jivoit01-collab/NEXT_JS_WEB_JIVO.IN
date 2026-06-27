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
              className="group relative inline-flex items-start gap-1.5 text-xs leading-snug text-[#555] transition-colors duration-300 sm:gap-2 sm:text-sm md:text-base 2xl:text-lg"
            >
              <span className="mt-[1px] shrink-0 text-[#0a7d3f] transition-transform duration-300 [@media(hover:hover)]:group-hover:translate-x-1">
                &gt;
              </span>
              <span className="relative break-words transition-colors duration-300 [@media(hover:hover)]:group-hover:text-[#111]">
                {link.title}
                <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-[#0a7d3f] transition-all duration-300 [@media(hover:hover)]:group-hover:w-full" />
              </span>
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

  const hasCertRegion =
    certificates.length > 0 || Boolean(setting.certificationText) || Boolean(setting.madeInText);

  return (
    <footer className="bg-[#e8e8e8] text-[#333]">
      {/* ── Upper grid: brand block + link columns ─────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:py-14 lg:px-8 lg:py-12 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-16">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-12 2xl:gap-20">
          {/* Brand block */}
          <div className="min-w-0">
            <SafeImage
              src={logoSrc}
              alt={setting.logoAlt || 'Jivo'}
              width={160}
              height={64}
              className="h-9 w-auto object-contain sm:h-10 2xl:h-12"
            />

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

          {/* Link columns — reflow 2 → 4 cols, content unchanged */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-12 2xl:gap-x-10 2xl:gap-y-14">
            {columns.map((column) => (
              <div key={column.id} className="min-w-0">
                <ColumnBody column={column} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar: address → email → phone → certs → logo+copyright ── */}
      <div className="border-t border-[#ccc] bg-[#ddd]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-9">
          {/* Region 1 — contact: address, then email above phone */}
          <div className="flex flex-col items-center gap-2.5 text-center lg:items-start lg:text-left 2xl:gap-3">
            {setting.address && (
              <div className="flex max-w-full items-start gap-1.5 text-xs text-[#555] sm:items-center sm:text-sm md:gap-2 md:text-base 2xl:gap-2.5 2xl:text-lg">
                <MapPin className="mt-px h-4 w-4 shrink-0 text-[#0a7d3f] sm:mt-0 md:h-5 md:w-5 2xl:h-6 2xl:w-6" />
                <span className="break-words">{setting.address}</span>
              </div>
            )}

            {setting.email && (
              <Link
                href={`mailto:${setting.email}`}
                className="group flex max-w-full items-center gap-1.5 text-xs text-[#555] transition-colors duration-300 [@media(hover:hover)]:hover:text-[#111] sm:text-sm md:gap-2 md:text-base 2xl:gap-2.5 2xl:text-lg"
              >
                <Mail className="h-4 w-4 shrink-0 text-[#0a7d3f] transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-110 md:h-5 md:w-5 2xl:h-6 2xl:w-6" />
                <span className="relative break-all sm:break-normal">
                  {setting.email}
                  <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-[#111] transition-all duration-300 [@media(hover:hover)]:group-hover:w-full" />
                </span>
              </Link>
            )}

            {setting.phone && (
              <Link
                href={`tel:${setting.phone.replace(/\s+/g, '')}`}
                className="group flex items-center gap-1.5 text-xs text-[#555] transition-colors duration-300 [@media(hover:hover)]:hover:text-[#111] sm:text-sm md:gap-2 md:text-base 2xl:gap-2.5 2xl:text-lg"
              >
                <Phone className="h-4 w-4 shrink-0 text-[#0a7d3f] transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-110 md:h-5 md:w-5 2xl:h-6 2xl:w-6" />
                <span className="relative whitespace-nowrap">
                  {setting.phone}
                  {setting.phoneLabel ? ` ${setting.phoneLabel}` : ''}
                  <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-[#111] transition-all duration-300 [@media(hover:hover)]:group-hover:w-full" />
                </span>
              </Link>
            )}
          </div>

          {/* Region 2 — certifications row + shared caption (+ optional made-in) */}
          {hasCertRegion && (
            <div className="mt-5 flex flex-col items-center gap-3 border-t border-[#ccc] pt-5 text-center sm:gap-4 lg:flex-row lg:items-center lg:justify-between lg:text-left 2xl:mt-6 2xl:pt-6">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:justify-start">
                {certificates.map((cert) => (
                  <SafeImage
                    key={cert.id}
                    src={assetUrl(cert.imageUrl)}
                    alt={cert.alt || ''}
                    width={96}
                    height={48}
                    className="h-9 w-auto object-contain sm:h-10 2xl:h-12"
                  />
                ))}
                {setting.certificationText && (
                  <span className="max-w-xs text-xs leading-snug text-pretty text-[#555] sm:text-sm 2xl:text-base">
                    {setting.certificationText}
                  </span>
                )}
              </div>

              {setting.madeInText && (
                <div className="flex items-center gap-1.5 text-xs text-[#555] sm:text-sm 2xl:text-base">
                  <Heart className="h-4 w-4 shrink-0 text-[#0a7d3f] 2xl:h-5 2xl:w-5" fill="currentColor" />
                  <span className="whitespace-nowrap">{setting.madeInText}</span>
                </div>
              )}
            </div>
          )}

          {/* Region 3 — logo + copyright at the very bottom */}
          <div className="mt-5 flex flex-col items-center gap-2 border-t border-[#ccc] pt-5 text-center sm:flex-row sm:justify-center sm:gap-3 lg:justify-start lg:text-left 2xl:mt-6 2xl:gap-4 2xl:pt-6">
            <SafeImage
              src={logoSrc}
              alt={setting.logoAlt || 'Jivo'}
              width={140}
              height={56}
              className="h-7 w-auto object-contain sm:h-8 md:h-9 2xl:h-11"
            />
            <p className="text-xs leading-snug text-[#555] sm:text-sm md:text-base 2xl:text-lg">
              {copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
