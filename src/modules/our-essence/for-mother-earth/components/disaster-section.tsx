'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { container, defaultViewport, fadeUp, reducedMotion } from '@/lib/animation-variants';
import { defaultDisasterContent, fallbackImage } from '../data/defaults';
import type { ForMotherEarthDisasterContent } from '../types';

interface DisasterSectionProps {
  data?: ForMotherEarthDisasterContent;
}

const FULL_BLEED_IMAGE_SIZES = '(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1920px';

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function DisasterSection({ data }: DisasterSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : container;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUp;
  const { title, description, image } = data ?? defaultDisasterContent;

  return (
    <section
      className="relative min-h-[580px] overflow-hidden bg-[#201a11] sm:min-h-[620px] lg:h-[clamp(620px,50vw,780px)] lg:min-h-[640px]"
      style={{ contentVisibility: 'auto', contain: 'layout paint' }}
    >
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        quality={100}
        className="object-cover object-center"
        sizes={FULL_BLEED_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/18 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-[#c08735]/18 via-transparent to-black/22" />

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto flex min-h-[580px] w-full max-w-7xl items-center px-5 py-16 sm:min-h-[620px] sm:px-6 lg:h-full lg:min-h-0 lg:max-w-none lg:px-[6vw] lg:py-0 2xl:px-[8vw]"
      >
        <motion.div
          variants={revealItem}
          className="w-full max-w-[720px] text-left text-white 2xl:max-w-[900px]"
        >
          <h2 className="font-jost-extrabold text-[clamp(2rem,3.55vw,4.8rem)] leading-[1.05] text-balance drop-shadow-[0_3px_14px_rgba(0,0,0,0.38)]">
            {title}
          </h2>
          <p className="mt-5 max-w-[680px] text-[clamp(0.9rem,1.08vw,1.18rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.34)] 2xl:max-w-[820px]">
            {description}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function DisasterSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[580px] animate-pulse overflow-hidden bg-[#201a11] sm:min-h-[620px] lg:h-[clamp(620px,50vw,780px)] lg:min-h-[640px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/18 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[580px] w-full max-w-7xl items-center px-5 py-16 sm:min-h-[620px] sm:px-6 lg:h-full lg:min-h-0 lg:max-w-none lg:px-[6vw] lg:py-0 2xl:px-[8vw]">
        <div className="w-full max-w-[720px] 2xl:max-w-[900px]">
          <div className="h-12 w-full max-w-lg rounded bg-white/24 sm:h-14 2xl:h-18" />
          <div className="mt-6 max-w-2xl space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-11/12 rounded bg-white/14" />
            <div className="h-4 w-4/5 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
