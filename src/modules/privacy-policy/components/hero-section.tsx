'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { isPlaceholderValue } from '@/components/shared/safe-image';
import { fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { PrivacyHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';

interface Props {
  data?: PrivacyHeroContent;
}

/**
 * Section 1 — Privacy Policy hero.
 *
 * Centered JIVO wordmark on top, then the PRIVACY POLICY heading + intro on the
 * LEFT with the illustration on the RIGHT. The whole PAGE is one maroon field
 * (set on the page wrapper), so this section is transparent — no own bg.
 */
export function PrivacyHero({ data }: Props) {
  const { logoImage, heading, intro, image } = data ?? defaultHeroContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;

  return (
    <section
      aria-labelledby="privacy-hero-heading"
      className="relative w-full overflow-hidden px-4 pt-24 pb-10 sm:px-6 sm:pt-28 lg:px-[6%] lg:pt-32 lg:pb-16"
    >
      {/* Centered wordmark */}
      <div className="mx-auto mb-10 w-[52vw] max-w-[420px] min-w-[170px] sm:mb-14 lg:mb-16">
        {isPlaceholderValue(logoImage) ? (
          <span className="block text-center font-jost-extrabold text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-tight text-white">
            JIVO
          </span>
        ) : (
          <SafeImage
            src={logoImage}
            alt="Jivo"
            width={860}
            height={330}
            priority
            fetchPriority="high"
            quality={90}
            sizes="(max-width: 640px) 52vw, 420px"
            className="mx-auto h-auto w-full object-contain"
          />
        )}
      </div>

      {/* Heading + intro (left) · illustration (right) */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10 2xl:max-w-7xl">
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="order-2 lg:order-1"
        >
          <h1
            id="privacy-hero-heading"
            className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.2rem+2.4vw,3.5rem)] leading-[1.05] tracking-[0.04em] text-white uppercase"
          >
            {heading}
          </h1>
          <p className="mt-4 max-w-[46ch] text-pretty font-jost-light text-[clamp(0.95rem,0.86rem+0.4vw,1.25rem)] leading-[1.7] text-white/85 lg:mt-6">
            {intro}
          </p>
        </motion.div>

        <motion.div
          variants={prefersReduced ? reducedMotion : { hidden: { opacity: 0, x: 60 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="pointer-events-none order-1 mx-auto w-[70vw] max-w-md lg:order-2 lg:ml-auto lg:mr-0 lg:w-full"
        >
          <SafeImage
            src={image}
            alt=""
            aria-hidden
            width={900}
            height={700}
            quality={85}
            sizes="(max-width: 1024px) 70vw, 44vw"
            className="h-auto w-full object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}

export function PrivacyHeroSkeleton() {
  return (
    <section className="w-full animate-pulse px-4 pt-24 pb-10 sm:px-6 lg:px-[6%] lg:pt-32">
      <div className="mx-auto mb-14 h-14 w-64 rounded-md bg-white/15" />
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="h-10 w-56 rounded-md bg-white/15" />
          <div className="mt-6 space-y-2.5">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-4/5 rounded bg-white/10" />
          </div>
        </div>
        <div className="mx-auto aspect-[9/7] w-[70vw] max-w-md rounded-lg bg-white/10 lg:w-full" />
      </div>
    </section>
  );
}
