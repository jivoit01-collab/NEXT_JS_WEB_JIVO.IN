'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { containerSlow, fadeUpSlow, reducedMotion } from '@/lib/animation-variants';
import { fallbackImage, defaultHeroContent } from '../data/defaults';
import type { SocialInitiativesHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzA2MGIwOCIvPjwvc3ZnPg==';
const HERO_IMAGE_SIZES = '100vw';

interface SocialInitiativesHeroProps {
  data?: SocialInitiativesHeroContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function SocialInitiativesHero({ data }: SocialInitiativesHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : containerSlow;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;

  const {
    title,
    subtitle,
    image,
    alignmentTitle,
    alignmentDescription,
    goalTitle,
    goalDescription,
  } = data ?? defaultHeroContent;

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <SafeImage
          src={imageWithFallback(image)}
          alt=""
          fill
          priority
          quality={90}
          fetchPriority="high"
          placeholder="blur"
          blurDataURL={HERO_BLUR}
          className="object-cover object-center"
          sizes={HERO_IMAGE_SIZES}
        />
      </div>

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.22 }}
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1500px] flex-col px-5 pt-28 pb-10 text-center sm:px-6 sm:pt-32 sm:pb-12 md:px-8 lg:px-[6vw] lg:pt-28 lg:pb-[clamp(3.5rem,7vh,6.5rem)] 2xl:px-[5vw]"
      >
        <div className="flex min-h-[42svh] flex-1 items-center justify-center lg:min-h-0 lg:justify-end lg:pb-[clamp(1.5rem,5vh,4.5rem)]">
          <motion.div
            variants={revealItem}
            className={`w-full max-w-[620px] px-5 py-6 text-white sm:px-7 sm:py-7 lg:max-w-[640px] lg:px-8 lg:py-8 2xl:max-w-[700px]`}
          >
            <h1 className="font-jost-extrabold text-[clamp(2.15rem,3.25vw,4.4rem)] leading-[1.02] text-balance text-white uppercase drop-shadow-[0_3px_16px_rgba(0,0,0,0.4)]">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-[500px] text-[clamp(0.92rem,1.04vw,1.24rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.42)] 2xl:max-w-[560px]">
              {subtitle}
            </p>
          </motion.div>
        </div>

        <div className="mx-auto grid w-full max-w-[1120px] items-stretch gap-5 sm:gap-6 md:grid-cols-2 lg:max-w-[1180px] lg:gap-8 2xl:max-w-[1260px]">
          <HeroStoryBlock
            title={alignmentTitle}
            description={alignmentDescription}
            variant={revealItem}
          />
          <HeroStoryBlock title={goalTitle} description={goalDescription} variant={revealItem} />
        </div>
      </motion.div>
    </section>
  );
}

function HeroStoryBlock({
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
    <motion.div
      variants={variant}
      className={`mx-auto flex h-full w-full max-w-[520px] flex-col items-center justify-center px-5 py-5 text-center sm:px-6 sm:py-6 md:max-w-none lg:min-h-[160px] lg:px-7 lg:py-7 ${className}`}
    >
      <h2 className="font-jost-bold text-[clamp(0.96rem,1.18vw,1.35rem)] leading-tight tracking-[0.1em] text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-[390px] text-[clamp(0.82rem,0.94vw,1rem)] leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)] lg:max-w-[420px]">
        {description}
      </p>
    </motion.div>
  );
}

export function SocialInitiativesHeroSkeleton() {
  return (
    <section
      aria-hidden
      className="relative flex min-h-screen animate-pulse items-center overflow-hidden bg-[#060b08]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-black/34" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 pt-28 pb-10 sm:px-6 sm:pt-32 sm:pb-12 md:px-8 lg:px-[6vw] lg:pt-28 lg:pb-[clamp(3.5rem,7vh,6.5rem)] 2xl:px-[5vw]">
        <div className="flex min-h-[42svh] flex-1 items-center justify-center lg:min-h-0 lg:justify-end lg:pb-[clamp(1.5rem,5vh,4.5rem)]">
          <div className="w-full max-w-[620px] rounded-lg border border-white/12 bg-white/10 px-5 py-6 sm:px-7 sm:py-7 lg:max-w-[640px] lg:px-8 lg:py-8">
            <div className="mx-auto h-10 w-4/5 rounded bg-white/25 sm:h-14 lg:h-16" />
            <div className="mx-auto mt-4 h-5 w-3/4 rounded bg-white/18" />
          </div>
        </div>
        <div className="mx-auto grid w-full max-w-[1120px] items-stretch gap-5 sm:gap-6 md:grid-cols-2 lg:max-w-[1180px] lg:gap-8 2xl:max-w-[1260px]">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="mx-auto flex h-full w-full max-w-[520px] flex-col items-center justify-center rounded-lg border border-white/12 bg-white/10 px-5 py-5 text-center sm:px-6 sm:py-6 md:max-w-none lg:min-h-[160px] lg:px-7 lg:py-7"
            >
              <div className="mx-auto h-5 w-56 rounded bg-white/22" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-white/14" />
                <div className="mx-auto h-4 w-5/6 rounded bg-white/14" />
                <div className="mx-auto h-4 w-2/3 rounded bg-white/14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
