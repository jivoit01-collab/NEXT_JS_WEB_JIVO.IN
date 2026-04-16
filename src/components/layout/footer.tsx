import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';
import { SafeImage } from '@/components/shared';
import { getVisibleFooter } from '@/modules/footer';

export async function Footer() {
  const { columns, setting } = await getVisibleFooter();

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
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-[#bbb]">
          {columns.map((column, idx) => (
            <div
              key={column.id}
              className={`px-4 sm:px-6 ${idx === 0 ? 'lg:pl-0' : ''} ${
                idx === columns.length - 1 ? 'lg:pr-0' : ''
              }`}
            >
              <h4 className="mb-4 text-md font-jost-bold uppercase tracking-[0.15em] text-[#222]">
                {column.title}
              </h4>

              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-start gap-2 text-sm text-[#555] transition-all duration-300"
                    >
                      {/* Arrow */}
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        &gt;
                      </span>

                      {/* Text */}
                      <span className="relative transition-colors duration-300 group-hover:text-[#111]">
                        {link.title}

                        {/* Animated underline */}
                        <span className="absolute left-0 -bottom-0.5 h-[1px] w-0 bg-[#111] transition-all duration-300 group-hover:w-full" />
                      </span>
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
          
          {/* Logo + copyright */}
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

          {/* Contact */}
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
                className="group flex items-center gap-1.5 text-xs text-[#555] transition-all duration-300 hover:text-[#111]"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative">
                  {setting.email}
                  <span className="absolute left-0 -bottom-0.5 h-[1px] w-0 bg-[#111] transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            )}

            {setting.phone && (
              <Link
                href={`tel:${setting.phone.replace(/\s+/g, '')}`}
                className="group flex items-center gap-1.5 text-xs text-[#555] transition-all duration-300 hover:text-[#111]"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative">
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