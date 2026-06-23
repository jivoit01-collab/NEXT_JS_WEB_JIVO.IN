'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage, SplitWords } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CoreValuesFoundationContent } from '../types';
import { defaultFoundationContent } from '../data/defaults';

interface Props {
  data?: CoreValuesFoundationContent;
}

/** TRUTH AS FOUNDATION — heading + 2-column value blocks over hands bg. */
export function FoundationSection({ data }: Props) {
  const { heading, backgroundImage, blocks } = data ?? defaultFoundationContent;
  const prefersReducedMotion = useReducedMotion();
  const revealVariant = prefersReducedMotion ? reducedMotion : fadeUp;
  const containerVariant = prefersReducedMotion ? reducedMotion : container;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-32 2xl:py-40">
      {backgroundImage ? (
        <SafeImage
          src={backgroundImage}
          alt=""
          fill
          quality={78}
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-b from-[#2d1810] via-[#3a1f15] to-[#1a0d08]" />
      )}

      <LazyMotion features={domAnimation}>
        <m.div
          variants={containerVariant}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20"
        >
          <m.h2
            variants={revealVariant}
            className="mb-10 text-balance text-center font-jost-bold text-2xl uppercase tracking-[0.12em] text-white sm:mb-14 sm:text-3xl md:text-4xl lg:mb-28 lg:text-6xl 2xl:mb-32 2xl:text-7xl"
          >
            <SplitWords text={heading} inheritParent />
          </m.h2>

          <div className="grid gap-10 sm:gap-12 md:grid-cols-2 md:gap-16 lg:gap-24 2xl:gap-32">
            {blocks.map((block, i) => (
              <m.div key={`${block.label}-${i}`} variants={revealVariant}>
                <h3 className="mb-3 font-jost-bold text-sm uppercase tracking-[0.2em] text-white sm:mb-4 sm:text-base md:text-lg 2xl:mb-5 2xl:text-xl">
                  {block.label}
                </h3>
                <p className="text-pretty text-sm leading-relaxed text-white/85 sm:text-base md:text-lg 2xl:text-xl">
                  {block.description}
                </p>
              </m.div>
            ))}
          </div>
        </m.div>
      </LazyMotion>
    </section>
  );
}

export function FoundationSectionSkeleton() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-32 2xl:py-40">
      <div className="absolute inset-0 bg-[#2d1810]" />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20 animate-pulse">
        {/* Heading */}
        <div className="mb-10 flex justify-center sm:mb-14 lg:mb-28 2xl:mb-32">
          <div className="h-7 w-72 rounded-md bg-white/20 sm:h-9 sm:w-96 md:h-10 lg:h-14 lg:w-120 2xl:h-16 2xl:w-144" />
        </div>
        {/* 2-col blocks */}
        <div className="grid gap-10 sm:gap-12 md:grid-cols-2 md:gap-16 lg:gap-24 2xl:gap-32">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 sm:space-y-4">
              <div className="h-4 w-32 rounded bg-white/25 sm:h-5 sm:w-40 2xl:h-6 2xl:w-52" />
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded bg-white/15 sm:h-4 2xl:h-5" />
                <div className="h-3.5 w-full rounded bg-white/15 sm:h-4 2xl:h-5" />
                <div className="h-3.5 w-4/5 rounded bg-white/15 sm:h-4 2xl:h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

