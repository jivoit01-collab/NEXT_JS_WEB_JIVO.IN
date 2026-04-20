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
    <section className="bg-[#0a7362] py-16 sm:py-20 md:py-24 lg:py-28">
      <motion.div
        variants={containerSlow}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <motion.h2
          variants={fadeUpSlow}
          className="font-jost-bold mb-10 text-center text-2xl tracking-[0.15em] text-white uppercase sm:mb-12 sm:text-3xl md:mb-14 md:text-4xl lg:mb-16 lg:text-5xl"
        >
          <SplitWords text={sectionHeading} inheritParent />
        </motion.h2>

        <div className="grid items-center gap-10 sm:gap-12 md:grid-cols-[1fr_auto] md:gap-14 lg:gap-20">
          <motion.div variants={fadeUpSlow} className="max-w-xl min-w-0">
            <h3 className="font-jost-bold mb-3 text-sm tracking-wider text-white/90 uppercase sm:mb-4 sm:text-base md:text-lg lg:text-xl">
              {title}
            </h3>

            <p className="text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
              {paragraph}
            </p>
          </motion.div>

          <motion.div variants={fadeUpSlow} className="flex justify-center md:justify-end">
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="relative aspect-[3/3.8] w-60 overflow-hidden rounded-xl bg-[#373639] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] sm:w-64 md:w-72 lg:w-80"
            >
              {founderImage ? (
                <SafeImage
                  src={founderImage}
                  alt="Baba Iqbal Singh Ji — Founding Father"
                  fill
                  /* Maintains right alignment for the portrait of Baba Iqbal Singh Ji */
                  className="object-contain object-right transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 240px, (max-width: 768px) 256px, (max-width: 1024px) 288px, 320px"
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
