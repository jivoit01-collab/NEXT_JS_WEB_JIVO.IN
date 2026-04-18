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
        <div className="absolute inset-0 bg-gradient-to-br from-[#c5a832] to-[#8a7a1e]" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <motion.div
        variants={containerSlow}
        initial="hidden"
        animate="show" // ✅ trigger on page load
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 pt-18 sm:px-6 sm:pb-16 sm:pt-32 lg:px-11 lg:pb-24"
      >
        {/* HEADING */}
        <motion.h1
          variants={fadeUpSlow}
          className="font-jost-bold text-3xl uppercase text-white sm:text-4xl sm:tracking-[0.2em] md:text-5xl lg:text-5xl"
        >
          {heading}
        </motion.h1>

        {/* PARAGRAPH */}
        <motion.p
          variants={fadeUpSlow}
          className="mt-3 w-2/4 max-w-2xl text-sm leading-relaxed text-white/90 sm:mt-4 sm:text-base md:text-lg lg:mt-6 lg:text-xl"
        >
          {paragraph}
        </motion.p>
      </motion.div>
    </section>
  );
}