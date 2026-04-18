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
    <section className="relative flex min-h-[60vh] items-end overflow-hidden sm:min-h-[70vh] lg:min-h-screen">
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#c5a832] via-[#b8902e] to-[#6b4e1a]" />
      )}

      {/* Left-side darken for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

      {/* Content — bottom-left */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 sm:px-6 sm:pb-20 lg:px-11 lg:pb-28">
        <h1 className="font-jost-bold text-3xl uppercase text-white sm:text-4xl sm:tracking-[0.12em] md:text-5xl lg:text-6xl">
          {heading}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg lg:mt-6">
          {subtitle}
        </p>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base md:text-lg lg:mt-6">
          {paragraph}
        </p>
      </div>
    </section>
  );
}
