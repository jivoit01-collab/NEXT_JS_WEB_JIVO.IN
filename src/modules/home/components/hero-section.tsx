'use client';

import { motion } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { heroContent as defaults } from '../data/home-content';
import type { HeroContent } from '../types';

interface HeroSectionProps {
  data?: HeroContent;
}

export function HeroSection({ data }: HeroSectionProps) {
  const content = data ?? defaults;
  const logoSrc = content.logo || defaults.logo;
  const bgSrc = content.backgroundImage || defaults.backgroundImage;

  return (
    <section className="relative h-screen min-h-150 w-full overflow-hidden">
      {/* Background image — fills entire hero */}
      <SafeImage
        src={bgSrc}
        alt="Jivo — Let Nature Reclaim You"
        fill
        fetchPriority="high"
        className="object-cover object-[center_30%]"
      />

      {/* Subtle uniform overlay — keeps the image colorful but adds enough
          contrast for white text. No olive tint, no gradient washing. */}
      <div className="pointer-events-none absolute inset-0 bg-black/30" />

      {/* Centered content stack */}
      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
        {/* BIG centered logo — dominant element of the hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <SafeImage
            src={logoSrc}
            alt="Jivo Logo"
            width={520}
            height={220}
            fetchPriority="high"
            className="mb-43 h-auto w-56 sm:w-72 md:w-80 lg:w-[22rem]"
          />
        </motion.div>

        {/* SMALL headline — sits underneath the big logo */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-serif text-xl font-bold tracking-[0.15em] sm:text-2xl md:text-3xl"
        >
          {content.headline}
        </motion.h1>

        {/* Tiny supporting tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-3 max-w-md text-xs font-light leading-relaxed text-white/80 sm:text-sm"
        >
          {content.subtitle}
        </motion.p>
      </div>
    </section>
  );
}
