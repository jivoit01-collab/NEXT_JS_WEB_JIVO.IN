'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { PrivacyBlock, PrivacyBodyContent } from '../types';
import { defaultBodyContent } from '../data/defaults';

interface Props {
  data?: PrivacyBodyContent;
}

/** Slide-in from a side, settling with a soft ease. Direction per column. */
const fromLeft = {
  hidden: { opacity: 0, x: -60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};
const fromRight = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

/**
 * Section 2 — Privacy Policy body.
 *
 * A real 2-column GRID on lg+ (single column on mobile). Blocks are split into a
 * left and right column by index, so each heading stays glued to its own
 * paragraphs (the old CSS `columns` fragmented them, splitting a heading from
 * its body). Left-column blocks slide in from the left, right-column blocks from
 * the right, as each scrolls into view. Text sizes mirror the product pages
 * (e.g. mustard) for a consistent scale. The page maroon shows through.
 */
export function PrivacyBody({ data }: Props) {
  const { blocks } = data ?? defaultBodyContent;
  const prefersReduced = useReducedMotion();

  // Split into two balanced columns, preserving order down each side.
  const left: { block: PrivacyBlock; index: number }[] = [];
  const right: { block: PrivacyBlock; index: number }[] = [];
  blocks.forEach((block, index) => {
    (index % 2 === 0 ? left : right).push({ block, index });
  });

  // Render one column of blocks. A plain function (not a nested component) so it
  // isn't re-created each render.
  const renderColumn = (
    items: { block: PrivacyBlock; index: number }[],
    variant: typeof fromLeft,
  ) => (
    <motion.div
      variants={prefersReduced ? reducedMotion : container}
      className="space-y-9 lg:space-y-11"
    >
      {items.map(({ block, index }) => {
        const paragraphs = block.body.split(/\n\s*\n/).filter(Boolean);
        return (
          <motion.div key={index} variants={prefersReduced ? reducedMotion : variant}>
            {block.heading ? (
              <h2 className="mb-3 font-jost-extrabold text-[clamp(1.5rem,1.1rem+2vw,2.75rem)] leading-[1.12] tracking-[0.05em] text-white uppercase lg:mb-4">
                {block.heading}
              </h2>
            ) : null}
            <div className="space-y-3 lg:space-y-4">
              {paragraphs.map((text, j) => (
                <p
                  key={j}
                  className="text-pretty font-jost-light text-[clamp(1rem,0.9rem+0.42vw,1.3rem)] leading-[1.75] text-white/85"
                >
                  {text}
                </p>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );

  return (
    <section
      aria-label="Privacy policy details"
      className="w-full px-6 pb-16 sm:px-8 sm:pb-20 lg:px-18 lg:pb-28"
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto grid w-full max-w-8xl grid-cols-1 gap-x-12 gap-y-9 lg:grid-cols-2 lg:gap-y-0 2xl:gap-x-16"
      >
        {renderColumn(left, fromLeft)}
        {renderColumn(right, fromRight)}
      </motion.div>
    </section>
  );
}

export function PrivacyBodySkeleton() {
  return (
    <section className="w-full animate-pulse px-6 pb-16 sm:px-8 lg:px-18 lg:pb-28">
      <div className="mx-auto grid w-full max-w-8xl grid-cols-1 gap-x-12 gap-y-9 lg:grid-cols-2 lg:gap-y-0">
        {[0, 1].map((col) => (
          <div key={col} className="space-y-11">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="mb-4 h-7 w-48 rounded-md bg-white/15" />
                <div className="space-y-2.5">
                  <div className="h-4 w-full rounded bg-white/10" />
                  <div className="h-4 w-11/12 rounded bg-white/10" />
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
