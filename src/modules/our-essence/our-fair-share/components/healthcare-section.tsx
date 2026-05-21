'use client';

import { motion } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { container, defaultViewport, fadeUp } from '@/lib/animation-variants';
import { defaultHealthcareContent, fallbackImage } from '../data/defaults';
import type { OurFairShareHealthcareContent } from '../types';

interface HealthcareSectionProps {
  data?: OurFairShareHealthcareContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function HealthcareSection({ data }: HealthcareSectionProps) {
  const { title, paragraph1, paragraph2, image } = data ?? defaultHealthcareContent;

  return (
    <section className="relative min-h-[560px] overflow-hidden bg-[#172735] lg:h-[44.3vw] lg:max-h-[760px] lg:min-h-[560px]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        quality={100}
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 2560px"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/38 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/12" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-start px-5 py-14 sm:px-6 lg:h-full lg:min-h-0 lg:max-w-none lg:px-0 lg:py-0"
      >
        <motion.div
          variants={fadeUp}
          className="w-full max-w-[560px] text-left text-white lg:absolute lg:top-[9.6%] lg:left-[2.2%] lg:w-[43vw] lg:max-w-[520px] xl:max-w-[560px] 2xl:max-w-[650px]"
        >
          <h2 className="font-jost-bold text-[clamp(2rem,3.15vw,4.25rem)] leading-[1.1] text-balance drop-shadow-[0_3px_14px_rgba(0,0,0,0.38)]">
            {title}
          </h2>
          <p className="mt-5 text-[clamp(0.9rem,1.02vw,1.12rem)] leading-relaxed text-pretty text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] lg:max-w-[520px]">
            {paragraph1}
          </p>
          <p className="mt-5 text-[clamp(0.86rem,0.98vw,1.05rem)] leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] lg:max-w-[520px]">
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
      className="relative min-h-[560px] animate-pulse overflow-hidden bg-[#172735] lg:h-[44.3vw] lg:max-h-[760px] lg:min-h-[560px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/38 via-black/10 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-start px-5 py-14 sm:px-6 lg:h-full lg:min-h-0 lg:max-w-none lg:px-0 lg:py-0">
        <div className="w-full max-w-[560px] lg:absolute lg:top-[9.6%] lg:left-[2.2%] lg:w-[43vw] lg:max-w-[520px]">
          <div className="h-28 w-full rounded bg-white/24 sm:h-36 2xl:h-44" />
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full rounded bg-white/16" />
            <div className="h-4 w-5/6 rounded bg-white/16" />
          </div>
          <div className="mt-6 space-y-2">
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
