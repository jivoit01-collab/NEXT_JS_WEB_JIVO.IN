'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import {
  containerSlow,
  defaultViewport,
  fadeUpSlow,
  imageReveal,
  reducedMotion,
} from '@/lib/animation-variants';
import { fallbackImage, defaultEducateContent } from '../data/defaults';
import type { SocialInitiativesEducateContent } from '../types';

interface EducateEmpowerSectionProps {
  data?: SocialInitiativesEducateContent;
}

const FULL_BLEED_IMAGE_SIZES = '100vw';

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function EducateEmpowerSection({ data }: EducateEmpowerSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : containerSlow;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;
  const revealImage = prefersReducedMotion ? reducedMotion : imageReveal;
  const hoverLift = prefersReducedMotion
    ? undefined
    : { y: -8, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } };
  const { heading, paragraph, image } = data ?? defaultEducateContent;

  return (
    <section
      className="relative min-h-[720px] overflow-hidden bg-[#2c1c0f] sm:min-h-[800px] lg:h-[clamp(600px,50vw,820px)] lg:min-h-[600px]"
      style={{ contentVisibility: 'auto', contain: 'layout paint' }}
    >
      <LazyMotion features={domAnimation}>
        <m.div
          variants={revealImage}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="absolute inset-0 overflow-hidden transform-gpu"
        >
          <SafeImage
            src={imageWithFallback(image)}
            alt=""
            fill
            loading="lazy"
            quality={80}
            className="object-cover object-[72%_bottom] sm:object-[66%_bottom] md:object-[60%_center] lg:object-center"
            sizes={FULL_BLEED_IMAGE_SIZES}
          />
        </m.div>
        {/* Mobile: darken the top band so the top-aligned text stays readable over the image. */}
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/30 to-transparent lg:hidden" />
        <div className="absolute inset-0 bg-linear-to-r from-black/34 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/18" />

        <m.div
          variants={revealContainer}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="relative z-10 mx-auto flex max-w-7xl items-start px-3 pt-6 pb-12 sm:px-4 sm:pt-8 md:pb-16 lg:h-full lg:items-end lg:px-6 lg:pt-0 lg:pb-[clamp(7rem,22dvh,13rem)] xl:px-8 2xl:max-w-screen-2xl 2xl:px-12"
        >
          <m.div variants={revealItem} className="w-full max-w-[680px] 2xl:max-w-[820px]">
            <m.h2
              whileHover={hoverLift}
              className="font-jost-extrabold inline-block cursor-default text-[clamp(1.75rem,3.15vw,4.25rem)] leading-[0.98] text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.42)] transition-[text-shadow] duration-500 hover:[text-shadow:0_10px_36px_rgba(0,0,0,0.5)] sm:whitespace-nowrap"
            >
              {heading}
            </m.h2>
            <m.p
              whileHover={hoverLift}
              className="mt-4 max-w-[650px] cursor-default text-[clamp(0.88rem,1.04vw,1.12rem)] leading-relaxed text-pretty whitespace-pre-line text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] transition-colors duration-300 hover:text-white 2xl:max-w-[760px]"
            >
              {paragraph}
            </m.p>
          </m.div>
        </m.div>
      </LazyMotion>
    </section>
  );
}

export function EducateEmpowerSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative animate-pulse overflow-hidden bg-[#2c1c0f] lg:h-[clamp(600px,50vw,820px)] lg:min-h-[600px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/42 via-black/12 to-transparent" />
      <div className="relative z-10 mx-auto flex max-w-none items-end px-[5vw] pt-20 pb-12 sm:px-[5.5vw] sm:pb-14 md:pb-16 lg:h-full lg:px-[4.5vw] lg:pt-0 lg:pb-[clamp(4.5rem,14dvh,8.5rem)] 2xl:px-[6vw]">
        <div className="w-full max-w-[680px]">
          <div className="h-12 w-full rounded bg-white/25 sm:h-16" />
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full rounded bg-white/15" />
            <div className="h-4 w-5/6 rounded bg-white/15" />
            <div className="h-4 w-2/3 rounded bg-white/15" />
          </div>
        </div>
      </div>
    </section>
  );
}
