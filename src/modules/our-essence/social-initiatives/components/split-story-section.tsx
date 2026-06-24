'use client';

import { LazyMotion, domAnimation, m, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import {
  containerSlow,
  defaultViewport,
  fadeUpSlow,
  imageReveal,
  reducedMotion,
} from '@/lib/animation-variants';
import { fallbackImage } from '../data/defaults';
import type { SocialInitiativesSplitContent } from '../types';

interface SplitStorySectionProps {
  data?: SocialInitiativesSplitContent;
  fallbackData: SocialInitiativesSplitContent;
  tone?: 'forest' | 'ocean';
}

const FULL_BLEED_IMAGE_SIZES = '100vw';

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function SplitStorySection({ data, fallbackData, tone = 'forest' }: SplitStorySectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : containerSlow;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;
  const revealImage = prefersReducedMotion ? reducedMotion : imageReveal;
  const content = data ?? fallbackData;
  const isOcean = tone === 'ocean';

  return (
    <section
      className="relative overflow-hidden bg-[#070b08] lg:h-[clamp(560px,46vw,760px)] lg:min-h-[560px]"
      style={{ contentVisibility: 'auto', contain: 'layout paint' }}
    >
      <LazyMotion features={domAnimation}>
        <m.div
          variants={revealImage}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="absolute inset-0 overflow-hidden transform-gpu"
        >
          <SafeImage
            src={imageWithFallback(content.backgroundImage)}
            alt=""
            fill
            loading="lazy"
            quality={80}
            className="object-cover object-[52%_50%] sm:object-[54%_50%] md:object-[50%_52%]"
            sizes={FULL_BLEED_IMAGE_SIZES}
          />
        </m.div>
        <div
          className={
            isOcean
              ? 'absolute inset-0 bg-linear-to-b from-black/30 via-black/32 to-black/42'
              : 'absolute inset-0 bg-linear-to-b from-black/24 via-black/20 to-black/36'
          }
        />

        <m.div
          variants={revealContainer}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="relative z-10 mx-auto flex max-w-7xl items-center px-3 py-12 sm:px-4 sm:py-14 md:py-16 lg:h-full lg:px-6 lg:py-0 xl:px-8 2xl:max-w-screen-2xl 2xl:px-12"
        >
          <div className="grid w-full items-start gap-10 sm:gap-12 md:grid-cols-2 md:items-center md:gap-[8vw] xl:gap-[10vw]">
            <StoryBlock
              title={content.leftTitle}
              description={content.leftDescription}
              variant={revealItem}
              prefersReducedMotion={!!prefersReducedMotion}
              className="md:justify-self-start"
            />
            <StoryBlock
              title={content.rightTitle}
              description={content.rightDescription}
              variant={revealItem}
              prefersReducedMotion={!!prefersReducedMotion}
              className="md:justify-self-end"
            />
          </div>
        </m.div>
      </LazyMotion>
    </section>
  );
}

function StoryBlock({
  title,
  description,
  variant,
  prefersReducedMotion,
  className = '',
}: {
  title: string;
  description: string;
  variant: Variants;
  prefersReducedMotion: boolean;
  className?: string;
}) {
  const hoverLift = prefersReducedMotion
    ? undefined
    : { y: -8, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } };

  return (
    <m.div
      variants={variant}
      whileHover={hoverLift}
      className={`w-full max-w-[520px] cursor-default text-left ${className}`}
    >
      <h2 className="font-jost-bold text-[clamp(1.05rem,1.42vw,1.55rem)] leading-tight tracking-[0.08em] text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)] transition-all duration-300 hover:tracking-[0.14em]">
        {title}
      </h2>
      <p className="mt-4 text-[clamp(0.86rem,1.02vw,1.08rem)] leading-relaxed text-pretty whitespace-pre-line text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)] transition-colors duration-300 hover:text-white">
        {description}
      </p>
    </m.div>
  );
}

export function SplitStorySectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative animate-pulse overflow-hidden bg-[#070b08] lg:h-[clamp(560px,46vw,760px)] lg:min-h-[560px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-b from-black/28 via-black/34 to-black/42" />
      <div className="relative z-10 mx-auto flex max-w-none items-center px-[6vw] py-12 sm:px-[6.5vw] sm:py-14 md:py-16 lg:h-full lg:px-[7vw] lg:py-0 2xl:px-[8vw]">
        <div className="grid w-full items-start gap-10 sm:gap-12 md:grid-cols-2 md:items-center md:gap-[8vw] xl:gap-[10vw]">
          {[0, 1].map((item) => (
            <div
              key={item}
              className={`w-full max-w-[520px] ${item === 0 ? 'md:justify-self-start' : 'md:justify-self-end'}`}
            >
              <div className="h-6 w-52 rounded bg-white/25" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded bg-white/15" />
                <div className="h-4 w-5/6 rounded bg-white/15" />
                <div className="h-4 w-3/4 rounded bg-white/15" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
