'use client';

import { motion } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { container, defaultViewport, fadeUp } from '@/lib/animation-variants';
import { fallbackImage, defaultEducateContent } from '../data/defaults';
import type { SocialInitiativesEducateContent } from '../types';

interface EducateEmpowerSectionProps {
  data?: SocialInitiativesEducateContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function EducateEmpowerSection({ data }: EducateEmpowerSectionProps) {
  const { heading, paragraph, image } = data ?? defaultEducateContent;

  return (
    <section className="relative min-h-[540px] overflow-hidden bg-[#2c1c0f] lg:h-[50vw] lg:max-h-[760px] lg:min-h-[600px]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        quality={100}
        className="object-cover object-center motion-safe:scale-[1.01]"
        sizes="(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 2560px"
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto flex min-h-[540px] max-w-none items-end px-[4.5vw] pt-24 pb-[18vh] sm:px-[4.5vw] lg:h-full lg:min-h-0 lg:py-0 lg:pb-[17vh]"
      >
        <motion.div variants={fadeUp} className="mb-10 max-w-[620px] 2xl:max-w-[760px]">
          <h2 className="font-jost-extrabold text-[clamp(1.55rem,3.2vw,3.4rem)] leading-none text-balance text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.38)] lg:whitespace-nowrap">
            {heading}
          </h2>
          <p className="mt-3 max-w-[610px] text-[clamp(0.78rem,1.05vw,1rem)] leading-snug text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] 2xl:max-w-[720px]">
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
      className="relative min-h-[540px] animate-pulse overflow-hidden bg-[#2c1c0f] lg:h-[50vw] lg:max-h-[760px] lg:min-h-[600px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/42 via-black/12 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[540px] max-w-none items-end px-[4.5vw] pt-24 pb-[18vh] sm:px-[4.5vw] lg:h-full lg:min-h-0 lg:py-0 lg:pb-[17vh]">
        <div className="w-full max-w-[620px]">
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
