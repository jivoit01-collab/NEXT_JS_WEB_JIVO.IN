'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
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
    <LazyMotion features={domAnimation}>
      <m.section
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={SCROLL_REVEAL_VIEWPORT}
        className="relative min-h-[60svh] overflow-hidden bg-[#1b1a17] sm:min-h-[64svh] md:min-h-[68svh] lg:h-[clamp(600px,46.3vw,760px)] lg:min-h-[600px]"
      >
        <SafeImage
          src={imageWithFallback(image)}
          alt=""
          fill
          loading="lazy"
          quality={80}
          className="object-cover object-[50%_center] sm:object-[50%_center] md:object-[50%_center] lg:object-[center_20%]"
          sizes={FULL_BLEED_IMAGE_SIZES}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/18 via-black/4 to-black/16" />
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/8 to-black/24" />

        <div className="relative z-10 mx-auto flex min-h-[60svh] w-full max-w-7xl items-start justify-end px-5 pt-8 pb-36 text-right sm:min-h-[64svh] sm:px-6 sm:pt-10 sm:pb-40 md:min-h-[68svh] md:pt-12 md:pb-44 lg:h-full lg:min-h-0 lg:max-w-none lg:justify-start lg:px-0 lg:py-0 lg:text-center">
          <m.div
            variants={revealContainer}
            style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
            className="w-full max-w-[72vw] transform-gpu text-right text-white sm:max-w-[62vw] md:max-w-[54vw] lg:mx-auto lg:w-[43vw] lg:max-w-[620px] lg:text-center xl:max-w-[680px] 2xl:max-w-[800px]"
          >
            <m.h2
              variants={revealItem}
              className="font-jost-extrabold text-[clamp(1.55rem,7vw,2rem)] leading-none tracking-[0.02em] text-balance text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.36)] sm:text-[clamp(1.75rem,5.4vw,2.25rem)] md:text-[clamp(2rem,4vw,3rem)] lg:text-[clamp(2rem,3.05vw,4.25rem)]"
            >
              {title}
            </m.h2>
            <m.p
              variants={revealItem}
              className="font-jost-medium mt-2 text-[9px] tracking-[0.18em] text-white/90 uppercase sm:mt-3 sm:text-[10px] md:text-xs lg:tracking-[0.22em] 2xl:text-sm"
            >
              {subtitle}
            </m.p>
            <m.p
              variants={revealItem}
              className="mt-3 ml-auto max-w-[590px] text-[clamp(0.62rem,2.4vw,0.78rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] sm:mt-4 sm:text-[clamp(0.68rem,1.9vw,0.86rem)] md:text-[clamp(0.78rem,1.35vw,0.98rem)] lg:mx-auto lg:text-[clamp(0.82rem,0.92vw,1.02rem)] 2xl:max-w-[720px]"
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
      className="relative min-h-[60svh] animate-pulse overflow-hidden bg-[#1b1a17] sm:min-h-[64svh] md:min-h-[68svh] lg:h-[clamp(600px,46.3vw,760px)] lg:min-h-[600px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-b from-black/18 via-black/4 to-black/16" />
      <div className="relative z-10 mx-auto flex min-h-[60svh] w-full max-w-7xl items-start justify-end px-5 pt-8 pb-36 text-right sm:min-h-[64svh] sm:px-6 sm:pt-10 sm:pb-40 md:min-h-[68svh] md:pt-12 md:pb-44 lg:h-full lg:min-h-0 lg:max-w-none lg:justify-start lg:px-0 lg:py-0">
        <div className="w-full max-w-[72vw] sm:max-w-[62vw] md:max-w-[54vw] lg:mx-auto lg:w-[43vw] lg:max-w-[620px]">
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
