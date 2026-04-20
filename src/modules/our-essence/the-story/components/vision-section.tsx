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
    <section className="bg-[#7eaf7e] py-16 sm:py-20 md:py-24 lg:py-28">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <motion.h2
          variants={fadeUpSlow}
          className="mb-10 text-center font-jost-bold text-2xl uppercase tracking-[0.12em] text-white sm:mb-12 sm:text-3xl md:mb-14 md:text-4xl lg:mb-16 lg:text-5xl"
        >
          <SplitWords text={sectionHeading} inheritParent />
        </motion.h2>

        <motion.h3
          variants={fadeUpSlow}
          className="mb-8 font-jost-medium text-base uppercase tracking-wider text-white/90 sm:mb-10 sm:text-lg md:text-xl lg:mb-14 lg:text-2xl"
        >
          {title}
        </motion.h3>

        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.p
            variants={fadeUpSlow}
            className="min-w-0 text-sm leading-relaxed text-white/85 sm:text-base md:text-lg lg:text-xl"
          >
            {leftColumn}
          </motion.p>

          <motion.p
            variants={fadeUpSlow}
            className="min-w-0 text-sm leading-relaxed text-white/85 sm:text-base md:text-lg lg:text-xl"
          >
            {rightColumn}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
