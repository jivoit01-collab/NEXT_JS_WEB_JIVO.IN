'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { containerSlow, fadeUpSlow, reducedMotion } from '@/lib/animation-variants';
import {
  defaultOilPlantContent,
  defaultWaterPlantContent,
  fallbackImage,
} from '../data/defaults';
import type { TheJivoCapitalPlantContent } from '../types';

const PLANT_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzM1MzUzNCIvPjwvc3ZnPg==';
const PLANT_IMAGE_SIZES = '100vw';

interface PlantSectionProps {
  data?: TheJivoCapitalPlantContent;
  fallback: 'oil' | 'water';
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function PlantSection({ data, fallback }: PlantSectionProps) {
  const section = data ?? (fallback === 'oil' ? defaultOilPlantContent : defaultWaterPlantContent);
  // `align: 'right'` is used by the water plant — it anchors the copy to the TOP
  // (vs. the oil plant at the bottom); both columns stay left-aligned per design.
  const anchorTop = section.align === 'right';
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
      <m.section className="relative min-h-[100svh] overflow-hidden bg-[#30302f]">
        <SafeImage
          src={imageWithFallback(section.image)}
          alt=""
          fill
          loading="lazy"
          quality={80}
          placeholder="blur"
          blurDataURL={PLANT_BLUR}
          className="object-cover object-center"
          sizes={PLANT_IMAGE_SIZES}
        />
        <div className="absolute inset-0 bg-black/6" />
        {/* Scrim darkens the left column (and top edge for the top-anchored variant) for legible copy. */}
        <div
          className={
            anchorTop
              ? 'absolute inset-0 bg-linear-to-br from-black/32 via-black/8 to-transparent'
              : 'absolute inset-0 bg-linear-to-r from-black/24 via-black/5 to-transparent'
          }
        />

        <div
          className={`relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl px-3 py-16 text-left text-white sm:px-4 lg:px-6 xl:px-8 2xl:max-w-screen-2xl 2xl:px-12 ${
            anchorTop
              ? 'items-start pt-[clamp(3.25rem,7svh,5rem)]'
              : 'items-end pb-[clamp(3rem,8svh,5rem)]'
          }`}
        >
          <m.div
            variants={containerSlow}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            className={anchorTop ? 'w-full max-w-[1150px]' : 'w-full max-w-[760px]'}
          >
            <m.h2
              variants={revealItem}
              whileHover={hoverHeading}
              className={`font-jost-extrabold inline-block cursor-default text-balance leading-[1.1] drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)] ${
                anchorTop ? 'text-[clamp(1.4rem,2.2vw,2.1rem)]' : 'text-[clamp(2rem,3.25vw,4.2rem)]'
              }`}
            >
              {section.title}
            </m.h2>
            <m.p
              variants={revealItem}
              whileHover={hoverLift}
              className="mt-5 max-w-[760px] cursor-default text-[clamp(0.86rem,1vw,1.12rem)] leading-relaxed text-pretty text-white/94 drop-shadow-[0_3px_12px_rgba(0,0,0,0.52)] transition-colors duration-300 hover:text-white"
            >
              {section.description}
            </m.p>
          </m.div>
        </div>
      </m.section>
    </LazyMotion>
  );
}

export function PlantSectionSkeleton({ align = 'left' }: { align?: 'left' | 'right' }) {
  const alignRight = align === 'right';

  return (
    <section aria-hidden className="relative min-h-[100svh] animate-pulse overflow-hidden bg-[#30302f]">
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-black/22" />
      <div
        className={`relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl px-3 py-16 sm:px-4 lg:px-6 xl:px-8 2xl:max-w-screen-2xl 2xl:px-12 ${
          alignRight
            ? 'items-start pt-[clamp(3.25rem,7svh,5rem)]'
            : 'items-end pb-[clamp(3rem,8svh,5rem)]'
        }`}
      >
        <div className={alignRight ? 'w-full max-w-[1150px]' : 'w-full max-w-[760px]'}>
          <div className="h-16 w-full max-w-2xl rounded bg-white/24" />
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full rounded bg-white/16" />
            <div className="h-4 w-5/6 rounded bg-white/16" />
            <div className="h-4 w-2/3 rounded bg-white/16" />
          </div>
        </div>
      </div>
    </section>
  );
}
