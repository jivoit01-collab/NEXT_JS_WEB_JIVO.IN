'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { containerSlow, fadeUpSlow, imageReveal, reducedMotion } from '@/lib/animation-variants';
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
  const revealImage = prefersReducedMotion ? reducedMotion : imageReveal;
  const { title, subtitle, description, image } = data ?? defaultWomenContent;

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={SCROLL_REVEAL_VIEWPORT}
        className="relative min-h-[60svh] overflow-hidden bg-[#1b1a17] sm:min-h-[64svh] md:min-h-[70svh] lg:h-[clamp(620px,46vw,780px)] lg:min-h-[620px]"
      >
        <m.div variants={revealImage} className="absolute inset-0 transform-gpu">
          <SafeImage
            src={imageWithFallback(image)}
            alt=""
            fill
            loading="lazy"
            quality={80}
            className="object-cover object-[50%_center] lg:object-[center_20%]"
            sizes={FULL_BLEED_IMAGE_SIZES}
          />
        </m.div>
        {/* Decorative scrims — darken the right column behind the text. */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/10 to-black/50" />
        <div className="absolute inset-0 bg-linear-to-b from-black/15 via-transparent to-black/20" />

        <div className="relative z-10 flex min-h-[60svh] w-full items-start justify-end px-4 pt-5 pb-10 text-right sm:min-h-[64svh] sm:px-6 sm:pt-7 md:min-h-[70svh] md:pt-10 lg:h-full lg:min-h-0 lg:items-start lg:justify-end lg:px-0 lg:pt-[clamp(3.25rem,5vw,4.6rem)] lg:pr-[5vw] lg:text-center">
          <m.div
            variants={revealContainer}
            style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
            className="w-full max-w-[68vw] min-w-0 transform-gpu text-center text-white sm:max-w-[60vw] md:max-w-[54vw] lg:w-[46vw] lg:max-w-[630px]"
          >
            <m.h2
              variants={revealItem}
              className="font-jost-extrabold text-[clamp(1.15rem,5.8vw,1.75rem)] leading-[0.98] tracking-[0.02em] text-balance text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.46)] lg:text-[clamp(1.9rem,4vw,2.8rem)] lg:leading-[1.04]"
            >
              {title}
            </m.h2>
            <m.p
              variants={revealItem}
              className="font-jost-medium mt-1.5 text-[clamp(0.43rem,1.7vw,0.58rem)] tracking-[0.14em] text-white/90 uppercase sm:mt-2 lg:text-[clamp(0.66rem,0.82vw,0.78rem)] lg:tracking-[0.2em]"
            >
              {subtitle}
            </m.p>
            <m.p
              variants={revealItem}
              className="mt-2 ml-auto max-w-[560px] text-center text-[clamp(0.52rem,2vw,0.68rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] sm:mt-3 lg:mx-auto lg:text-[clamp(0.92rem,0.98vw,1rem)]"
            >
              {description}
            </m.p>
          </m.div>
        </div>
      </m.section>
    </LazyMotion>
  );
}

export function WomenEmpowermentSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[60svh] animate-pulse overflow-hidden bg-[#1b1a17] sm:min-h-[64svh] md:min-h-[70svh] lg:h-[clamp(620px,46vw,780px)] lg:min-h-[620px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/10 to-black/50" />
      <div className="relative z-10 flex min-h-[60svh] w-full items-start justify-end px-4 pt-5 pb-10 sm:min-h-[64svh] sm:px-6 sm:pt-7 md:min-h-[70svh] md:pt-10 lg:h-full lg:min-h-0 lg:items-start lg:justify-end lg:px-0 lg:pt-[clamp(3.25rem,5vw,4.6rem)] lg:pr-[5vw]">
        <div className="w-full max-w-[68vw] sm:max-w-[60vw] md:max-w-[54vw] lg:w-[46vw] lg:max-w-[630px]">
          <div className="mx-auto h-12 w-full max-w-xl rounded bg-white/24 sm:h-16 2xl:h-20" />
          <div className="mx-auto mt-4 h-4 w-2/3 rounded bg-white/18" />
          <div className="mx-auto mt-5 max-w-[560px] space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-5/6 rounded bg-white/14" />
            <div className="mx-auto h-4 w-2/3 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
