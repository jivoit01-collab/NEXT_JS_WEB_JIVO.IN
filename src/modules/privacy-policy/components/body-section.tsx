'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { PrivacyBodyContent } from '../types';
import { defaultBodyContent } from '../data/defaults';

interface Props {
  data?: PrivacyBodyContent;
}

/**
 * Section 2 — Privacy Policy body.
 *
 * A flow of heading + paragraph blocks laid out in TWO columns on lg+ (a single
 * column on mobile). CSS multi-column gives the masonry-style flow in the
 * design without fragile manual splitting; `break-inside-avoid` keeps a block's
 * heading and body together. The page maroon shows through — no own bg.
 */
export function PrivacyBody({ data }: Props) {
  const { blocks } = data ?? defaultBodyContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;

  return (
    <section
      aria-label="Privacy policy details"
      className="w-full px-4 pb-16 sm:px-6 sm:pb-20 lg:px-[6%] lg:pb-28"
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto w-full max-w-6xl gap-x-12 lg:columns-2 2xl:max-w-7xl 2xl:gap-x-16"
      >
        {blocks.map((block, i) => {
          const paragraphs = block.body.split(/\n\s*\n/).filter(Boolean);
          return (
            <motion.div
              key={i}
              variants={item}
              className="mb-8 break-inside-avoid lg:mb-10"
            >
              {block.heading ? (
                <h2 className="mb-3 font-jost-extrabold text-[clamp(1.15rem,0.95rem+0.9vw,1.75rem)] leading-[1.15] tracking-[0.04em] text-white uppercase lg:mb-4">
                  {block.heading}
                </h2>
              ) : null}
              <div className="space-y-3 lg:space-y-4">
                {paragraphs.map((text, j) => (
                  <p
                    key={j}
                    className="text-pretty font-jost-light text-[clamp(0.9rem,0.82rem+0.32vw,1.05rem)] leading-[1.75] text-white/80"
                  >
                    {text}
                  </p>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

export function PrivacyBodySkeleton() {
  return (
    <section className="w-full animate-pulse px-4 pb-16 sm:px-6 lg:px-[6%] lg:pb-28">
      <div className="mx-auto w-full max-w-6xl gap-x-12 lg:columns-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mb-10 break-inside-avoid">
            <div className="mb-4 h-6 w-48 rounded-md bg-white/15" />
            <div className="space-y-2.5">
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-4 w-11/12 rounded bg-white/10" />
              <div className="h-4 w-3/4 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
