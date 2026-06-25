import { SafeImage } from '@/components/shared/public';
import type { TheStoryHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';

interface Props {
  data?: TheStoryHeroContent;
}

export function TheStoryHero({ data }: Props) {
  const { heading, paragraph, backgroundImage } = data ?? defaultHeroContent;

  return (
    <section className="relative flex min-h-[60svh] items-center overflow-hidden sm:min-h-[70svh] lg:min-h-dvh">
      {/* Background */}
      {backgroundImage ? (
        <SafeImage
          src={backgroundImage}
          alt=""
          fill
          priority
          fetchPriority="high"
          quality={90}
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-[#c5a832] to-[#8a7a1e]" />
      )}

      <div className="relative z-10 mx-auto flex min-h-[50vh] w-full max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8 2xl:max-w-[1440px]">
        {/* Heading: Restrained to roughly half-width on desktop to clear the bottle */}
        <h1 className="font-jost-bold inline-block cursor-default text-[clamp(1.75rem,4vw,4.5rem)] leading-tight text-balance text-white uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out will-change-transform hover:-translate-y-1.5 hover:drop-shadow-[0_10px_30px_rgba(197,168,50,0.45)] md:max-w-[50%] lg:max-w-[55%]">
          {heading}
        </h1>

        {/* Paragraph: Forced to wrap downward on medium screens and up */}
        <p className="mt-4 w-full cursor-default text-[clamp(0.875rem,1.5vw,1.25rem)] leading-relaxed text-pretty text-white/90 transition-all duration-500 ease-out hover:-translate-y-1 hover:text-white md:max-w-[45%] lg:max-w-[50%]">
          {paragraph}
        </p>
      </div>
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

export function TheStoryHeroSkeleton() {
  return (
    <section className="bg-muted relative flex min-h-[60vh] animate-pulse items-center overflow-hidden sm:min-h-[70vh] lg:min-h-screen">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-20 pb-12 sm:px-6 sm:pt-28 sm:pb-16 md:pt-32 lg:px-8 lg:pt-40 lg:pb-24 2xl:max-w-screen-2xl 2xl:px-20 2xl:pt-52 2xl:pb-36">
        {/* Heading */}
        <div className="bg-muted-foreground/20 h-9 w-56 rounded-md sm:h-11 sm:w-72 lg:h-14 lg:w-96 2xl:h-16 2xl:w-120" />
        {/* Paragraph */}
        <div className="mt-3 max-w-xl space-y-2 sm:mt-4 sm:max-w-2xl lg:mt-6 2xl:mt-8 2xl:max-w-3xl">
          <div className="bg-muted-foreground/15 h-4 w-full rounded sm:h-5 2xl:h-6" />
          <div className="bg-muted-foreground/15 h-4 w-5/6 rounded sm:h-5 2xl:h-6" />
          <div className="bg-muted-foreground/15 h-4 w-3/4 rounded sm:h-5 2xl:h-6" />
        </div>
      </div>
    </section>
  );
}
