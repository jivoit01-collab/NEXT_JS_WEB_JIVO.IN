'use client';

import { SafeImage } from '@/components/shared';
import type { TheStoryFounderContent } from '../types';
import { defaultFounderContent } from '../data/defaults';
import { motion } from 'framer-motion';

interface Props {
  data?: TheStoryFounderContent;
}

export function FounderSection({ data }: Props) {
  const { sectionHeading, title, paragraph, founderImage } = data ?? defaultFounderContent;

  // 🔥 animation
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="bg-[#0a7362] py-12 md:py-16">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }} // ✅ 20% trigger
        className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-10"
      >
        {/* Heading */}
        <motion.h2
          variants={item}
          className="font-jost-bold mb-10 text-center text-2xl tracking-[0.15em] text-white uppercase md:text-3xl lg:text-4xl"
        >
          {sectionHeading}
        </motion.h2>

        {/* Content */}
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          {/* LEFT TEXT */}
          <motion.div variants={item} className="max-w-lg">
            <h3 className="font-jost-bold mb-4 text-base tracking-wider text-white/90 uppercase md:text-lg">
              {title}
            </h3>

            <p className="text-sm leading-relaxed text-white/80 md:text-base">{paragraph}</p>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div variants={item} className="flex justify-center md:justify-end">
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="relative aspect-[3/4] w-40 overflow-hidden rounded-lg bg-[#373639] sm:w-48 md:w-56 lg:w-60"
            >
              {founderImage ? (
                <SafeImage
                  src={founderImage}
                  alt="Baba Iqbal Singh Ji — Founding Father"
                  fill
                  className="object-contain transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 240px"
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
