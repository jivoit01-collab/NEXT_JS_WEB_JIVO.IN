'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { isPlaceholderValue } from '@/components/shared/safe-image';
import { reducedMotion, defaultViewport } from '@/lib/animation-variants';
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

  return (
    <section
      aria-labelledby="privacy-hero-heading"
      // Padding matches the NAVBAR container (px-6 sm:px-8 lg:px-18) so the
      // heading's left edge lines up with the navbar logo, and the right column
      // lines up with the last nav link.
      // Half the viewport on small screens (the tall JIVO logo + heading fit
      // comfortably there); full height from lg up where the two columns sit
      // side by side.
      className="relative flex min-h-[58dvh] w-full flex-col justify-center overflow-hidden px-6 pt-24 pb-10 sm:min-h-[64dvh] sm:px-8 sm:pt-28 lg:min-h-dvh lg:px-18 lg:pb-16"
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

      {/* Heading + intro (left) · illustration (right). max-w-8xl matches the
          navbar, so the columns align with the logo and last nav link. */}
      <div className="mx-auto grid w-full max-w-8xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10">
        <motion.div
          variants={
            prefersReduced
              ? reducedMotion
              : {
                  hidden: { opacity: 0, x: -60 },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                  },
                }
          }
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="order-2 lg:order-1"
        >
          <h1
            id="privacy-hero-heading"
            className="font-jost-extrabold text-[clamp(2rem,1.3rem+3vw,4.5rem)] leading-[1.05] tracking-[0.04em] text-white uppercase lg:whitespace-nowrap"
          >
            {heading}
          </h1>
          <p className="mt-5 max-w-[48ch] text-pretty font-jost-light text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.7] text-white/85 lg:mt-7">
            {intro}
          </p>
        </motion.div>

        <motion.div
          variants={prefersReduced ? reducedMotion : { hidden: { opacity: 0, x: 60 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="pointer-events-none order-1 mx-auto flex w-[80vw] max-w-lg justify-center lg:order-2 lg:ml-auto lg:mr-0 lg:w-full lg:max-w-none"
        >
          <SafeImage
            src={image}
            alt=""
            aria-hidden
            width={1100}
            height={860}
            quality={85}
            sizes="(max-width: 1024px) 80vw, 52vw"
            // Cap the image height to the viewport so the tall figure never
            // bleeds off the bottom on desktop; width scales down to match.
            className="h-auto w-full object-contain lg:max-h-[78dvh] lg:w-auto"
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
