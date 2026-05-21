'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/shared';
import { containerSlow, fadeUpSlow, reducedMotion } from '@/lib/animation-variants';
import { fallbackImage, defaultHeroContent } from '../data/defaults';
import type { SocialInitiativesHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzA2MGIwOCIvPjwvc3ZnPg==';
const HERO_IMAGE_SIZES = '(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1920px';

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
    <section className="relative min-h-[100svh] overflow-hidden bg-[#060b08]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        quality={100}
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        className="object-cover object-center motion-safe:animate-[socialHeroZoom_14s_ease-out_forwards]"
        sizes={HERO_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/24 via-black/8 to-black/30" />

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.22 }}
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-5 pt-28 pb-14 text-center sm:px-6 sm:pt-32 sm:pb-16 lg:block lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0"
      >
        <motion.div
          variants={revealItem}
          className="mx-auto w-full max-w-[640px] min-w-0 text-white lg:absolute lg:top-[30%] lg:right-[7.8%] lg:w-[43vw] lg:max-w-[590px] xl:right-[9%] xl:max-w-[650px] 2xl:right-[10%] 2xl:max-w-[760px]"
        >
          <h1 className="font-jost-extrabold text-[clamp(2rem,3.05vw,4.65rem)] leading-[1.02] text-balance text-white uppercase drop-shadow-[0_3px_16px_rgba(0,0,0,0.38)]">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-[clamp(0.9rem,1.12vw,1.35rem)] leading-snug text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)] 2xl:max-w-[620px]">
            {subtitle}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 sm:mt-14 sm:gap-10 md:grid-cols-2 lg:contents">
          <HeroStoryBlock
            title={alignmentTitle}
            description={alignmentDescription}
            variant={revealItem}
            className="lg:absolute lg:bottom-[17.5%] lg:left-[6.5%] lg:w-[35vw] lg:max-w-[440px] xl:left-[7%] 2xl:left-[9%] 2xl:max-w-[520px]"
          />
          <HeroStoryBlock
            title={goalTitle}
            description={goalDescription}
            variant={revealItem}
            className="lg:absolute lg:right-[6.5%] lg:bottom-[17.5%] lg:w-[36vw] lg:max-w-[470px] xl:right-[8%] 2xl:right-[10%] 2xl:max-w-[560px]"
          />
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
      className={`mx-auto w-full max-w-xl text-center md:mx-0 ${className}`}
    >
      <h2 className="font-jost-bold text-[clamp(1rem,1.5vw,1.65rem)] leading-tight tracking-[0.08em] text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)]">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-[540px] text-[clamp(0.82rem,1.04vw,1.08rem)] leading-snug text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)]">
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
      <div className="absolute inset-0 bg-black/26" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 pt-28 pb-14 sm:px-6 sm:pt-32 sm:pb-16 lg:block lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0">
        <div className="mx-auto w-full max-w-[640px] lg:absolute lg:top-[30%] lg:right-[7.8%] lg:w-[43vw] lg:max-w-[590px]">
          <div className="mx-auto h-10 w-4/5 rounded bg-white/25 sm:h-14 lg:h-16" />
          <div className="mx-auto mt-4 h-5 w-3/4 rounded bg-white/18" />
        </div>
        <div className="mt-12 grid gap-8 sm:mt-14 sm:gap-10 md:grid-cols-2 lg:contents">
          {[0, 1].map((item) => (
            <div
              key={item}
              className={
                item === 0
                  ? 'mx-auto w-full max-w-xl text-center md:mx-0 lg:absolute lg:bottom-[17.5%] lg:left-[6.5%] lg:w-[35vw] lg:max-w-[440px]'
                  : 'mx-auto w-full max-w-xl text-center md:mx-0 lg:absolute lg:right-[6.5%] lg:bottom-[17.5%] lg:w-[36vw] lg:max-w-[470px]'
              }
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
