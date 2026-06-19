'use client';

import { cubicBezier, motion, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { defaultViewport, reducedMotion } from '@/lib/animation-variants';
import { defaultCleanTreeContent, fallbackImage } from '../data/defaults';
import type { ForMotherEarthCleanTreeContent } from '../types';

interface CleanTreeSectionProps {
  data?: ForMotherEarthCleanTreeContent;
}

const FULL_BLEED_IMAGE_SIZES = '(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1920px';
const TEXT_EASE = cubicBezier(0.22, 1, 0.36, 1);
const textContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};
const textFadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: TEXT_EASE,
    },
  },
};

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function CleanTreeSection({ data }: CleanTreeSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : textContainer;
  const revealItem = prefersReducedMotion ? reducedMotion : textFadeUp;
  const { image, cleanTitle, cleanDescription, treeTitle, treeDescription } =
    data ?? defaultCleanTreeContent;

  return (
    <section className="relative min-h-[58svh] overflow-hidden bg-[#28311e] sm:min-h-[62svh] md:min-h-[70svh] lg:h-[clamp(660px,52vw,860px)] lg:min-h-[660px] 2xl:h-[clamp(760px,50vw,960px)]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        quality={90}
        className="object-cover object-[30%_center] sm:object-[34%_center] md:object-[42%_center] lg:object-center"
        sizes={FULL_BLEED_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/6 via-black/8 to-black/16" />

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto flex min-h-[58svh] w-full max-w-7xl items-center px-5 py-12 sm:min-h-[62svh] sm:px-6 sm:py-14 md:min-h-[70svh] md:py-18 lg:h-full lg:min-h-0 lg:max-w-none lg:px-[6vw] lg:py-[clamp(4.5rem,8vw,7rem)] 2xl:px-[8vw]"
      >
        <div className="ml-auto w-full max-w-[760px] text-left text-white lg:w-[64vw] lg:max-w-[900px] 2xl:max-w-[1120px]">
          <StoryBlock
            title={cleanTitle}
            description={cleanDescription}
            groupVariant={revealContainer}
            itemVariant={revealItem}
          />
          <div className="mt-10 sm:mt-12 lg:mt-[clamp(3rem,5vw,5.5rem)]">
            <StoryBlock
              title={treeTitle}
              description={treeDescription}
              groupVariant={revealContainer}
              itemVariant={revealItem}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function StoryBlock({
  title,
  description,
  groupVariant,
  itemVariant,
}: {
  title: string;
  description: string;
  groupVariant: Variants;
  itemVariant: Variants;
}) {
  return (
    <motion.div variants={groupVariant}>
      <motion.h2
        variants={itemVariant}
        className="font-jost-extrabold text-[clamp(1.8rem,7.2vw,2.8rem)] leading-[1.08] text-balance text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.24)] sm:text-[clamp(2rem,5.2vw,3.35rem)] lg:text-[clamp(2rem,3.45vw,4.8rem)]"
      >
        {title}
      </motion.h2>
      <motion.p
        variants={itemVariant}
        className="mt-3 max-w-[880px] text-[clamp(0.84rem,3.2vw,0.98rem)] leading-relaxed text-pretty text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.22)] sm:mt-4 sm:text-[clamp(0.9rem,2vw,1.05rem)] lg:text-[clamp(0.9rem,1.08vw,1.18rem)] 2xl:max-w-[1040px]"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

export function CleanTreeSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[58svh] animate-pulse overflow-hidden bg-[#28311e] sm:min-h-[62svh] md:min-h-[70svh] lg:h-[clamp(660px,52vw,860px)] lg:min-h-[660px] 2xl:h-[clamp(760px,50vw,960px)]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/6 via-black/8 to-black/16" />
      <div className="relative z-10 mx-auto flex min-h-[58svh] w-full max-w-7xl items-center px-5 py-12 sm:min-h-[62svh] sm:px-6 sm:py-14 md:min-h-[70svh] md:py-18 lg:h-full lg:min-h-0 lg:max-w-none lg:px-[6vw] lg:py-[clamp(4.5rem,8vw,7rem)] 2xl:px-[8vw]">
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
