'use client';

import { motion } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { container, fadeUp, defaultViewport } from '@/lib/animation-variants';
import type { CoreValuesPrinciplesContent } from '../types';
import { defaultPrinciplesContent } from '../data/defaults';

interface Props {
  data?: CoreValuesPrinciplesContent;
}

/** Sewa / Intelligence / Integrity — grid over sunset-sky bg. */
export function PrinciplesSection({ data }: Props) {
  const { backgroundImage, blocks } = data ?? defaultPrinciplesContent;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28">
      {backgroundImage ? (
        <SafeImage
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-b from-[#f8a880] via-[#f1738a] to-[#8b4789]" />
      )}

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid gap-10 sm:gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
          {blocks.map((block, i) => (
            <motion.div key={`${block.label}-${i}`} variants={fadeUp}>
              <h3 className="mb-3 font-jost-bold text-sm uppercase tracking-[0.2em] text-white sm:mb-4 sm:text-base md:text-lg">
                {block.label}
              </h3>
              <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                {block.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
