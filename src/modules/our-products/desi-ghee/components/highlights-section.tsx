'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { DesiGheeHighlightsContent } from '../types';
import { defaultHighlightsContent } from '../data/defaults';
import { GHEE_FOREST_BLACK } from '../constants';

interface Props {
  data?: DesiGheeHighlightsContent;
}

/**
 * Section 3 — "KEY HIGHLIGHTS".
 *
 * ONE banner: the artwork is a full-bleed BACKGROUND (absolute, decorative)
 * and the copy sits ON TOP of it, vertically centred on the left. The band
 * height is fluid (clamp) so the whole thing scales as a single unit — small
 * on phones, larger on desktop, same proportions everywhere.
 *
 * Absolute is correct here per responsive.md §6: the image is pure decoration,
 * and the copy stays in normal flow inside the padded container.
 */
export function HighlightsSection({ data }: Props) {
  const { heading, highlights, backgroundImage } = data ?? defaultHighlightsContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;

  return (
    <section
      aria-labelledby="desi-ghee-highlights-heading"
      className="relative flex h-[48.6vw] min-h-[22rem] max-h-[92vh] w-full items-start overflow-hidden"
    >
      {/* ── Background artwork (decorative, absolute) ────────────── */}
      <SafeImage
        src={backgroundImage}
        alt=""
        aria-hidden
        fill
        quality={85}
        sizes="100vw"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center"
      />

      {/* ── Copy, on top of the art. A scrim keeps the text readable
          on small screens where the pale left area is cropped. ── */}
      <div className="relative z-10 w-full  px-4 py-10 sm:px-6 sm:py-12 md:py-14 lg:bg-none lg:px-8 lg:py-16 2xl:py-20">
        <motion.div
          variants={prefersReduced ? reducedMotion : container}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="w-full max-w-6xl 2xl:max-w-7xl"
        >
          {/* Copy holds the left ~48%, clearing the jar on the right. */}
          <div className="w-full pl-0 max-w-[66ch] sm:w-[70%] sm:pl-10 lg:w-[56%] xl:w-[50%]">
            <motion.h2
              id="desi-ghee-highlights-heading"
              variants={item}
              className="text-balance font-jost-extrabold text-[clamp(1.75rem,1.2rem+1.9vw,3.25rem)] leading-[1.12] tracking-[0.06em] uppercase"
              style={{ color: GHEE_FOREST_BLACK }}
            >
              {heading}
            </motion.h2>

            <motion.ul variants={item} className="mt-4 space-y-2 lg:mt-6 lg:space-y-2.5">
              {highlights.map((highlight, i) => (
                <li
                  key={`${highlight.label}-${i}`}
                  className="flex min-w-0 items-start gap-2.5 text-pretty font-jost-light text-[clamp(1.05rem,0.95rem+0.42vw,1.5rem)] leading-[1.6]"
                  style={{ color: GHEE_FOREST_BLACK }}
                >
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: GHEE_FOREST_BLACK }}
                  />
                  <span className="min-w-0">
                    <strong className="font-jost-extrabold">{highlight.label}</strong>{' '}
                    {highlight.description}
                  </span>
                </li>
              ))}
            </motion.ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function HighlightsSectionSkeleton() {
  return (
    <section
      className="relative flex h-[48.6vw] min-h-[22rem] max-h-[92vh] w-full animate-pulse items-center overflow-hidden"
      style={{ backgroundColor: '#DCEBC8' }}
    >
      <div className="relative z-10 w-full px-4 py-10 sm:px-6 sm:py-12 md:py-14 lg:px-8 lg:py-16 2xl:py-20">
        <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">
          <div className="w-full pl-0 max-w-[56ch] sm:w-[70%] sm:pl-10 lg:w-[56%] xl:w-[50%]">
            <div className="h-8 w-56 rounded-md bg-black/10 sm:h-10 lg:h-12" />
            <div className="mt-5 space-y-2.5 lg:mt-7">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-black/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
