'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { containerSlow, fadeUpSlow, reducedMotion } from '@/lib/animation-variants';
import {
  defaultFarmToBottleContent,
  defaultFreshLockContent,
  fallbackImage,
} from '../data/defaults';
import type {
  TheJivoCapitalFarmToBottleContent,
  TheJivoCapitalFreshLockContent,
} from '../types';

const FARM_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzU3NjUzOSIvPjwvc3ZnPg==';

const FULL_IMAGE_SIZES = '100vw';

interface FarmToBottleSectionProps {
  data?: TheJivoCapitalFarmToBottleContent;
}

interface FreshLockSectionProps {
  data?: TheJivoCapitalFreshLockContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function FarmToBottleSection({ data }: FarmToBottleSectionProps) {
  const section = data ?? defaultFarmToBottleContent;
  const prefersReducedMotion = useReducedMotion();
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;
  const hoverLift = prefersReducedMotion
    ? undefined
    : { y: -6, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } };
  const hoverHeading = prefersReducedMotion
    ? undefined
    : { y: -6, scale: 1.012, transition: { type: 'spring' as const, stiffness: 280, damping: 18 } };

  return (
    <LazyMotion features={domAnimation}>
      <m.section className="relative min-h-[74svh] overflow-hidden bg-[#53643a] sm:min-h-[82svh] lg:min-h-[100svh]">
        {section.image ? (
          <SafeImage
            src={imageWithFallback(section.image)}
            alt=""
            fill
            loading="lazy"
            quality={80}
            placeholder="blur"
            blurDataURL={FARM_BLUR}
            className="object-cover object-center"
            sizes={FULL_IMAGE_SIZES}
          />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(100deg,#3e5d29_0%,#86a245_42%,#394032_43%,#171b18_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[repeating-linear-gradient(112deg,rgba(255,255,255,0.18)_0_1px,transparent_1px_54px),linear-gradient(8deg,#172b16_0%,#4f842b_46%,#b8c36a_47%,transparent_48%)]" />
            <div className="absolute top-0 right-0 h-full w-[48%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.18)_0_2px,transparent_2px_70px),linear-gradient(90deg,#1a1c1a,#56615a_36%,#111310)]" />
            <div className="absolute right-[7%] bottom-[8%] h-24 w-[44%] rounded-full bg-black/35 blur-2xl" />
            <div className="absolute right-[5%] bottom-[11%] flex gap-5 opacity-80">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 w-10 rounded-t-2xl rounded-b-md border border-white/25 bg-[#197221]/80 shadow-2xl"
                />
              ))}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-b from-black/34 via-black/8 to-black/22" />
        <div className="absolute inset-0 bg-linear-to-r from-black/24 via-transparent to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-[72svh] w-full max-w-7xl items-start px-3 py-12 text-white sm:min-h-[82svh] sm:px-4 sm:py-14 lg:min-h-[100svh] lg:px-6 lg:py-16 xl:px-8 2xl:max-w-screen-2xl 2xl:px-12 2xl:pt-20">
          <m.div
            variants={containerSlow}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            className="w-full max-w-[860px]"
          >
            <m.h2
              variants={revealItem}
              whileHover={hoverHeading}
              className="font-jost-extrabold inline-block cursor-default text-[clamp(2rem,8vw,3rem)] leading-[0.98] text-balance drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] lg:text-[clamp(2rem,3.4vw,4rem)]"
            >
              {section.title}
            </m.h2>
            <m.p
              variants={revealItem}
              whileHover={hoverLift}
              className="mt-5 max-w-[840px] cursor-default whitespace-pre-line text-[clamp(0.9rem,3.8vw,1rem)] leading-relaxed text-pretty text-white/94 drop-shadow-[0_3px_12px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:text-white 2xl:text-xl"
            >
              {section.description}
            </m.p>
          </m.div>
        </div>
      </m.section>
    </LazyMotion>
  );
}

export function FreshLockSection({ data }: FreshLockSectionProps) {
  const section = data ?? defaultFreshLockContent;
  const prefersReducedMotion = useReducedMotion();
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;
  const hoverLift = prefersReducedMotion
    ? undefined
    : { y: -6, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } };
  const hoverHeading = prefersReducedMotion
    ? undefined
    : { y: -6, scale: 1.012, transition: { type: 'spring' as const, stiffness: 280, damping: 18 } };

  return (
    <LazyMotion features={domAnimation}>
      <m.section className="relative min-h-[78svh] overflow-hidden bg-[#a8b797] sm:min-h-[86svh] lg:min-h-[100svh]">
        {section.backgroundImage ? (
          <SafeImage
            src={section.backgroundImage}
            alt=""
            fill
            loading="lazy"
            quality={80}
            placeholder="blur"
            blurDataURL={FARM_BLUR}
            className="object-cover object-[68%_100%] lg:object-center"
            sizes={FULL_IMAGE_SIZES}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_88%,rgba(235,242,216,0.9),transparent_34%),linear-gradient(110deg,#9dac88_0%,#b9c3a5_52%,#8d9c78_100%)]" />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-[#8c9d7b]/80 via-[#aebc9f]/40 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[78svh] w-full max-w-7xl items-start px-3 pt-12 pb-52 sm:min-h-[86svh] sm:px-4 sm:pt-14 sm:pb-56 lg:min-h-[100svh] lg:items-center lg:px-6 lg:py-16 xl:px-8 2xl:max-w-screen-2xl 2xl:px-12 2xl:py-36">
          <m.div
            variants={containerSlow}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            className="max-w-[88%] text-white sm:max-w-[560px] lg:max-w-[600px]"
          >
            <m.h2
              variants={revealItem}
              whileHover={hoverHeading}
              className="font-jost-extrabold inline-block cursor-default text-[clamp(1.5rem,6vw,2.1rem)] leading-[1.08] text-balance drop-shadow-[0_3px_12px_rgba(63,78,52,0.38)] lg:text-[clamp(1.8rem,2.5vw,2.6rem)]"
            >
              {section.title}
            </m.h2>
            <m.p
              variants={revealItem}
              whileHover={hoverLift}
              className="mt-5 max-w-[800px] cursor-default whitespace-pre-line text-[clamp(0.82rem,3.2vw,0.95rem)] leading-relaxed text-pretty text-white/96 drop-shadow-[0_2px_10px_rgba(63,78,52,0.34)] transition-colors duration-300 hover:text-white sm:mt-6 lg:mt-7 lg:text-base 2xl:text-xl"
            >
              {section.description}
            </m.p>
          </m.div>
        </div>
      </m.section>
    </LazyMotion>
  );
}

export function FarmToBottleSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[74svh] animate-pulse overflow-hidden bg-[#53643a] sm:min-h-[82svh] lg:min-h-[100svh]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-black/18" />
      <div className="relative z-10 mx-auto flex min-h-[72svh] w-full max-w-7xl items-start px-3 py-12 text-white sm:min-h-[82svh] sm:px-4 sm:py-14 lg:min-h-[100svh] lg:px-6 lg:py-16 xl:px-8 2xl:max-w-screen-2xl 2xl:px-12 2xl:pt-20">
        <div className="w-full max-w-[860px]">
          <div className="h-12 w-full max-w-3xl rounded bg-white/24 sm:h-16 lg:h-20" />
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full rounded bg-white/16 2xl:h-5" />
            <div className="h-4 w-11/12 rounded bg-white/16 2xl:h-5" />
            <div className="h-4 w-4/5 rounded bg-white/16 2xl:h-5" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FreshLockSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[82svh] animate-pulse overflow-hidden bg-[#a8b797] sm:min-h-[88svh] lg:min-h-[100svh]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="relative z-10 mx-auto flex min-h-[78svh] w-full max-w-7xl items-start px-3 pt-12 pb-52 sm:min-h-[86svh] sm:px-4 sm:pt-14 sm:pb-56 lg:min-h-[100svh] lg:items-center lg:px-6 lg:py-16 xl:px-8 2xl:max-w-screen-2xl 2xl:px-12 2xl:py-36">
        <div className="max-w-[600px]">
          <div className="h-12 w-full max-w-3xl rounded bg-white/28 sm:h-16 lg:h-20" />
          <div className="mt-7 space-y-2">
            <div className="h-4 w-full rounded bg-white/18 2xl:h-5" />
            <div className="h-4 w-11/12 rounded bg-white/18 2xl:h-5" />
            <div className="h-4 w-5/6 rounded bg-white/18 2xl:h-5" />
            <div className="h-4 w-3/4 rounded bg-white/18 2xl:h-5" />
          </div>
        </div>
      </div>
    </section>
  );
}
