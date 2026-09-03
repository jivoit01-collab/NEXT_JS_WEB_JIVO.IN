'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';

/** Heading/paragraph reveal — rises and settles with a soft ease. */
const textReveal = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Artwork throw-in — enters from off the right edge and settles with a spring,
 * mirroring the range cards' throw from the left.
 */
const artReveal = {
  hidden: { opacity: 0, x: 140, rotate: 3 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 70, damping: 18, mass: 1 },
  },
};

interface Props {
  /** Anchors `aria-labelledby` — must be unique per section on the page. */
  headingId: string;
  heading: string;
  paragraph: string;
  /** Decorative artwork bleeding off the section's right edge. */
  image: string;
  /** Section background. */
  backgroundColor: string;
  /** Heading colour. */
  headingColor: string;
  /** Body copy colour. */
  bodyColor: string;
  /**
   * How far down the artwork sits. The wellness section's blades hang from the
   * middle; the difference section's bottle runs to the bottom edge.
   */
  artPosition?: 'center' | 'bottom';
}

/**
 * Shared layout for sections 3 and 4 — "MORE THAN A JUICE" and "A DIFFERENCE
 * YOU CAN SEE AND TASTE".
 *
 * Both are LEFT-ALIGNED copy with a decorative image bleeding off the right
 * edge, differing only in palette, artwork and copy. The artwork is decorative
 * (`aria-hidden`, outside the copy flow), which responsive.md §6 permits;
 * primary content stays in normal flow and reflows on its own.
 */
export function CopyWithArtSection({
  headingId,
  heading,
  paragraph,
  image,
  backgroundColor,
  headingColor,
  bodyColor,
  artPosition = 'center',
}: Props) {
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const art = prefersReduced ? reducedMotion : artReveal;

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex w-full min-h-[40dvh] items-start overflow-hidden px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:min-h-[75dvh] lg:px-[5%] lg:py-24 2xl:px-[7%] 2xl:py-28"
      style={{ backgroundColor }}
    >
      {/* Decorative artwork — bleeds off the right edge, behind the copy.
          On phones it drops to a low-opacity backdrop so the text stays
          readable without needing a scrim. */}
      <motion.div
        aria-hidden
        variants={art}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className={`pointer-events-none absolute right-0 z-0 w-[78vw] max-w-[34rem] opacity-25 sm:w-[62vw] sm:opacity-60 lg:w-[52vw] lg:max-w-[46rem] lg:opacity-100 2xl:max-w-[54rem] ${
          artPosition === 'bottom' ? 'bottom-0' : 'top-1/2 -translate-y-1/2'
        }`}
      >
        {/* SafeImage resolves empty/unknown values to the upload placeholder. */}
        <SafeImage
          src={image}
          alt=""
          width={1100}
          height={900}
          quality={85}
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 62vw, 52vw"
          className={`h-auto w-full object-contain ${
            artPosition === 'bottom' ? 'object-right-bottom' : 'object-right'
          }`}
        />
      </motion.div>

      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto w-full max-w-400"
      >
        {/* Left-aligned copy column, capped so it clears the artwork. */}
        <div className="min-w-0 max-w-[72ch] lg:max-w-[88%]">
          <motion.h2
            id={headingId}
            variants={item}
            className="font-jost-extrabold text-balance text-[clamp(1.5rem,1.05rem+2.2vw,3rem)] leading-[1.1] tracking-[0.04em] uppercase"
            style={{ color: headingColor }}
          >
            {heading}
          </motion.h2>

          {/* whitespace-pre-line preserves the admin's line breaks (Enter) —
              without it, `\n` collapses to a single space. */}
          <motion.p
            variants={item}
            className="mt-6 lg:max-w-[70%] bg-amber-200 text-pretty whitespace-pre-line font-jost-light text-[clamp(0.95rem,0.88rem+0.3vw,1.15rem)] leading-[1.75] lg:mt-25"            style={{ color: bodyColor }}
          >
            {paragraph}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

export function CopyWithArtSectionSkeleton({ backgroundColor }: { backgroundColor: string }) {
  return (
    <section
      className="flex w-full min-h-[70dvh] animate-pulse items-center px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:min-h-dvh lg:px-[7%] lg:py-24 2xl:px-[9%] 2xl:py-28"
      style={{ backgroundColor }}
    >
      <div className="mx-auto w-full max-w-400">
        <div className="max-w-[62ch] lg:max-w-[58%]">
          <div className="h-9 w-72 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-[32rem]" />
          <div className="mt-6 space-y-2.5 lg:mt-8">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-11/12 rounded bg-white/10" />
            <div className="h-4 w-10/12 rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
