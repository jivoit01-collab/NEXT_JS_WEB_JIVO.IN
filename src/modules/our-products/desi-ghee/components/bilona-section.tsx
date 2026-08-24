'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { DesiGheeBilonaContent } from '../types';
import { defaultBilonaContent } from '../data/defaults';
import { GHEE_FOREST } from '../constants';

interface Props {
  data?: DesiGheeBilonaContent;
}

/**
 * Section 4 — "THE ART OF BILONA CHURNING".
 *
 * Same construction as Key Highlights: the village artwork is a full-bleed
 * BACKGROUND and the copy sits ON TOP of it, vertically centred on the left,
 * in one fluid-height banner that scales as a single unit.
 */
export function BilonaSection({ data }: Props) {
  const { heading, paragraph, backgroundImage } = data ?? defaultBilonaContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;

  // Blank lines separate paragraphs, so editors control the rhythm from the
  // admin textarea without needing markup.
  const paragraphs = paragraph.split(/\n\s*\n/).filter(Boolean);

  return (
    <section
      aria-labelledby="desi-ghee-bilona-heading"
      className="relative flex h-[56.6vw] min-h-[22rem] max-h-[92vh] w-full items-start overflow-hidden"
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

      {/* ── Copy, on top of the art. ── */}
      <div className="relative z-10 w-full  px-4 py-10 sm:px-6 sm:py-12 md:py-14 lg:bg-none lg:px-8 lg:py-16 2xl:py-20">
        <motion.div
          variants={prefersReduced ? reducedMotion : container}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="w-full max-w-6xl "
        >
          {/* Copy holds the left ~52%, clearing the churning pot on the right. */}
          <div className="w-full pl-0 sm:pl-10 ">
            <motion.h2
              id="desi-ghee-bilona-heading"
              variants={item}
              className="text-balance font-jost-extrabold text-[clamp(1.6rem,1.1rem+1.9vw,3.25rem)] leading-[1.1] tracking-[0.05em] uppercase"
              style={{ color: GHEE_FOREST }}
            >
              {heading}
            </motion.h2>

            <motion.div variants={item} className="mt-5 w-[80%] space-y-3 lg:mt-7">
              {paragraphs.map((text, i) => (
                <p
                  key={i}
                  className="text-pretty font-jost-light text-[clamp(1.05rem,0.95rem+0.42vw,1.5rem)] leading-[1.6]"
                  style={{ color: GHEE_FOREST }}
                >
                  {text}
                </p>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function BilonaSectionSkeleton() {
  return (
    <section
      className="relative flex h-[56.6vw] min-h-[22rem] max-h-[92vh] w-full animate-pulse items-center overflow-hidden"
      style={{ backgroundColor: '#DCEBC8' }}
    >
      <div className="relative z-10 w-full px-4 py-10 sm:px-6 sm:py-12 md:py-14 lg:px-8 lg:py-16 2xl:py-20">
        <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">
          <div className="w-full max-w-[48ch] sm:w-[68%] lg:w-[46%]">
            <div className="h-8 w-72 rounded-md bg-black/10 sm:h-10 lg:h-12" />
            <div className="mt-5 space-y-3 lg:mt-7">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-black/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
