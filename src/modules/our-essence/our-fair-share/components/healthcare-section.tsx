'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { container, fadeUp, reducedMotion } from '@/lib/animation-variants';
import { defaultHealthcareContent, fallbackImage } from '../data/defaults';
import type { OurFairShareHealthcareContent } from '../types';

interface HealthcareSectionProps {
  data?: OurFairShareHealthcareContent;
}

const FULL_BLEED_IMAGE_SIZES = '(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1920px';
const SCROLL_REVEAL_VIEWPORT = { once: true, amount: 0.38, margin: '0px 0px -12% 0px' } as const;

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function HealthcareSection({ data }: HealthcareSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : container;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUp;
  const { title, paragraph1, paragraph2, image } = data ?? defaultHealthcareContent;

  return (
    <section
      className="relative min-h-[620px] overflow-hidden bg-[#172735] sm:min-h-[660px] lg:h-[clamp(620px,44.6vw,760px)] lg:min-h-[620px]"
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
      <div className="absolute inset-0 bg-linear-to-r from-black/38 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-black/8 via-transparent to-black/12" />

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={SCROLL_REVEAL_VIEWPORT}
        className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-7xl items-start px-5 py-14 sm:min-h-[660px] sm:px-6 lg:h-full lg:min-h-0 lg:max-w-none lg:px-0 lg:py-0"
      >
        <motion.div
          variants={revealItem}
          className="w-full max-w-[620px] text-left text-white transition-transform duration-500 lg:absolute lg:top-[7.8%] lg:left-[2.05%] lg:w-[43vw] lg:max-w-[540px] lg:hover:-translate-y-1 xl:max-w-[590px] 2xl:max-w-[680px]"
        >
          <h2 className="font-jost-bold text-[clamp(1.9rem,3.05vw,4.05rem)] leading-[1.08] text-balance drop-shadow-[0_3px_14px_rgba(0,0,0,0.38)]">
            {title}
          </h2>
          <p className="mt-5 max-w-[580px] text-[clamp(0.82rem,0.96vw,1.05rem)] leading-relaxed text-pretty text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.34)]">
            {paragraph1}
          </p>
          <p className="mt-5 max-w-[580px] text-[clamp(0.8rem,0.9vw,1rem)] leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.34)]">
            {paragraph2}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function HealthcareSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[620px] animate-pulse overflow-hidden bg-[#172735] sm:min-h-[660px] lg:h-[clamp(620px,44.6vw,760px)] lg:min-h-[620px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/38 via-black/10 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-7xl items-start px-5 py-14 sm:min-h-[660px] sm:px-6 lg:h-full lg:min-h-0 lg:max-w-none lg:px-0 lg:py-0">
        <div className="w-full max-w-[620px] lg:absolute lg:top-[7.8%] lg:left-[2.05%] lg:w-[43vw] lg:max-w-[540px]">
          <div className="h-28 w-full rounded bg-white/24 sm:h-36 2xl:h-44" />
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full rounded bg-white/16" />
            <div className="h-4 w-5/6 rounded bg-white/16" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-11/12 rounded bg-white/14" />
            <div className="h-4 w-4/5 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
