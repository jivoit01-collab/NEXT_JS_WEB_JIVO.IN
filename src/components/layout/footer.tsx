import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';
import { SafeImage } from '@/components/shared';
import { getVisibleFooter } from '@/modules/footer';
import type { FooterColumnWithLinks } from '@/modules/footer/types';

function ColumnBody({ column }: { column: FooterColumnWithLinks }) {
  return (
    <>
      <h4 className="mb-3 text-sm font-jost-bold uppercase tracking-[0.15em] text-[#222] sm:mb-4 sm:text-base md:mb-5 md:text-lg 2xl:mb-6 2xl:text-xl">
        {column.title}
      </h4>
      <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 2xl:space-y-4">
        {column.links.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href}
              className="group relative inline-flex items-start gap-1.5 text-xs leading-snug text-[#555] transition-colors duration-300 sm:gap-2 sm:text-sm md:text-base 2xl:text-lg"
            >
              <span className="mt-[1px] shrink-0 transition-transform duration-300 group-hover:translate-x-1">
                &gt;
              </span>
              <span className="relative break-words transition-colors duration-300 group-hover:text-[#111]">
                {link.title}
                <span className="absolute left-0 -bottom-0.5 h-[1px] w-0 bg-[#111] transition-all duration-300 group-hover:w-full" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export async function Footer() {
  const { columns, setting } = await getVisibleFooter();

  // When there are 5 columns, the last one (Quick Links) leaves a blank cell
  // in the 2/3/4-col grids used below `lg`. Stack it under the first column
  // on those breakpoints and restore it as its own cell at `lg`.
  const hasOverflowColumn = columns.length >= 5;
  const mainColumns = hasOverflowColumn ? columns.slice(0, -1) : columns;
  const extraColumn = hasOverflowColumn ? columns[columns.length - 1] : null;

  const raw = setting.logoUrl || '';
  const logoSrc = !raw
    ? '/api/uploads/placeholder.png'
    : raw.startsWith('/') || raw.startsWith('http')
      ? raw
      : `/api/uploads/${raw}`;

  const year = new Date().getFullYear();
  const copyright =
    setting.copyrightText || `All Right Reserved © ${year}`;

  return (
    <footer className="bg-[#e8e8e8] text-[#333]">
      {/* ── Link columns ──────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:py-14 lg:px-8 lg:py-10 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-y-10 md:grid-cols-4 md:gap-x-4 md:gap-y-12 lg:grid-cols-5 lg:divide-x lg:divide-[#bbb] 2xl:gap-x-10 2xl:gap-y-14">
          {mainColumns.map((column, idx) => (
            <div
              key={column.id}
              className={`min-w-0 lg:px-4 2xl:px-6 ${idx === 0 ? 'lg:pl-0 2xl:pl-0' : ''}`}
            >
              <ColumnBody column={column} />

              {idx === 0 && extraColumn && (
                <div className="mt-8 sm:mt-10 md:mt-12 lg:hidden">
                  <ColumnBody column={extraColumn} />
                </div>
              )}
            </div>
          ))}

          {extraColumn && (
            <div
              key={extraColumn.id}
              className="hidden min-w-0 lg:block lg:px-6 lg:pr-0 2xl:px-8 2xl:pr-0"
            >
              <ColumnBody column={extraColumn} />
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────── */}
      <div className="border-t border-[#ccc] bg-[#ddd]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-5 text-center sm:gap-5 sm:px-6 sm:py-6 md:py-7 lg:flex-row lg:justify-between lg:gap-6 lg:px-8 lg:text-left xl:px-12 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-8 2xl:gap-8">

          {/* Logo + copyright */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3 md:gap-4 2xl:gap-5">
            <SafeImage
              src={logoSrc}
              alt={setting.logoAlt || 'Jivo'}
              width={140}
              height={56}
              className="h-7 w-auto object-contain sm:h-8 md:h-9 2xl:h-12"
            />
            <p className="text-xs leading-snug text-[#555] sm:text-sm md:text-base 2xl:text-lg">
              {copyright}
            </p>
          </div>

          {/* Contact */}
          <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2 md:gap-x-6 lg:gap-x-8 2xl:gap-x-10">
            {setting.address && (
              <div className="flex max-w-full items-center gap-1.5 text-xs text-[#555] sm:text-sm md:gap-2 md:text-base 2xl:gap-2.5 2xl:text-lg">
                <MapPin className="h-4 w-4 shrink-0 md:h-5 md:w-5 2xl:h-6 2xl:w-6" />
                <span className="break-words">{setting.address}</span>
              </div>
            )}

            {setting.email && (
              <Link
                href={`mailto:${setting.email}`}
                className="group flex max-w-full items-center gap-1.5 text-xs text-[#555] transition-colors duration-300 hover:text-[#111] sm:text-sm md:gap-2 md:text-base 2xl:gap-2.5 2xl:text-lg"
              >
                <Mail className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 md:h-5 md:w-5 2xl:h-6 2xl:w-6" />
                <span className="relative break-all sm:break-normal">
                  {setting.email}
                  <span className="absolute left-0 -bottom-0.5 h-[1px] w-0 bg-[#111] transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            )}

            {setting.phone && (
              <Link
                href={`tel:${setting.phone.replace(/\s+/g, '')}`}
                className="group flex items-center gap-1.5 text-xs text-[#555] transition-colors duration-300 hover:text-[#111] sm:text-sm md:gap-2 md:text-base 2xl:gap-2.5 2xl:text-lg"
              >
                <Phone className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 md:h-5 md:w-5 2xl:h-6 2xl:w-6" />
                <span className="relative whitespace-nowrap">
                  {setting.phone}
                  {setting.phoneLabel ? ` ${setting.phoneLabel}` : ''}
                  <span className="absolute left-0 -bottom-0.5 h-[1px] w-0 bg-[#111] transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
