import { SafeImage } from '@/components/shared/public';
import { isPlaceholderValue } from '@/components/shared/safe-image';
import type { CertificationsHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';

interface Props {
  data?: CertificationsHeroContent;
}

/**
 * Full-bleed page background + heading. Eager (server-rendered) so the
 * background image is the LCP element — never lazy-loaded, never animated.
 * The single background image spans the whole page; the badge grid and
 * featured badge render transparently over it.
 */
export function CertificationsHero({ data }: Props) {
  const { heading, subheading, backgroundImage } = data ?? defaultHeroContent;
  const hasBackground = !isPlaceholderValue(backgroundImage);

  return (
    <>
      {/* Single page background — LCP candidate. Decorative → alt="". */}
      {hasBackground ? (
        <SafeImage
          src={backgroundImage}
          alt=""
          fill
          priority
          fetchPriority="high"
          quality={85}
          className="-z-10 object-cover object-top"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#4b4f4d] via-[#3d413f] to-[#2c302e]" />
      )}

      {/* Contrast scrim so white heading text stays ≥ 4.5:1 over any photo. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-linear-to-b from-black/45 to-transparent sm:h-80"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 pt-28 text-center sm:px-6 sm:pt-32 md:pt-36 lg:px-8 lg:pt-40 2xl:max-w-screen-2xl 2xl:px-20 2xl:pt-48">
        <h1 className="font-jost-bold text-balance text-3xl tracking-[0.08em] text-white uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-4xl sm:tracking-[0.12em] md:text-5xl lg:text-6xl 2xl:text-7xl">
          {heading}
        </h1>
        <p className="mt-4 text-balance text-xs font-jost-medium tracking-[0.3em] text-white/85 uppercase drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:mt-5 sm:text-sm md:text-base 2xl:mt-6 2xl:text-lg">
          {subheading}
        </p>
      </div>
    </>
  );
}

export function CertificationsHeroSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-28 text-center sm:px-6 sm:pt-32 md:pt-36 lg:px-8 lg:pt-40 2xl:max-w-screen-2xl 2xl:px-20 2xl:pt-48">
      <div className="mx-auto h-9 w-64 animate-pulse rounded-md bg-white/25 sm:h-11 sm:w-80 lg:h-14 lg:w-96 2xl:h-16" />
      <div className="mx-auto mt-4 h-3.5 w-48 animate-pulse rounded bg-white/15 sm:mt-5 sm:h-4 sm:w-60 2xl:h-5" />
    </div>
  );
}
