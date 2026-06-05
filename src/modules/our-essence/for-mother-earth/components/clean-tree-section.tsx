'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, defaultViewport, fadeUp, reducedMotion } from '@/lib/animation-variants';
import { defaultCleanTreeContent, fallbackImage } from '../data/defaults';
import type { ForMotherEarthCleanTreeContent } from '../types';

interface CleanTreeSectionProps {
  data?: ForMotherEarthCleanTreeContent;
}

const FULL_BLEED_IMAGE_SIZES = '(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1920px';

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function CleanTreeSection({ data }: CleanTreeSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : container;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUp;
  const { image, cleanTitle, cleanDescription, treeTitle, treeDescription } =
    data ?? defaultCleanTreeContent;

  return (
    <section
      className="relative min-h-[640px] overflow-hidden bg-[#28311e] sm:min-h-[620px] lg:h-[clamp(660px,52vw,820px)] lg:min-h-[660px]"
      style={{ contentVisibility: 'auto', contain: 'layout paint' }}
    >
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        quality={90}
        className="object-cover object-center"
        sizes={FULL_BLEED_IMAGE_SIZES}
      />

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto flex min-h-[640px] w-full max-w-7xl items-start px-5 py-16 sm:min-h-[620px] sm:px-6 md:py-18 lg:h-full lg:min-h-0 lg:max-w-none lg:px-[6vw] lg:py-[clamp(4.5rem,8vw,7rem)] 2xl:px-[8vw]"
      >
        <div className="ml-auto w-full max-w-[760px] text-left text-white lg:w-[64vw] lg:max-w-[900px] 2xl:max-w-[1120px]">
          <StoryBlock title={cleanTitle} description={cleanDescription} variant={revealItem} />
          <div className="mt-10 sm:mt-12 lg:mt-[clamp(3rem,5vw,5.5rem)]">
            <StoryBlock title={treeTitle} description={treeDescription} variant={revealItem} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function StoryBlock({
  title,
  description,
  variant,
}: {
  title: string;
  description: string;
  variant: Variants;
}) {
  return (
    <motion.div variants={variant}>
      <h2 className="font-jost-extrabold text-[clamp(2rem,3.45vw,4.8rem)] leading-[1.08] text-balance text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.38)]">
        {title}
      </h2>
      <p className="mt-4 max-w-[880px] text-[clamp(0.9rem,1.08vw,1.18rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.34)] 2xl:max-w-[1040px]">
        {description}
      </p>
    </motion.div>
  );
}

export function CleanTreeSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[640px] animate-pulse overflow-hidden bg-[#28311e] sm:min-h-[620px] lg:h-[clamp(660px,52vw,820px)] lg:min-h-[660px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/10 via-black/12 to-black/42" />
      <div className="relative z-10 mx-auto flex min-h-[640px] w-full max-w-7xl items-start px-5 py-16 sm:min-h-[620px] sm:px-6 md:py-18 lg:h-full lg:min-h-0 lg:max-w-none lg:px-[6vw] lg:py-[clamp(4.5rem,8vw,7rem)] 2xl:px-[8vw]">
        <div className="ml-auto w-full max-w-[760px] lg:w-[64vw] lg:max-w-[900px] 2xl:max-w-[1120px]">
          {[0, 1].map((item) => (
            <div
              key={item}
              className={item === 1 ? 'mt-10 sm:mt-12 lg:mt-[clamp(3rem,5vw,5.5rem)]' : undefined}
            >
              <div className="h-10 w-full max-w-3xl rounded bg-white/24 sm:h-14 2xl:h-18" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded bg-white/14" />
                <div className="h-4 w-11/12 rounded bg-white/14" />
                <div className="h-4 w-4/5 rounded bg-white/14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
