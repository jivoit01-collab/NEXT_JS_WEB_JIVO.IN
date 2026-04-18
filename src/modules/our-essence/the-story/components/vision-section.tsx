'use client';

import { motion } from 'framer-motion';
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
    <section className="bg-[#7eaf7e] py-14 sm:py-16 lg:py-24">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12"
      >
        {/* HEADING */}
        <motion.h2
          variants={fadeUpSlow}
          className="mb-12 text-center font-jost-bold text-2xl uppercase tracking-[0.12em] text-white sm:text-3xl md:text-4xl lg:text-5xl"
        >
          {sectionHeading}
        </motion.h2>

        {/* SUB HEADING */}
        <motion.h3
          variants={fadeUpSlow}
          className="mb-10 font-jost-medium text-base uppercase tracking-wider text-white/90 sm:text-lg md:text-xl lg:mb-14"
        >
          {title}
        </motion.h3>

        {/* CONTENT */}
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.p
            variants={fadeUpSlow}
            className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg"
          >
            {leftColumn}
          </motion.p>

          <motion.p
            variants={fadeUpSlow}
            className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg"
          >
            {rightColumn}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}