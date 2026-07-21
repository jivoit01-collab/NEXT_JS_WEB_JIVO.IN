'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage, SplitWords } from '@/components/shared/public';
import type { TheStoryFounderContent } from '../types';
import { defaultFounderContent } from '../data/defaults';
import { containerSlow, fadeUpSlow, reducedMotion, defaultViewport } from '@/lib/animation-variants';

interface Props {
  data?: TheStoryFounderContent;
}

export function FounderSection({ data }: Props) {
  const { sectionHeading, title, paragraph, founderImage } = data ?? defaultFounderContent;
  const prefersReducedMotion = useReducedMotion();
  const containerVariant = prefersReducedMotion ? reducedMotion : containerSlow;
  const revealVariant = prefersReducedMotion ? reducedMotion : fadeUpSlow;

  const hoverLift = prefersReducedMotion
    ? undefined
    : { y: -8, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } };

  return (
    <section className="relative overflow-hidden bg-[#0a7362] py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      {/* Decorative soft glow drifting behind the content */}
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <LazyMotion features={domAnimation}>
        <m.div
          variants={containerVariant}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20"
        >
          <m.h2
            variants={revealVariant}
            whileHover={hoverLift}
            className="font-jost-bold mb-10 inline-block w-full cursor-default text-center text-2xl tracking-[0.15em] text-white uppercase transition-[text-shadow] duration-500 hover:[text-shadow:0_8px_30px_rgba(255,255,255,0.3)] sm:mb-12 sm:text-3xl md:mb-14 md:text-4xl lg:mb-16 lg:text-5xl 2xl:mb-20 2xl:text-6xl"
          >
            <SplitWords text={sectionHeading} inheritParent />
          </m.h2>

          <div className="grid items-center gap-10 sm:gap-12 md:grid-cols-[1fr_auto] md:gap-14 lg:gap-20 2xl:gap-28">
            <m.div variants={revealVariant} className="max-w-xl min-w-0 2xl:max-w-3xl">
              <m.h3
                whileHover={hoverLift}
                className="font-jost-bold mb-3 inline-block cursor-default text-sm tracking-wider text-white/90 uppercase transition-all duration-300 hover:tracking-[0.22em] hover:text-white sm:mb-4 sm:text-base md:text-lg lg:text-xl 2xl:mb-5 2xl:text-2xl"
              >
                {title}
              </m.h3>

              <m.p
                whileHover={hoverLift}
                className="cursor-default text-sm leading-relaxed text-white/80 transition-colors duration-300 hover:text-white sm:text-base md:text-lg 2xl:text-xl"
              >
                {paragraph}
              </m.p>
            </m.div>

            <m.div variants={revealVariant} className="flex justify-center md:justify-end">
              <m.div
                whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 120 }}
                className="group relative aspect-[3/3.8] w-60 overflow-hidden rounded-xl bg-[#373639] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] transition-shadow duration-500 hover:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.55)] sm:w-64 md:w-72 lg:w-80 2xl:w-96"
              >
                {/* Glow ring that fades in on hover */}
                <span className="pointer-events-none absolute inset-0 z-10 rounded-xl ring-0 ring-white/0 transition-all duration-500 group-hover:ring-2 group-hover:ring-white/40" />
                {founderImage ? (
                  <SafeImage
                    src={founderImage}
                    alt="Baba Iqbal Singh Ji — Founding Father"
                    fill
                    /* Maintains right alignment for the portrait of Baba Iqbal Singh Ji */
                    quality={78}
                    className="object-contain object-right transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 240px, (max-width: 768px) 256px, (max-width: 1024px) 288px, (max-width: 1536px) 320px, 384px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-white/50">
                    Founder Portrait
                  </div>
                )}
                {/* Subtle bottom gradient that deepens on hover */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </m.div>
            </m.div>
          </div>
        </m.div>
      </LazyMotion>
    </section>
  );
}

// --- Skeleton ---
export function FounderSectionSkeleton() {
  return (
    <section className="bg-[#0a7362] py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20 animate-pulse">
        {/* Heading */}
        <div className="mb-10 flex justify-center sm:mb-12 md:mb-14 lg:mb-16 2xl:mb-20">
          <div className="h-7 w-64 rounded-md bg-white/20 sm:h-8 sm:w-80 md:h-10 md:w-96 lg:h-12 lg:w-112 2xl:h-14 2xl:w-128" />
        </div>

        {/* Grid */}
        <div className="grid items-center gap-10 sm:gap-12 md:grid-cols-[1fr_auto] md:gap-14 lg:gap-20 2xl:gap-28">
          {/* Text side */}
          <div className="max-w-xl min-w-0 space-y-4 2xl:max-w-3xl">
            <div className="h-4 w-40 rounded bg-white/20 sm:h-5 sm:w-52 2xl:h-6 2xl:w-64" />
            <div className="space-y-2.5">
              <div className="h-3.5 w-full rounded bg-white/15 sm:h-4 2xl:h-5" />
              <div className="h-3.5 w-full rounded bg-white/15 sm:h-4 2xl:h-5" />
              <div className="h-3.5 w-5/6 rounded bg-white/15 sm:h-4 2xl:h-5" />
              <div className="h-3.5 w-4/5 rounded bg-white/15 sm:h-4 2xl:h-5" />
              <div className="h-3.5 w-3/4 rounded bg-white/15 sm:h-4 2xl:h-5" />
            </div>
          </div>

          {/* Portrait side */}
          <div className="flex justify-center md:justify-end">
            <div className="aspect-[3/3.8] w-60 rounded-xl bg-white/15 sm:w-64 md:w-72 lg:w-80 2xl:w-96" />
          </div>
        </div>
      </div>
    </section>
  );
}
