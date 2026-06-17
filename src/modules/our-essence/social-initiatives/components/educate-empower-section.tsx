'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import {
  containerSlow,
  defaultViewport,
  fadeUpSlow,
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
  const { heading, paragraph, image } = data ?? defaultEducateContent;

  return (
    <section
      className="relative overflow-hidden bg-[#2c1c0f] lg:h-[clamp(600px,50vw,820px)] lg:min-h-[600px]"
      style={{ contentVisibility: 'auto', contain: 'layout paint' }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <SafeImage
          src={imageWithFallback(image)}
          alt=""
          fill
          loading="lazy"
          quality={90}
          className="object-cover object-[68%_center] sm:object-[64%_center] md:object-[60%_center] lg:object-center"
          sizes={FULL_BLEED_IMAGE_SIZES}
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-black/34 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/18" />

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto flex max-w-none items-end px-[5vw] pt-20 pb-12 sm:px-[5.5vw] sm:pb-14 md:pb-16 lg:h-full lg:px-[4.5vw] lg:pt-0 lg:pb-[clamp(4.5rem,14vh,8.5rem)] 2xl:px-[6vw]"
      >
        <motion.div variants={revealItem} className="w-full max-w-[680px] 2xl:max-w-[820px]">
          <h2 className="font-jost-extrabold text-[clamp(1.75rem,3.15vw,4.25rem)] leading-[0.98] text-balance text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.42)] lg:whitespace-nowrap">
            {heading}
          </h2>
          <p className="mt-4 max-w-[650px] text-[clamp(0.88rem,1.04vw,1.12rem)] leading-relaxed text-pretty whitespace-pre-line text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] 2xl:max-w-[760px]">
            {paragraph}
          </p>
        </motion.div>
      </motion.div>
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
      <div className="relative z-10 mx-auto flex max-w-none items-end px-[5vw] pt-20 pb-12 sm:px-[5.5vw] sm:pb-14 md:pb-16 lg:h-full lg:px-[4.5vw] lg:pt-0 lg:pb-[clamp(4.5rem,14vh,8.5rem)] 2xl:px-[6vw]">
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
