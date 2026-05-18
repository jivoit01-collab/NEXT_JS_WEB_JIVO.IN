'use client';

import { SafeImage, SplitWords } from '@/components/shared';
import { visionMissionContent as defaults } from '../data/home-content';
import type { VisionMissionContent } from '../types';
import { motion } from 'framer-motion';
import { container, fadeUp, defaultViewport } from '@/lib/animation-variants';

interface VisionMissionProps {
  data?: VisionMissionContent;
  isLoading?: boolean;
}

export function VisionMission({ data, isLoading }: VisionMissionProps) {
  if (isLoading) return <VisionMissionSkeleton />;

  const content = data ?? defaults;

  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      <SafeImage
        src={content.backgroundImage || defaults.backgroundImage}
        alt="Nature background"
        fill
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/25" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto max-w-6xl px-4 text-white sm:px-6 md:px-8 2xl:max-w-7xl"
      >

        {/* HEADING */}
        <motion.div variants={fadeUp}>
          <h2 className="font-sans text-center mb-10 text-2xl font-jost-bold uppercase tracking-[0.15em] sm:mb-12 sm:text-3xl md:mb-14 md:text-4xl lg:text-5xl 2xl:mb-16 2xl:text-6xl">
            <SplitWords text={content.heading} inheritParent />
          </h2>
        </motion.div>

        {/* INTRO TEXT */}
        <motion.div variants={fadeUp} className="w-full md:w-3/4 lg:w-2/4">
          <p className="text-base italic text-white/80 md:text-lg lg:text-xl 2xl:text-2xl">
            {content.subtitle}
          </p>

          {content.intro && (
            <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base 2xl:text-lg">
              {content.intro}
            </p>
          )}

          {content.intro2 && (
            <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base 2xl:text-lg">
              {content.intro2}
            </p>
          )}
        </motion.div>

        {/* VISION + MISSION */}
        <div className="mt-14 grid grid-cols-1 gap-10 sm:mt-16 md:mt-20 md:grid-cols-2 md:gap-16 lg:gap-24 2xl:mt-24 2xl:gap-28">

          {/* VISION */}
          <motion.div variants={fadeUp} className="max-w-md 2xl:max-w-xl">
            <h3 className="mb-4 font-sans text-2xl font-jost-extrabold uppercase tracking-[0.15em] sm:mb-6 sm:text-3xl md:text-4xl 2xl:text-5xl">
              <SplitWords text="Vision" inheritParent />
            </h3>
            <p className="text-sm leading-relaxed text-white/85 md:text-base lg:text-lg 2xl:text-xl">
              {content.vision}
            </p>
          </motion.div>

          {/* MISSION */}
          <motion.div variants={fadeUp} className="max-w-md md:ml-auto 2xl:max-w-xl">
            <h3 className="mb-4 font-sans text-2xl font-jost-extrabold uppercase tracking-[0.15em] sm:mb-6 sm:text-3xl md:text-4xl 2xl:text-5xl">
              <SplitWords text="Mission" inheritParent />
            </h3>
            <p className="text-sm leading-relaxed text-white/85 md:text-base lg:text-lg 2xl:text-xl">
              {content.mission}
            </p>
          </motion.div>

        </div>
      </motion.div>
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