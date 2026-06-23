'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CoreValuesPrinciplesContent } from '../types';
import { defaultPrinciplesContent } from '../data/defaults';

interface Props {
  data?: CoreValuesPrinciplesContent;
}

/** Sewa / Intelligence / Integrity — grid over sunset-sky bg. */
export function PrinciplesSection({ data }: Props) {
  const { backgroundImage, blocks } = data ?? defaultPrinciplesContent;
  const prefersReducedMotion = useReducedMotion();
  const revealVariant = prefersReducedMotion ? reducedMotion : fadeUp;
  const containerVariant = prefersReducedMotion ? reducedMotion : container;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
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
        <div className="absolute inset-0 bg-linear-to-b from-[#f8a880] via-[#f1738a] to-[#8b4789]" />
      )}

      <LazyMotion features={domAnimation}>
        <m.div
          variants={containerVariant}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20"
        >
          <div className="grid gap-10 sm:gap-12 md:grid-cols-2 md:gap-16 lg:gap-24 2xl:gap-32">
            {blocks.map((block, i) => (
              <m.div key={`${block.label}-${i}`} variants={revealVariant}>
                <h3 className="mb-3 font-jost-bold text-sm uppercase tracking-[0.2em] text-white sm:mb-4 sm:text-base md:text-lg 2xl:mb-5 2xl:text-xl">
                  {block.label}
                </h3>
                <p className="text-pretty text-sm leading-relaxed text-white/90 sm:text-base md:text-lg 2xl:text-xl">
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

export function PrinciplesSectionSkeleton() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28 2xl:py-36">
      <div className="absolute inset-0 bg-linear-to-b from-[#f8a880] via-[#f1738a] to-[#8b4789]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20 animate-pulse">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-2 md:gap-16 lg:gap-24 2xl:gap-32">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 sm:space-y-4">
              <div className="h-4 w-32 rounded bg-white/30 sm:h-5 sm:w-40 2xl:h-6 2xl:w-52" />
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded bg-white/20 sm:h-4 2xl:h-5" />
                <div className="h-3.5 w-full rounded bg-white/20 sm:h-4 2xl:h-5" />
                <div className="h-3.5 w-4/5 rounded bg-white/20 sm:h-4 2xl:h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

