'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage, isPlaceholderValue } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CoffeeBeyondBeansContent } from '../types';
import { defaultBeyondBeansContent } from '../data/defaults';
import { COFFEE_BEAN, COFFEE_CREAM } from '../constants';

interface Props {
  data?: CoffeeBeyondBeansContent;
}

/** Heading/paragraph reveal — rises and settles with a soft ease. */
const textReveal = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Artwork fade — gentle, no movement, so the line art never looks jumpy. */
const artReveal = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.1, ease: 'easeOut' as const } },
};

/**
 * Section box — shared by the section and its skeleton. Flat #3D1F08 field
 * (COFFEE_BEAN, the darkest swatch in the Koffie palette). Full screen from
 * sm up; on phones it is at least half the viewport and grows with the copy.
 */
const SECTION_CLASS = 'relative isolate w-full overflow-hidden min-h-[50dvh] sm:min-h-dvh';

/**
 * Line-art box — bottom-right, ~2/3 of the section width on desktop, bleeding
 * slightly off the right and bottom edges like the design. Phones and
 * portrait tablets use a wider box so the drawing stays legible. Fixed 3:2 ratio to
 * match the uploaded artwork, so it never distorts.
 */
const ART_CLASS =
  'pointer-events-none absolute right-[-6%] bottom-[-3%] z-0 aspect-[3/2] w-[96%] sm:w-[88%] lg:w-[67%]';

/**
 * Copy layer — top-left. Top padding clears the fixed navbar; on phones the
 * bottom padding reserves room for the artwork beneath the text.
 */
const COPY_LAYER_CLASS =
  'relative z-10 flex w-full flex-col justify-start px-4 pt-24 pb-[48vw] sm:px-6 sm:pb-[40vw] md:px-[5.5%] md:pt-[max(7rem,15dvh)] md:pb-[10dvh]';

/**
 * Section 4 — "BEYOND BEANS: WELLNESS INFUSED".
 *
 * Heading + paragraph top-left on a flat bean-brown field, with the uploaded
 * transparent coffee-branch line art decorating the bottom-right corner.
 * The artwork is decoration only (responsive.md §6 allows absolute there);
 * the copy stays in normal flow and sets the section height when it needs to.
 */
export function BeyondBeansSection({ data }: Props) {
  const { heading, paragraph, backgroundImage } = data ?? defaultBeyondBeansContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const hasArt = !isPlaceholderValue(backgroundImage);

  return (
    <section
      aria-labelledby="coffee-beyondbeans-heading"
      className={SECTION_CLASS}
      style={{ backgroundColor: COFFEE_BEAN }}
    >
      {hasArt ? (
        <motion.div
          aria-hidden
          variants={prefersReduced ? reducedMotion : artReveal}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className={ART_CLASS}
        >
          <SafeImage
            src={backgroundImage}
            alt=""
            fill
            quality={85}
            sizes="(max-width: 1023px) 92vw, 67vw"
            className="object-contain object-right-bottom"
          />
        </motion.div>
      ) : null}

      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className={COPY_LAYER_CLASS}
      >
        <motion.h2
          id="coffee-beyondbeans-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.02em] uppercase"
          style={{ color: COFFEE_CREAM }}
        >
          {heading}
        </motion.h2>

        {/* whitespace-pre-line keeps the admin's line breaks. The column is
            capped at roughly half the width on desktop, as in the design. */}
        <motion.p
          variants={item}
          className="mt-5 w-full max-w-[65ch] text-pretty font-jost-light whitespace-pre-line text-[clamp(0.95rem,0.82rem+0.42vw,1.2rem)] leading-[1.6] tracking-[0.02em] text-white/95 md:mt-10 md:max-w-[72%] lg:mt-14 lg:max-w-[52%]"
        >
          {paragraph}
        </motion.p>
      </motion.div>
    </section>
  );
}

export function BeyondBeansSectionSkeleton() {
  return (
    <section className={`animate-pulse ${SECTION_CLASS}`} style={{ backgroundColor: COFFEE_BEAN }}>
      <div className={COPY_LAYER_CLASS}>
        <div className="h-9 w-3/4 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-[40rem]" />
        <div className="mt-5 w-full max-w-[65ch] space-y-2.5 md:mt-10 md:max-w-[72%] lg:mt-14 lg:max-w-[52%]">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-white/10 sm:h-5" />
          ))}
        </div>
      </div>
    </section>
  );
}
