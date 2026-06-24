'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { containerSlow, fadeUpSlow, imageReveal, reducedMotion } from '@/lib/animation-variants';
import {
  baruSahibAssociationHumanityFallbackImage,
  humanitySectionData,
} from '../content-defaults';
import type { BaruSahibAssociationHumanityContent } from '../types';

interface HumanitySectionProps {
  data?: BaruSahibAssociationHumanityContent;
}

const HUMANITY_IMAGE_SIZES = '100vw';
const SCROLL_REVEAL_VIEWPORT = { once: true, amount: 0.3, margin: '0px 0px -12% 0px' } as const;

function imageWithFallback(image: string) {
  return image || baruSahibAssociationHumanityFallbackImage;
}

export function HumanitySection({ data }: HumanitySectionProps) {
  const { title, description, image } = data ?? humanitySectionData;
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : containerSlow;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;
  const revealImage = prefersReducedMotion ? reducedMotion : imageReveal;
  const hoverLift = prefersReducedMotion
    ? undefined
    : { y: -8, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } };

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={SCROLL_REVEAL_VIEWPORT}
        className="relative min-h-[700px] overflow-hidden bg-[#06110b] sm:min-h-[730px] md:min-h-[75svh] lg:min-h-[90svh] xl:min-h-dvh"
      >
        <m.div variants={revealImage} className="absolute inset-0 transform-gpu">
          <SafeImage
            src={imageWithFallback(image)}
            alt=""
            fill
            loading="lazy"
            quality={78}
            className="object-cover object-[72%_96%] sm:object-[68%_92%] md:object-center"
            sizes={HUMANITY_IMAGE_SIZES}
          />
        </m.div>
        <div className="absolute inset-0 bg-linear-to-r from-black/58 via-black/26 to-black/6" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/28 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[700px] max-w-7xl px-3 pt-8 pb-80 sm:min-h-[730px] sm:px-4 sm:pt-10 sm:pb-80 md:min-h-[75svh] md:py-12 lg:min-h-[90svh] lg:items-start lg:px-6 lg:pt-16 lg:pb-20 xl:min-h-dvh xl:px-8 xl:pt-20 2xl:max-w-screen-2xl 2xl:px-12 2xl:pt-24 2xl:pb-28">
          <m.div
            variants={revealContainer}
            style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
            className="w-full min-w-0 transform-gpu"
          >
            <m.h2
              variants={revealItem}
              whileHover={hoverLift}
              className="inline-block cursor-default font-jost-extrabold text-3xl leading-tight text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.55)] transition-[text-shadow] duration-500 hover:[text-shadow:0_10px_36px_rgba(216,193,135,0.4)] sm:text-4xl lg:whitespace-nowrap lg:text-5xl 2xl:text-6xl"
            >
              {title}
            </m.h2>
            <m.p
              variants={revealItem}
              whileHover={hoverLift}
              className="mt-4 max-w-[520px] cursor-default text-xs leading-relaxed text-pretty text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] transition-colors duration-300 hover:text-white sm:mt-5 sm:text-base md:text-[17px] lg:mt-6 2xl:mt-8 2xl:max-w-[640px] 2xl:text-xl"
            >
              {description}
            </m.p>
          </m.div>
        </div>
      </m.section>
    </LazyMotion>
  );
}

export function HumanitySectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[700px] overflow-hidden bg-[#06110b] sm:min-h-[730px] md:min-h-[75svh] lg:min-h-[90svh] xl:min-h-dvh"
    >
      <div className="absolute inset-0 animate-pulse bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/58 via-black/26 to-black/6" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/28 to-transparent" />
      <div className="relative z-10 flex min-h-[700px] items-center px-4 pt-12 pb-80 sm:min-h-[730px] sm:px-6 sm:pt-14 sm:pb-80 md:min-h-[75svh] md:py-16 lg:min-h-[90svh] lg:items-start lg:px-8 lg:pt-28 lg:pb-20 xl:min-h-dvh xl:pt-32 2xl:px-20 2xl:pt-40 2xl:pb-28">
        <div className="w-full max-w-7xl 2xl:max-w-screen-2xl">
          <div className="max-w-[760px] animate-pulse 2xl:max-w-[940px]">
            <div className="h-9 w-full rounded bg-white/20 sm:h-11 md:h-14 lg:h-16 2xl:h-20" />
            <div className="mt-5 max-w-[520px] space-y-2 lg:mt-6 2xl:mt-8 2xl:max-w-[640px]">
              <div className="h-4 w-full rounded bg-white/15 sm:h-5 2xl:h-6" />
              <div className="h-4 w-full rounded bg-white/15 sm:h-5 2xl:h-6" />
              <div className="h-4 w-5/6 rounded bg-white/15 sm:h-5 2xl:h-6" />
              <div className="h-4 w-2/3 rounded bg-white/15 sm:h-5 2xl:h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
