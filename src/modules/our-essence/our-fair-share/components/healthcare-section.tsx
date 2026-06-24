'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { containerSlow, fadeUpSlow, imageReveal, reducedMotion } from '@/lib/animation-variants';
import { defaultHealthcareContent, fallbackImage } from '../data/defaults';
import type { OurFairShareHealthcareContent } from '../types';

interface HealthcareSectionProps {
  data?: OurFairShareHealthcareContent;
}

const FULL_BLEED_IMAGE_SIZES = '100vw';
const SCROLL_REVEAL_VIEWPORT = { once: true, amount: 0.35, margin: '0px 0px -14% 0px' } as const;

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function HealthcareSection({ data }: HealthcareSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : containerSlow;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;
  const revealImage = prefersReducedMotion ? reducedMotion : imageReveal;
  const hoverLift = prefersReducedMotion
    ? undefined
    : { y: -6, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } };
  const hoverHeading = prefersReducedMotion
    ? undefined
    : { y: -6, scale: 1.015, transition: { type: 'spring' as const, stiffness: 280, damping: 18 } };
  const { title, paragraph1, paragraph2, image } = data ?? defaultHealthcareContent;

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={SCROLL_REVEAL_VIEWPORT}
        className="relative min-h-[60svh] overflow-hidden bg-[#172735] sm:min-h-[64svh] md:min-h-[70svh] lg:h-[clamp(620px,45vw,760px)] lg:min-h-[620px]"
      >
        <m.div variants={revealImage} className="absolute inset-0 transform-gpu">
          <SafeImage
            src={imageWithFallback(image)}
            alt=""
            fill
            loading="lazy"
            quality={80}
            className="object-cover object-[76%_center] sm:object-[72%_center] md:object-[64%_center] lg:object-center"
            sizes={FULL_BLEED_IMAGE_SIZES}
          />
        </m.div>
        {/* Decorative scrims — darken the left column behind the text. */}
        <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/15 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/15" />

        <div className="relative z-10 mx-auto flex min-h-[60svh] w-full max-w-7xl items-center px-3 py-12 sm:min-h-[64svh] sm:px-4 md:min-h-[70svh] lg:h-full lg:min-h-0 lg:items-start lg:px-6 lg:pt-[clamp(3.25rem,5vw,4.7rem)] xl:px-8 2xl:max-w-screen-2xl 2xl:px-12">
          <m.div
            variants={revealContainer}
            style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
            className="w-full max-w-[560px] min-w-0 transform-gpu text-left text-white lg:w-[46vw] lg:max-w-[600px]"
          >
            <m.h2
              variants={revealItem}
              whileHover={hoverHeading}
              className="font-jost-bold max-w-[560px] inline-block cursor-default text-[clamp(1.6rem,2.5vw,2rem)] leading-[1.12] text-balance drop-shadow-[0_3px_14px_rgba(0,0,0,0.4)] transition-[filter] duration-500 hover:drop-shadow-[0_14px_30px_rgba(0,0,0,0.55)]"
            >
              {title}
            </m.h2>
            <m.p
              variants={revealItem}
              whileHover={hoverLift}
              className="mt-4 max-w-[500px] cursor-default text-[clamp(0.95rem,1vw,1.02rem)] leading-relaxed text-pretty text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.34)] transition-colors duration-300 hover:text-white sm:mt-5"
            >
              {paragraph1}
            </m.p>
            <m.p
              variants={revealItem}
              whileHover={hoverLift}
              className="mt-4 max-w-[500px] cursor-default text-[clamp(0.9rem,0.96vw,1rem)] leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.34)] transition-colors duration-300 hover:text-white"
            >
              {paragraph2}
            </m.p>
          </m.div>
        </div>
      </m.section>
    </LazyMotion>
  );
}

export function HealthcareSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[60svh] animate-pulse overflow-hidden bg-[#172735] sm:min-h-[64svh] md:min-h-[70svh] lg:h-[clamp(620px,45vw,760px)] lg:min-h-[620px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/15 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[60svh] w-full max-w-7xl items-center px-3 py-12 sm:min-h-[64svh] sm:px-4 md:min-h-[70svh] lg:h-full lg:min-h-0 lg:items-start lg:px-6 lg:pt-[clamp(3.25rem,5vw,4.7rem)] xl:px-8 2xl:max-w-screen-2xl 2xl:px-12">
        <div className="w-full max-w-[560px] lg:w-[46vw] lg:max-w-[600px]">
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
