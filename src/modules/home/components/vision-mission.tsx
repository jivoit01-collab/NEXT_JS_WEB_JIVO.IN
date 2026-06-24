'use client';

import { visionMissionContent as defaults } from '../data/home-content';
import type { VisionMissionContent } from '../types';
import { GsapReveal, ParallaxBg, SplitReveal } from './home-motion';

interface VisionMissionProps {
  data?: VisionMissionContent;
  isLoading?: boolean;
}

export function VisionMission({ data, isLoading }: VisionMissionProps) {
  if (isLoading) return <VisionMissionSkeleton />;

  const content = data ?? defaults;

  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      <ParallaxBg src={content.backgroundImage || defaults.backgroundImage} sizes="100vw" />

      {/* Legibility scrim — leans left where the body copy sits. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/20" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 text-white sm:px-6 md:px-8 2xl:max-w-7xl">
        {/* HEADING */}
        <SplitReveal
          as="h2"
          text={content.heading}
          type="words"
          className="font-jost-bold mb-10 block text-center font-sans text-[clamp(1.5rem,1rem+2vw,3.25rem)] tracking-[0.1em] text-balance uppercase sm:mb-12 sm:tracking-[0.15em] md:mb-14 2xl:mb-16"
        />

        {/* INTRO TEXT */}
        <GsapReveal stagger={0.1} y={28} className="w-full md:w-3/4 lg:w-2/4">
          <p className="text-pretty text-base italic text-white/85 md:text-lg lg:text-xl 2xl:text-2xl">
            {content.subtitle}
          </p>

          {content.intro && (
            <p className="mt-6 text-base leading-relaxed text-pretty text-white/80 md:text-lg 2xl:text-xl">
              {content.intro}
            </p>
          )}

          {content.intro2 && (
            <p className="mt-4 text-base leading-relaxed text-pretty text-white/80 md:text-lg 2xl:text-xl">
              {content.intro2}
            </p>
          )}
        </GsapReveal>

        {/* VISION + MISSION */}
        <GsapReveal
          stagger={0.16}
          y={36}
          className="mt-14 grid grid-cols-1 gap-10 sm:mt-16 md:mt-20 md:grid-cols-2 md:gap-16 lg:gap-24 2xl:mt-24 2xl:gap-28"
        >
          {/* VISION */}
          <div className="max-w-md 2xl:max-w-xl">
            <SplitReveal
              as="h3"
              text="Vision"
              className="font-jost-extrabold mb-4 block font-sans text-[clamp(1.5rem,1.1rem+1.4vw,2.75rem)] tracking-[0.15em] uppercase sm:mb-6"
            />
            <p className="text-base leading-relaxed text-pretty text-white/85 md:text-lg 2xl:text-xl">
              {content.vision}
            </p>
          </div>

          {/* MISSION */}
          <div className="max-w-md md:ml-auto 2xl:max-w-xl">
            <SplitReveal
              as="h3"
              text="Mission"
              className="font-jost-extrabold mb-4 block font-sans text-[clamp(1.5rem,1.1rem+1.4vw,2.75rem)] tracking-[0.15em] uppercase sm:mb-6"
            />
            <p className="text-base leading-relaxed text-pretty text-white/85 md:text-lg 2xl:text-xl">
              {content.mission}
            </p>
          </div>
        </GsapReveal>
      </div>
    </section>
  );
}

// ---- Skeleton ----

export function VisionMissionSkeleton() {
  return (
    <section className="relative w-full animate-pulse overflow-hidden bg-muted py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8 2xl:max-w-7xl">
        {/* Heading */}
        <div className="mx-auto mb-10 h-9 w-96 rounded-md bg-muted-foreground/20 sm:mb-12 md:mb-14 md:h-11 2xl:mb-16 2xl:h-14 2xl:w-2/3" />
        {/* Subtitle + intro lines */}
        <div className="w-full space-y-3 md:w-3/4 lg:w-2/4">
          <div className="h-5 w-full rounded bg-muted-foreground/20 2xl:h-6" />
          <div className="h-4 w-5/6 rounded bg-muted-foreground/15 2xl:h-5" />
          <div className="h-4 w-4/6 rounded bg-muted-foreground/15 2xl:h-5" />
        </div>
        {/* Vision + Mission 2-column */}
        <div className="mt-14 grid grid-cols-1 gap-10 sm:mt-16 md:mt-20 md:grid-cols-2 md:gap-16 lg:gap-24 2xl:mt-24 2xl:gap-28">
          {[0, 1].map((i) => (
            <div key={i} className="max-w-md space-y-4 2xl:max-w-xl">
              <div className="h-8 w-32 rounded-md bg-muted-foreground/20 sm:h-10 2xl:h-12 2xl:w-44" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted-foreground/15 2xl:h-5" />
                <div className="h-4 w-5/6 rounded bg-muted-foreground/15 2xl:h-5" />
                <div className="h-4 w-4/6 rounded bg-muted-foreground/15 2xl:h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
