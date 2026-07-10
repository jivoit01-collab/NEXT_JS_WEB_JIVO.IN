import { SafeImage } from '@/components/shared/public';
import { isPlaceholderValue } from '@/components/shared/safe-image';
import type { CertificationsFeaturedContent } from '../types';

interface Props {
  data?: CertificationsFeaturedContent;
}

/** Wide highlighted badge below the grid (e.g. U.S. FDA). Server-rendered, lazy image. */
export function FeaturedBadgeSection({ data }: Props) {
  if (!data || !data.enabled || isPlaceholderValue(data.image)) return null;

  return (
    <section aria-label="Featured certification" className="mt-6 sm:mt-8 lg:mt-10">
      <div className="mx-auto max-w-md px-4 sm:max-w-lg lg:max-w-xl">
        <div className="[perspective:1000px]">
          <div className="group relative h-24 w-full overflow-hidden rounded-3xl bg-white/30 px-6 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.14)] ring-1 ring-white/45 backdrop-blur-[2px] transition-all duration-500 ease-out will-change-transform [transform-style:preserve-3d] hover:bg-white/45 hover:shadow-[0_24px_55px_rgba(0,0,0,0.18)] hover:[transform:translateY(-8px)_rotateX(4deg)_rotateY(4deg)_scale(1.015)] sm:h-28 dark:bg-white/30 dark:hover:bg-white/45">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/28 via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1 translate-x-[-130%] skew-x-[-18deg] bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[130%]"
            />
            <SafeImage
              src={data.image}
              alt={data.label}
              fill
              quality={80}
              className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 90vw, 576px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
