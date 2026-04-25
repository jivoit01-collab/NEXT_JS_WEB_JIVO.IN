'use client';

import { SafeImage } from '@/components/shared';
import type { TheStoryHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';
import { motion } from 'framer-motion';
import { containerSlow, fadeUpSlow } from '@/lib/animation-variants';

interface Props {
  data?: TheStoryHeroContent;
}

export function TheStoryHero({ data }: Props) {
  const { heading, paragraph, backgroundImage } = data ?? defaultHeroContent;

  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden sm:min-h-[70vh] lg:min-h-screen">

      {/* Background */}
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
        <div className="absolute inset-0 bg-linear-to-br from-[#c5a832] to-[#8a7a1e]" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <motion.div
        variants={containerSlow}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-28 md:pt-32 lg:px-8 lg:pb-24 lg:pt-40 2xl:max-w-screen-2xl 2xl:px-20 2xl:pb-36 2xl:pt-52"
      >
        <motion.h1
          variants={fadeUpSlow}
          className="font-jost-bold text-3xl uppercase tracking-[0.08em] text-white sm:text-4xl sm:tracking-[0.12em] md:text-4xl md:tracking-[0.15em] lg:text-5xl xl:text-6xl 2xl:text-7xl"
        >
          {heading}
        </motion.h1>

        <motion.p
          variants={fadeUpSlow}
          className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:mt-4 sm:max-w-2xl sm:text-base md:text-lg lg:mt-6 lg:text-xl 2xl:mt-8 2xl:max-w-3xl 2xl:text-2xl"
        >
          {paragraph}
        </motion.p>
      </motion.div>
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

export function TheStoryHeroSkeleton() {
  return (
    <section className="relative flex min-h-[60vh] animate-pulse items-center overflow-hidden bg-muted sm:min-h-[70vh] lg:min-h-screen">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-28 md:pt-32 lg:px-8 lg:pb-24 lg:pt-40 2xl:max-w-screen-2xl 2xl:px-20 2xl:pb-36 2xl:pt-52">
        {/* Heading */}
        <div className="h-9 w-56 rounded-md bg-muted-foreground/20 sm:h-11 sm:w-72 lg:h-14 lg:w-96 2xl:h-16 2xl:w-120" />
        {/* Paragraph */}
        <div className="mt-3 max-w-xl space-y-2 sm:mt-4 sm:max-w-2xl lg:mt-6 2xl:mt-8 2xl:max-w-3xl">
          <div className="h-4 w-full rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
          <div className="h-4 w-5/6 rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
          <div className="h-4 w-3/4 rounded bg-muted-foreground/15 sm:h-5 2xl:h-6" />
        </div>
      </div>
    </section>
  );
}
