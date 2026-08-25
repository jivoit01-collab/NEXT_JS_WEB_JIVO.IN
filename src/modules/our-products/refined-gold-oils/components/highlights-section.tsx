'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { RefinedGoldOilsHighlightsContent } from '../types';
import { defaultHighlightsContent } from '../data/defaults';
import { GOLD_BRIGHT, GOLD_MAROON } from '../constants';

interface Props {
  data?: RefinedGoldOilsHighlightsContent;
}

const textReveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const imageReveal = {
  hidden: { opacity: 0, x: 160, scale: 0.94 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 70, damping: 18, mass: 1 },
  },
};

/**
 * Section 3 — "KEY HIGHLIGHTS" + "BENEFITS".
 *
 * Two bullet groups on the left, heart-splash artwork on the right, on a solid
 * bright-gold field. Normal grid (responsive.md §6): the columns stack on
 * mobile, art below the copy.
 */
export function HighlightsSection({ data }: Props) {
  const { heading, highlights, benefitsHeading, benefits, image } =
    data ?? defaultHighlightsContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const art = prefersReduced ? reducedMotion : imageReveal;

  return (
    <section
      aria-labelledby="refined-gold-highlights-heading"
      className="relative w-full overflow-hidden px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-14 md:pb-16 lg:flex lg:items-center lg:px-[6%] lg:py-20 2xl:py-24"
      style={{ backgroundColor: GOLD_BRIGHT }}
    >
      {/* ── Artwork — heart splash, right side (below copy on mobile). ── */}
      <motion.div
        variants={art}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="pointer-events-none relative z-0 order-2 mx-auto mt-8 w-[70vw] max-w-80 sm:w-[56vw] sm:max-w-96 md:w-[46vw] lg:absolute lg:top-1/2 lg:right-[3%] lg:mt-0 lg:w-[38vw] lg:max-w-none lg:-translate-y-1/2"
      >
        <SafeImage
          src={image}
          alt=""
          width={900}
          height={900}
          quality={85}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 46vw, 38vw"
          className="h-auto w-full object-contain"
        />
      </motion.div>

      {/* ── Copy: two groups. ── */}
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 order-1 w-full"
      >
        <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">
          <div className="w-full lg:w-[56%]">
            {/* KEY HIGHLIGHTS */}
            <motion.h2
              id="refined-gold-highlights-heading"
              variants={item}
              className="font-jost-extrabold text-balance text-[clamp(1.6rem,1.1rem+2vw,3.25rem)] leading-[1.1] tracking-[0.06em] uppercase"
              style={{ color: GOLD_MAROON }}
            >
              {heading}
            </motion.h2>
            <motion.ul variants={item} className="mt-4 space-y-2 lg:mt-6 lg:space-y-2.5">
              {highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex min-w-0 items-start gap-2.5 text-pretty font-jost-light text-[clamp(0.95rem,0.86rem+0.38vw,1.2rem)] leading-[1.6]"
                  style={{ color: GOLD_MAROON }}
                >
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: GOLD_MAROON }}
                  />
                  <span className="min-w-0">{h}</span>
                </li>
              ))}
            </motion.ul>

            {/* BENEFITS */}
            {benefitsHeading ? (
              <motion.h3
                variants={item}
                className="mt-10 font-jost-extrabold text-[clamp(1.35rem,1rem+1.5vw,2.5rem)] leading-[1.1] tracking-[0.06em] uppercase lg:mt-12"
                style={{ color: GOLD_MAROON }}
              >
                {benefitsHeading}
              </motion.h3>
            ) : null}
            {benefits.length > 0 ? (
              <motion.ul variants={item} className="mt-4 space-y-2 lg:mt-5 lg:space-y-2.5">
                {benefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex min-w-0 items-start gap-2.5 text-pretty font-jost-light text-[clamp(0.95rem,0.86rem+0.38vw,1.2rem)] leading-[1.6]"
                    style={{ color: GOLD_MAROON }}
                  >
                    <span
                      aria-hidden
                      className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: GOLD_MAROON }}
                    />
                    <span className="min-w-0">{b}</span>
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function HighlightsSectionSkeleton() {
  return (
    <section
      className="relative w-full animate-pulse overflow-hidden px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-14 md:pb-16 lg:flex lg:items-center lg:px-[6%] lg:py-20 2xl:py-24"
      style={{ backgroundColor: GOLD_BRIGHT }}
    >
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">
        <div className="w-full lg:w-[56%]">
          <div className="h-9 w-64 rounded-md bg-black/10 sm:h-11 lg:h-14" />
          <div className="mt-4 space-y-2.5 lg:mt-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-full rounded bg-black/10" />
            ))}
          </div>
          <div className="mt-10 h-8 w-40 rounded-md bg-black/10 sm:h-10 lg:mt-12" />
          <div className="mt-4 space-y-2.5 lg:mt-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 w-full rounded bg-black/10" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
