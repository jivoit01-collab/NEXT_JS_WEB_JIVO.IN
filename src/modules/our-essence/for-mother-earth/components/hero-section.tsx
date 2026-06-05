'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { containerSlow, fadeUpSlow, reducedMotion } from '@/lib/animation-variants';
import { defaultHeroContent, fallbackImage } from '../data/defaults';
import type { ForMotherEarthHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzI5MzgyZCIvPjwvc3ZnPg==';
const HERO_IMAGE_SIZES = '(max-width: 768px) 130vw, (max-width: 1536px) 100vw, 1920px';

interface MotherEarthHeroSectionProps {
  data?: ForMotherEarthHeroContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function MotherEarthHeroSection({ data }: MotherEarthHeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealContainer = prefersReducedMotion ? reducedMotion : containerSlow;
  const revealItem = prefersReducedMotion ? reducedMotion : fadeUpSlow;
  const { title, quote, quoteAuthor, description, image } = data ?? defaultHeroContent;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#1c261f]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        quality={90}
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        className="object-cover object-bottom motion-safe:animate-[socialHeroZoom_16s_ease-out_forwards]"
        sizes={HERO_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/16 via-black/5 to-black/24" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,rgba(255,246,205,0.3),transparent_30%),radial-gradient(circle_at_24%_22%,rgba(143,217,232,0.2),transparent_28%),radial-gradient(circle_at_76%_20%,rgba(144,202,228,0.18),transparent_30%)]" />

      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl items-start justify-center px-5 pt-[clamp(6.5rem,15vh,9.25rem)] pb-16 text-center sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20"
      >
        <div className="mx-auto w-full max-w-[920px] text-white 2xl:max-w-[1100px]">
          <motion.h1
            variants={revealItem}
            className="font-jost-medium text-[clamp(2rem,4.05vw,5rem)] leading-[1.04] text-balance uppercase drop-shadow-[0_4px_18px_rgba(0,0,0,0.3)]"
          >
            {title}
          </motion.h1>
          <motion.div
            variants={revealItem}
            className="mx-auto mt-5 max-w-[780px] text-[clamp(0.72rem,1.02vw,1.05rem)] leading-relaxed text-white/90 2xl:max-w-[880px]"
          >
            <p className="font-jost-medium tracking-[0.08em] italic">{quote}</p>
            <p className="font-jost-medium mt-1">- {quoteAuthor}</p>
          </motion.div>
          <motion.p
            variants={revealItem}
            className="mx-auto mt-6 max-w-[780px] text-[clamp(0.86rem,1.12vw,1.25rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.32)] 2xl:max-w-[920px]"
          >
            {description}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

export function MotherEarthHeroSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-screen animate-pulse overflow-hidden bg-[#1c261f]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,rgba(255,246,205,0.22),transparent_30%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-start justify-center px-5 pt-[clamp(6.5rem,15vh,9.25rem)] pb-16 text-center sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="mx-auto w-full max-w-[920px] 2xl:max-w-[1100px]">
          <div className="mx-auto h-20 w-full max-w-3xl rounded bg-white/25 sm:h-28 2xl:h-36" />
          <div className="mx-auto mt-5 h-4 w-2/3 rounded bg-white/18" />
          <div className="mx-auto mt-2 h-4 w-36 rounded bg-white/18" />
          <div className="mx-auto mt-6 max-w-[780px] space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="mx-auto h-4 w-11/12 rounded bg-white/14" />
            <div className="mx-auto h-4 w-4/5 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
