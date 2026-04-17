import { SafeImage } from '@/components/shared';
import type { TheStoryHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';

interface Props {
  data?: TheStoryHeroContent;
}

/** Full-bleed hero — EAGER loaded (above the fold, priority LCP). */
export function TheStoryHero({ data }: Props) {
  const { heading, paragraph, backgroundImage } = data ?? defaultHeroContent;

  return (
    <section className="relative flex min-h-[60vh] items-end overflow-hidden sm:min-h-[70vh] lg:min-h-[85vh]">
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#c5a832] to-[#8a7a1e]" />
      )}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-32 lg:px-12 lg:pb-24">
        <h1 className="font-jost-bold text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl sm:tracking-[0.2em] md:text-5xl lg:text-6xl">
          {heading}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:mt-4 sm:text-base md:text-lg lg:mt-6 lg:text-xl">
          {paragraph}
        </p>
      </div>
    </section>
  );
}
