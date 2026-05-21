'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { container, defaultViewport, fadeUp, reducedMotion } from '@/lib/animation-variants';
import { fallbackImage } from '../data/defaults';
import type { SocialInitiativesSplitContent } from '../types';

interface SplitStorySectionProps {
  data?: SocialInitiativesSplitContent;
  fallbackData: SocialInitiativesSplitContent;
  tone?: 'forest' | 'ocean';
}

const FULL_BLEED_IMAGE_SIZES = '(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1920px';

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function SplitStorySection({ data, fallbackData, tone = 'forest' }: SplitStorySectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : container;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUp;
  const content = data ?? fallbackData;
  const isOcean = tone === 'ocean';

  return (
    <section
      className="relative min-h-[620px] overflow-hidden bg-[#070b08] sm:min-h-[580px] md:min-h-[540px] lg:h-[clamp(560px,46vw,720px)] lg:min-h-[560px]"
      style={{ contentVisibility: 'auto', contain: 'layout paint' }}
    >
      <SafeImage
        src={imageWithFallback(content.backgroundImage)}
        alt=""
        fill
        loading="lazy"
        quality={100}
        className="object-cover object-center"
        sizes={FULL_BLEED_IMAGE_SIZES}
      />
      <div
        className={
          isOcean
            ? 'absolute inset-0 bg-linear-to-b from-black/30 via-black/32 to-black/42'
            : 'absolute inset-0 bg-linear-to-b from-black/24 via-black/20 to-black/36'
        }
      />

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto flex min-h-[620px] max-w-none items-center px-[6vw] py-18 sm:min-h-[580px] sm:px-[6.5vw] sm:py-20 md:min-h-[540px] lg:h-full lg:min-h-0 lg:px-[7vw] lg:py-0 2xl:px-[8vw]"
      >
        <div className="grid w-full items-start gap-10 sm:gap-12 md:grid-cols-2 md:items-center md:gap-[8vw] xl:gap-[10vw]">
          <StoryBlock
            title={content.leftTitle}
            description={content.leftDescription}
            variant={revealItem}
            className="md:justify-self-start"
          />
          <StoryBlock
            title={content.rightTitle}
            description={content.rightDescription}
            variant={revealItem}
            className="md:justify-self-end"
          />
        </div>
      </motion.div>
    </section>
  );
}

function StoryBlock({
  title,
  description,
  variant,
  className = '',
}: {
  title: string;
  description: string;
  variant: Variants;
  className?: string;
}) {
  return (
    <motion.div variants={variant} className={`w-full max-w-[520px] text-left ${className}`}>
      <h2 className="font-jost-bold text-[clamp(1.05rem,1.42vw,1.55rem)] leading-tight tracking-[0.08em] text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)]">
        {title}
      </h2>
      <p className="mt-4 text-[clamp(0.86rem,1.02vw,1.08rem)] leading-relaxed text-pretty whitespace-pre-line text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)]">
        {description}
      </p>
    </motion.div>
  );
}

export function SplitStorySectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[620px] animate-pulse overflow-hidden bg-[#070b08] sm:min-h-[580px] md:min-h-[540px] lg:h-[clamp(560px,46vw,720px)] lg:min-h-[560px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-b from-black/28 via-black/34 to-black/42" />
      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-none items-center px-[6vw] py-18 sm:min-h-[580px] sm:px-[6.5vw] sm:py-20 md:min-h-[540px] lg:h-full lg:min-h-0 lg:px-[7vw] lg:py-0 2xl:px-[8vw]">
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
