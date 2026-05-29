'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { containerSlow, fadeUpSlow, reducedMotion } from '@/lib/animation-variants';
import { defaultHeroContent, fallbackImage } from '../data/defaults';
import type { OurFairShareHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzFlMjExYiIvPjwvc3ZnPg==';
const HERO_IMAGE_SIZES = '(max-width: 768px) 140vw, (max-width: 1536px) 115vw, 100vw';

interface OurFairShareHeroSectionProps {
  data?: OurFairShareHeroContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function OurFairShareHeroSection({ data }: OurFairShareHeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : containerSlow;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;
  const { title, subtitle, description, image } = data ?? defaultHeroContent;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#161a14]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        quality={100}
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        className="object-cover object-top"
        sizes={HERO_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/14 via-black/6 to-black/28" />
      <div className="absolute inset-0 bg-linear-to-b from-black/12 via-transparent to-black/16" />

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.45 }}
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-5 pt-28 pb-16 text-center sm:px-6 lg:block lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0"
      >
        <motion.div
          variants={revealContainer}
          style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
          className="mx-auto w-full max-w-[620px] min-w-0 transform-gpu text-center text-white transition-transform duration-700 ease-out lg:absolute lg:top-[22.5%] lg:left-[52.2%] lg:w-[44vw] lg:max-w-[590px] lg:hover:-translate-y-1 xl:max-w-[650px] 2xl:left-[52.5%] 2xl:max-w-[760px]"
        >
          <motion.h1
            variants={revealItem}
            className="font-jost-extrabold text-[clamp(1.85rem,2.35vw,3.6rem)] leading-[1.04] text-balance text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.38)] lg:whitespace-nowrap"
          >
            {title}
          </motion.h1>
          <motion.p
            variants={revealItem}
            className="font-jost-medium mx-auto mt-3 max-w-[560px] text-center text-[clamp(0.68rem,0.74vw,0.9rem)] tracking-[0.18em] text-white/92 uppercase"
          >
            {subtitle}
          </motion.p>
          <motion.p
            variants={revealItem}
            className="mx-auto mt-4 w-full max-w-[560px] text-center text-[clamp(0.82rem,0.92vw,1.02rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)] 2xl:max-w-[680px]"
          >
            {description}
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function OurFairShareHeroSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-screen animate-pulse overflow-hidden bg-[#161a14]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/14 via-black/6 to-black/28" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 pt-28 pb-16 text-center sm:px-6 lg:block lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0">
        <div className="mx-auto w-full max-w-[620px] lg:absolute lg:top-[22.5%] lg:left-[52.2%] lg:w-[44vw] lg:max-w-[590px]">
          <div className="mx-auto h-10 w-full max-w-2xl rounded bg-white/24 sm:h-14 2xl:h-16" />
          <div className="mx-auto mt-4 h-4 w-4/5 rounded bg-white/18" />
          <div className="mx-auto mt-5 w-full max-w-[560px] space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="mx-auto h-4 w-5/6 rounded bg-white/14" />
            <div className="mx-auto h-4 w-2/3 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
