'use client';

import { motion } from 'framer-motion';
import { SplitWords } from '@/components/shared';
import type { TheStoryVisionContent } from '../types';
import { defaultVisionContent } from '../data/defaults';
import { container, fadeUpSlow, defaultViewport } from '@/lib/animation-variants';

interface Props {
  data?: TheStoryVisionContent;
}

export function VisionSection({ data }: Props) {
  const { sectionHeading, title, leftColumn, rightColumn } =
    data ?? defaultVisionContent;

  return (
    <section className="bg-[#7eaf7e] py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20"
      >
        <motion.h2
          variants={fadeUpSlow}
          className="mb-10 text-center font-jost-bold text-2xl uppercase tracking-[0.12em] text-white sm:mb-12 sm:text-3xl md:mb-14 md:text-4xl lg:mb-16 lg:text-5xl 2xl:mb-20 2xl:text-6xl"
        >
          <SplitWords text={sectionHeading} inheritParent />
        </motion.h2>

        <motion.h3
          variants={fadeUpSlow}
          className="mb-8 font-jost-medium text-base uppercase tracking-wider text-white/90 sm:mb-10 sm:text-lg md:text-xl lg:mb-14 lg:text-2xl 2xl:mb-16 2xl:text-3xl"
        >
          {title}
        </motion.h3>

        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16 2xl:gap-20">
          <motion.p
            variants={fadeUpSlow}
            className="min-w-0 text-sm leading-relaxed text-white/85 sm:text-base md:text-lg lg:text-xl 2xl:text-2xl"
          >
            {leftColumn}
          </motion.p>

          <motion.p
            variants={fadeUpSlow}
            className="min-w-0 text-sm leading-relaxed text-white/85 sm:text-base md:text-lg lg:text-xl 2xl:text-2xl"
          >
            {rightColumn}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

export function VisionSectionSkeleton() {
  return (
    <section className="bg-[#7eaf7e] py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20 animate-pulse">
        {/* Heading */}
        <div className="mb-10 flex justify-center sm:mb-12 md:mb-14 lg:mb-16 2xl:mb-20">
          <div className="h-7 w-56 rounded-md bg-white/25 sm:h-8 sm:w-72 md:h-10 md:w-88 lg:h-12 lg:w-104 2xl:h-14 2xl:w-120" />
        </div>

        {/* Subtitle */}
        <div className="mb-8 h-4 w-72 rounded bg-white/20 sm:mb-10 sm:h-5 sm:w-96 lg:mb-14 lg:h-6 lg:w-120 2xl:mb-16 2xl:h-7 2xl:w-xl" />

        {/* Two-col text */}
        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16 2xl:gap-20">
          <div className="space-y-2.5">
            <div className="h-3.5 w-full rounded bg-white/20 sm:h-4 2xl:h-5" />
            <div className="h-3.5 w-full rounded bg-white/20 sm:h-4 2xl:h-5" />
            <div className="h-3.5 w-5/6 rounded bg-white/20 sm:h-4 2xl:h-5" />
            <div className="h-3.5 w-4/5 rounded bg-white/20 sm:h-4 2xl:h-5" />
            <div className="h-3.5 w-3/4 rounded bg-white/20 sm:h-4 2xl:h-5" />
          </div>
          <div className="space-y-2.5">
            <div className="h-3.5 w-full rounded bg-white/20 sm:h-4 2xl:h-5" />
            <div className="h-3.5 w-full rounded bg-white/20 sm:h-4 2xl:h-5" />
            <div className="h-3.5 w-5/6 rounded bg-white/20 sm:h-4 2xl:h-5" />
            <div className="h-3.5 w-4/5 rounded bg-white/20 sm:h-4 2xl:h-5" />
            <div className="h-3.5 w-3/4 rounded bg-white/20 sm:h-4 2xl:h-5" />
          </div>
        </div>
      </div>
    </section>
  );
}
