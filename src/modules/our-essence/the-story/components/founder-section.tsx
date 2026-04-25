'use client';

import { motion } from 'framer-motion';
import { SafeImage, SplitWords } from '@/components/shared';
import type { TheStoryFounderContent } from '../types';
import { defaultFounderContent } from '../data/defaults';
import { containerSlow, fadeUpSlow, defaultViewport } from '@/lib/animation-variants';

interface Props {
  data?: TheStoryFounderContent;
}

export function FounderSection({ data }: Props) {
  const { sectionHeading, title, paragraph, founderImage } = data ?? defaultFounderContent;

  return (
    <section className="bg-[#0a7362] py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      <motion.div
        variants={containerSlow}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20"
      >
        <motion.h2
          variants={fadeUpSlow}
          className="font-jost-bold mb-10 text-center text-2xl tracking-[0.15em] text-white uppercase sm:mb-12 sm:text-3xl md:mb-14 md:text-4xl lg:mb-16 lg:text-5xl 2xl:mb-20 2xl:text-6xl"
        >
          <SplitWords text={sectionHeading} inheritParent />
        </motion.h2>

        <div className="grid items-center gap-10 sm:gap-12 md:grid-cols-[1fr_auto] md:gap-14 lg:gap-20 2xl:gap-28">
          <motion.div variants={fadeUpSlow} className="max-w-xl min-w-0 2xl:max-w-3xl">
            <h3 className="font-jost-bold mb-3 text-sm tracking-wider text-white/90 uppercase sm:mb-4 sm:text-base md:text-lg lg:text-xl 2xl:mb-5 2xl:text-2xl">
              {title}
            </h3>

            <p className="text-sm leading-relaxed text-white/80 sm:text-base md:text-lg 2xl:text-xl">
              {paragraph}
            </p>
          </motion.div>

          <motion.div variants={fadeUpSlow} className="flex justify-center md:justify-end">
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="relative aspect-[3/3.8] w-60 overflow-hidden rounded-xl bg-[#373639] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] sm:w-64 md:w-72 lg:w-80 2xl:w-96"
            >
              {founderImage ? (
                <SafeImage
                  src={founderImage}
                  alt="Baba Iqbal Singh Ji — Founding Father"
                  fill
                  /* Maintains right alignment for the portrait of Baba Iqbal Singh Ji */
                  className="object-contain object-right transition-transform duration-500 "
                  sizes="(max-width: 640px) 240px, (max-width: 768px) 256px, (max-width: 1024px) 288px, (max-width: 1536px) 320px, 384px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-white/50">
                  Founder Portrait
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

export function FounderSectionSkeleton() {
  return (
    <section className="bg-[#0a7362] py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20 animate-pulse">
        {/* Heading */}
        <div className="mb-10 flex justify-center sm:mb-12 md:mb-14 lg:mb-16 2xl:mb-20">
          <div className="h-7 w-64 rounded-md bg-white/20 sm:h-8 sm:w-80 md:h-10 md:w-96 lg:h-12 lg:w-112 2xl:h-14 2xl:w-128" />
        </div>

        {/* Grid */}
        <div className="grid items-center gap-10 sm:gap-12 md:grid-cols-[1fr_auto] md:gap-14 lg:gap-20 2xl:gap-28">
          {/* Text side */}
          <div className="max-w-xl min-w-0 space-y-4 2xl:max-w-3xl">
            <div className="h-4 w-40 rounded bg-white/20 sm:h-5 sm:w-52 2xl:h-6 2xl:w-64" />
            <div className="space-y-2.5">
              <div className="h-3.5 w-full rounded bg-white/15 sm:h-4 2xl:h-5" />
              <div className="h-3.5 w-full rounded bg-white/15 sm:h-4 2xl:h-5" />
              <div className="h-3.5 w-5/6 rounded bg-white/15 sm:h-4 2xl:h-5" />
              <div className="h-3.5 w-4/5 rounded bg-white/15 sm:h-4 2xl:h-5" />
              <div className="h-3.5 w-3/4 rounded bg-white/15 sm:h-4 2xl:h-5" />
            </div>
          </div>

          {/* Portrait side */}
          <div className="flex justify-center md:justify-end">
            <div className="aspect-[3/3.8] w-60 rounded-xl bg-white/15 sm:w-64 md:w-72 lg:w-80 2xl:w-96" />
          </div>
        </div>
      </div>
    </section>
  );
}
