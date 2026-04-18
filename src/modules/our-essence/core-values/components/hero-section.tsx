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
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 sm:pt-32 md:pt-40 lg:px-8 lg:pt-48">
        <h1 className="font-jost-bold text-3xl uppercase tracking-[0.08em] text-white sm:text-4xl sm:tracking-[0.12em] md:text-4xl lg:text-5xl xl:text-5xl">
          {heading}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg lg:mt-6 lg:text-xl">
          {subtitle}
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-base md:text-lg lg:mt-6 lg:text-xl">
          {paragraph}
        </p>
      </div>
    </section>
  );
}
