import { SafeImage } from '@/components/shared';
import type { CoreValuesHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';

interface Props {
  data?: CoreValuesHeroContent;
}

/** Full-bleed hero — EAGER loaded (above the fold, priority LCP). */
export function CoreValuesHero({ data }: Props) {
  const { heading, subtitle, paragraph, backgroundImage } = data ?? defaultHeroContent;

  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden sm:min-h-[70vh] lg:min-h-screen">
      {/* Background image */}
      {backgroundImage ? (
        <SafeImage
          src={backgroundImage}
          alt={heading}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-[#c5a832] via-[#b8902e] to-[#6b4e1a]" />
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 sm:pt-32 md:pt-40 lg:px-8 lg:pt-48 2xl:max-w-screen-2xl 2xl:px-20 2xl:pt-60">
        <h1 className="font-jost-bold text-3xl uppercase tracking-[0.08em] text-white sm:text-4xl sm:tracking-[0.12em] md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
          {heading}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg lg:mt-6 lg:text-xl 2xl:mt-8 2xl:max-w-3xl 2xl:text-2xl">
          {subtitle}
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-base md:text-lg lg:mt-6 lg:text-xl 2xl:mt-8 2xl:max-w-3xl 2xl:text-2xl">
          {paragraph}
        </p>
      </div>
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

export function CoreValuesHeroSkeleton() {
  return (
    <section className="relative flex min-h-[60vh] animate-pulse items-center overflow-hidden bg-muted sm:min-h-[70vh] lg:min-h-screen">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 sm:pt-32 md:pt-40 lg:px-8 lg:pt-48 2xl:max-w-screen-2xl 2xl:px-20 2xl:pt-60">
        {/* Heading */}
        <div className="h-9 w-64 rounded-md bg-muted-foreground/20 sm:h-11 sm:w-80 lg:h-14 lg:w-104 2xl:h-16 2xl:w-lg" />
        {/* Subtitle */}
        <div className="mt-4 max-w-xl space-y-2 lg:mt-6 2xl:mt-8 2xl:max-w-3xl">
          <div className="h-4 w-full rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
          <div className="h-4 w-4/5 rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
        </div>
        {/* Paragraph */}
        <div className="mt-4 max-w-xl space-y-2 sm:mt-5 lg:mt-6 2xl:mt-8 2xl:max-w-3xl">
          <div className="h-4 w-full rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
          <div className="h-4 w-5/6 rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
          <div className="h-4 w-3/4 rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
        </div>
      </div>
    </section>
  );
}
