import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';
import { SafeImage } from '@/components/shared';
import { getVisibleFooter } from '@/modules/footer';

export async function Footer() {
  const { columns, setting } = await getVisibleFooter();

  const logoSrc = setting.logoUrl || '/images/Jivo Logo.png';
  const year = new Date().getFullYear();
  const copyright = setting.copyrightText || `All Right Reserved © ${year}`;

  return (
    <footer className="bg-[#e8e8e8] text-[#333]">
      {/* ── Link columns ──────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        {/* divide-x adds a thin vertical line between columns at desktop;
            on mobile/tablet it auto-hides because columns wrap. */}
        <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-[#bbb]">
          {columns.map((column, idx) => (
            <div
              key={column.id}
              className={`px-4 sm:px-6 ${idx === 0 ? 'lg:pl-0' : ''} ${
                idx === columns.length - 1 ? 'lg:pr-0' : ''
              }`}
            >
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#222]">
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="group flex items-start gap-1.5 text-xs leading-relaxed text-[#555] transition-colors hover:text-[#222]"
                    >
                      <span
                        aria-hidden
                        className="shrink-0 text-[#555] transition-colors group-hover:text-[#222]"
                      >
                        &gt;
                      </span>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────── */}
      <div className="border-t border-[#ccc] bg-[#ddd]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-5 md:flex-row md:justify-between lg:px-12">
          {/* Left: logo + copyright */}
          <div className="flex items-center gap-4">
            <SafeImage
              src={logoSrc}
              alt={setting.logoAlt || 'Jivo'}
              width={80}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <p className="text-xs text-[#555]">{copyright}</p>
          </div>

          {/* Right: contact info */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {setting.address && (
              <div className="flex items-center gap-1.5 text-xs text-[#555]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{setting.address}</span>
              </div>
            )}
            {setting.email && (
              <Link
                href={`mailto:${setting.email}`}
                className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#222]"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>{setting.email}</span>
              </Link>
            )}
            {setting.phone && (
              <Link
                href={`tel:${setting.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#222]"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {setting.phone}
                  {setting.phoneLabel ? ` ${setting.phoneLabel}` : ''}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
