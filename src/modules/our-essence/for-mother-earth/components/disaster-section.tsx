'use client';

import { LazyMotion, domAnimation, cubicBezier, m, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { defaultViewport, reducedMotion } from '@/lib/animation-variants';
import { defaultDisasterContent, fallbackImage } from '../data/defaults';
import type { ForMotherEarthDisasterContent } from '../types';

interface DisasterSectionProps {
  data?: ForMotherEarthDisasterContent;
}

const FULL_BLEED_IMAGE_SIZES = '100vw';
const TEXT_EASE = cubicBezier(0.22, 1, 0.36, 1);
const textContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};
const textFadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: TEXT_EASE,
    },
  },
};

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function DisasterSection({ data }: DisasterSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : textContainer;
  const revealItem = prefersReducedMotion ? reducedMotion : textFadeUp;
  const { title, description, image } = data ?? defaultDisasterContent;

  return (
    <LazyMotion features={domAnimation}>
      <m.section className="relative min-h-[58svh] overflow-hidden bg-[#201a11] sm:min-h-[62svh] md:min-h-[70svh] lg:h-[clamp(640px,50vw,840px)] lg:min-h-[640px] 2xl:h-[clamp(760px,48vw,940px)]">
        <SafeImage
          src={imageWithFallback(image)}
          alt=""
          fill
          loading="lazy"
          quality={80}
          className="object-cover object-[58%_center] sm:object-[56%_center] md:object-[54%_center] lg:object-center"
          sizes={FULL_BLEED_IMAGE_SIZES}
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/16 via-black/8 to-transparent" />

        <m.div
          variants={revealContainer}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="relative z-10 mx-auto flex min-h-[58svh] w-full max-w-7xl items-center px-5 py-12 sm:min-h-[62svh] sm:px-6 sm:py-14 md:min-h-[70svh] lg:h-full lg:min-h-0 lg:max-w-none lg:px-[6vw] lg:py-0 2xl:px-[8vw]"
        >
          <m.div
            variants={revealContainer}
            className="w-full max-w-[720px] text-left text-white 2xl:max-w-[900px]"
          >
            <m.h2
              variants={revealItem}
              className="font-jost-extrabold text-[clamp(1.85rem,7.2vw,2.9rem)] leading-[1.05] text-balance drop-shadow-[0_2px_10px_rgba(0,0,0,0.24)] sm:text-[clamp(2rem,5.2vw,3.35rem)] lg:text-[clamp(2rem,3.55vw,4.8rem)]"
            >
              {title}
            </m.h2>
            <m.p
              variants={revealItem}
              className="mt-4 max-w-[680px] text-[clamp(0.84rem,3.2vw,0.98rem)] leading-relaxed text-pretty text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.22)] sm:mt-5 sm:text-[clamp(0.9rem,2vw,1.05rem)] lg:text-[clamp(0.9rem,1.08vw,1.18rem)] 2xl:max-w-[820px]"
            >
              {description}
            </m.p>
          </m.div>
        </m.div>
      </m.section>
    </LazyMotion>
  );
}

export function DisasterSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[58svh] animate-pulse overflow-hidden bg-[#201a11] sm:min-h-[62svh] md:min-h-[70svh] lg:h-[clamp(640px,50vw,840px)] lg:min-h-[640px] 2xl:h-[clamp(760px,48vw,940px)]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/16 via-black/8 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[58svh] w-full max-w-7xl items-center px-5 py-12 sm:min-h-[62svh] sm:px-6 sm:py-14 md:min-h-[70svh] lg:h-full lg:min-h-0 lg:max-w-none lg:px-[6vw] lg:py-0 2xl:px-[8vw]">
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
