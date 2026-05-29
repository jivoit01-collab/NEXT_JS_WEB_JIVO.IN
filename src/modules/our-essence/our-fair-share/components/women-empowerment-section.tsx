'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { containerSlow, fadeUpSlow, reducedMotion } from '@/lib/animation-variants';
import { defaultWomenContent, fallbackImage } from '../data/defaults';
import type { OurFairShareWomenContent } from '../types';

interface WomenEmpowermentSectionProps {
  data?: OurFairShareWomenContent;
}

const FULL_BLEED_IMAGE_SIZES = '100vw';
const SCROLL_REVEAL_VIEWPORT = { once: true, amount: 0.35, margin: '0px 0px -14% 0px' } as const;

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function WomenEmpowermentSection({ data }: WomenEmpowermentSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : containerSlow;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;
  const { title, subtitle, description, image } = data ?? defaultWomenContent;

  return (
    <motion.section
      variants={revealContainer}
      initial="hidden"
      whileInView="show"
      viewport={SCROLL_REVEAL_VIEWPORT}
      className="relative min-h-[600px] overflow-hidden bg-[#1b1a17] sm:min-h-[640px] lg:h-[clamp(600px,46.3vw,760px)] lg:min-h-[600px]"
      style={{
        contentVisibility: 'auto',
        contain: 'layout paint',
        containIntrinsicSize: '640px',
      }}
    >
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        quality={100}
        className="object-cover object-[center_20%]"
        sizes={FULL_BLEED_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/18 via-black/4 to-black/16" />
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/8 to-black/24" />

      <div className="relative z-10 mx-auto flex min-h-[600px] w-full max-w-7xl items-start px-5 py-14 text-center sm:min-h-[640px] sm:px-6 sm:py-16 lg:h-full lg:min-h-0 lg:max-w-none lg:px-0 lg:py-0">
        <motion.div
          variants={revealContainer}
          style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
          className="mx-auto w-full max-w-3xl transform-gpu text-white transition-transform duration-700 ease-out lg:absolute lg:top-[8.2%] lg:left-[52.4%] lg:w-[43vw] lg:max-w-[620px] lg:hover:-translate-y-1 xl:max-w-[680px] 2xl:max-w-[800px]"
        >
          <motion.h2
            variants={revealItem}
            className="font-jost-extrabold text-[clamp(2rem,3.05vw,4.25rem)] leading-none tracking-[0.02em] text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.36)] lg:whitespace-nowrap"
          >
            {title}
          </motion.h2>
          <motion.p
            variants={revealItem}
            className="font-jost-medium mt-3 text-[10px] tracking-[0.22em] text-white/90 uppercase sm:text-xs 2xl:text-sm"
          >
            {subtitle}
          </motion.p>
          <motion.p
            variants={revealItem}
            className="mx-auto mt-4 max-w-[590px] text-[clamp(0.82rem,0.92vw,1.02rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] 2xl:max-w-[720px]"
          >
            {description}
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );
}

export function WomenEmpowermentSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[600px] animate-pulse overflow-hidden bg-[#1b1a17] sm:min-h-[640px] lg:h-[clamp(600px,46.3vw,760px)] lg:min-h-[600px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-b from-black/18 via-black/4 to-black/16" />
      <div className="relative z-10 mx-auto flex min-h-[600px] w-full max-w-7xl items-start px-5 py-14 text-center sm:min-h-[640px] sm:px-6 sm:py-16 lg:h-full lg:min-h-0 lg:max-w-none lg:px-0 lg:py-0">
        <div className="mx-auto w-full max-w-3xl lg:absolute lg:top-[8.2%] lg:left-[52.4%] lg:w-[43vw] lg:max-w-[620px]">
          <div className="mx-auto h-10 w-full max-w-2xl rounded bg-white/24 sm:h-14 2xl:h-18" />
          <div className="mx-auto mt-4 h-4 w-2/3 rounded bg-white/18" />
          <div className="mx-auto mt-5 max-w-[590px] space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-5/6 rounded bg-white/14" />
            <div className="mx-auto h-4 w-2/3 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
