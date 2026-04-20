'use client';

import { SafeImage, SplitWords } from '@/components/shared';
import { visionMissionContent as defaults } from '../data/home-content';
import type { VisionMissionContent } from '../types';
import { motion } from 'framer-motion';
import { container, fadeUp, defaultViewport } from '@/lib/animation-variants';

interface VisionMissionProps {
  data?: VisionMissionContent;
}

export function VisionMission({ data }: VisionMissionProps) {
  const content = data ?? defaults;

  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28">
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
        className="relative z-10 mx-auto max-w-6xl px-4 text-white sm:px-6 md:px-8"
      >

        {/* HEADING */}
        <motion.div variants={fadeUp}>
          <h2 className="font-sans text-center mb-10 text-2xl font-jost-bold uppercase tracking-[0.15em] sm:mb-12 sm:text-3xl md:mb-14 md:text-4xl lg:text-5xl">
            <SplitWords text={content.heading} inheritParent />
          </h2>
        </motion.div>

        {/* INTRO TEXT */}
        <motion.div variants={fadeUp} className="w-full md:w-3/4 lg:w-2/4">
          <p className="text-base italic text-white/80 md:text-lg lg:text-xl">
            {content.subtitle}
          </p>

          {content.intro && (
            <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base">
              {content.intro}
            </p>
          )}

          {content.intro2 && (
            <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base">
              {content.intro2}
            </p>
          )}
        </motion.div>

        {/* VISION + MISSION */}
        <div className="mt-14 grid grid-cols-1 gap-10 sm:mt-16 md:mt-20 md:grid-cols-2 md:gap-16 lg:gap-24">
          
          {/* VISION */}
          <motion.div variants={fadeUp} className="max-w-md">
            <h3 className="mb-4 font-sans text-2xl font-jost-extrabold uppercase tracking-[0.15em] sm:mb-6 sm:text-3xl md:text-4xl">
              <SplitWords text="Vision" inheritParent />
            </h3>
            <p className="text-sm leading-relaxed text-white/85 md:text-base lg:text-lg">
              {content.vision}
            </p>
          </motion.div>

          {/* MISSION */}
          <motion.div variants={fadeUp} className="max-w-md md:ml-auto">
            <h3 className="mb-4 font-sans text-2xl font-jost-extrabold uppercase tracking-[0.15em] sm:mb-6 sm:text-3xl md:text-4xl">
              <SplitWords text="Mission" inheritParent />
            </h3>
            <p className="text-sm leading-relaxed text-white/85 md:text-base lg:text-lg">
              {content.mission}
            </p>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}