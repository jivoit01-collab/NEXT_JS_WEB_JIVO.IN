'use client';

import { SmartLink } from '@/components/shared/smart-link';
import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { DesiGheeRangeContent, DesiGheeVariant } from '../types';
import { defaultRangeContent } from '../data/defaults';
import { GHEE_LEAF, GHEE_FOREST, GHEE_LABEL, GHEE_FOREST_BG } from '../constants';

/**
 * Cards are "thrown in" from the left as the section scrolls into view.
 * Staggered by `container`, so each card lands slightly after the one before.
 */
const throwFromLeft = {
  hidden: { opacity: 0, x: -120, rotate: -6 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 90, damping: 16, mass: 0.9 },
  },
};

interface Props {
  data?: DesiGheeRangeContent;
}

/** Section 2 — "A2 COW GHEE RANGE OF PRODUCTS": jar cards on a leaf-green field. */
export function RangeSection({ data }: Props) {
  const { heading, variants } = data ?? defaultRangeContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;
  const cardItem = prefersReduced ? reducedMotion : throwFromLeft;

  return (
    <section
      aria-labelledby="desi-ghee-range-heading"
      // dvh (not vh) per responsive.md §4 — avoids the mobile URL-bar jump.
      // min-h, so the section still grows if content ever exceeds the viewport.
      className="overflow-x-clip px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24 2xl:py-28"
      style={{ backgroundColor: GHEE_LEAF }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto w-full max-w-6xl 2xl:max-w-7xl"
      >
        <motion.h2
          id="desi-ghee-range-heading"
          variants={item}
          className="group/heading mx-auto block w-fit cursor-default text-balance text-center font-jost-extrabold text-[clamp(1.5rem,1.05rem+1.9vw,2.75rem)] leading-[1.12] tracking-[0.1em] text-white uppercase transition-transform duration-300 ease-out hover:-translate-y-0.5"
        >
          <span className="relative inline-block">
            {heading}
            {/* Growing underline on hover, mirroring the nav/footer treatment. */}
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-0 h-[2px] w-0 transition-all duration-500 ease-out group-hover/heading:w-full motion-reduce:transition-none"
              style={{ backgroundColor: GHEE_LABEL }}
            />
          </span>
        </motion.h2>

        {/* This range has TWO packs, so the grid stays 2-up at every width and
            is centred with a max-width rather than stretching card-wide. */}
        <div className="mx-auto mt-9 grid max-w-3xl grid-cols-2 gap-3 sm:gap-6 md:mt-10 md:gap-7 lg:mt-12 lg:gap-8 2xl:gap-10">
          {variants.map((variant, i) => (
            <motion.div key={`${variant.label}-${i}`} variants={cardItem}>
              <VariantCard variant={variant} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/** One jar card. Renders as a link when `href` is set, else a plain figure. */
function VariantCard({ variant }: { variant: DesiGheeVariant }) {
  const { image, label, href } = variant;

  const inner = (
    <>
      <div className="flex h-[clamp(11rem,34vw,18rem)] items-center justify-center">
        {/* SafeImage resolves empty/unknown values to the upload placeholder,
            so a card never renders an empty hole before art is uploaded. */}
        <SafeImage
          src={image}
          alt={`Jivo A2 cow ghee — ${label}`}
          width={420}
          height={420}
          quality={85}
          sizes="(max-width: 767px) 45vw, (max-width: 1024px) 34vw, 300px"
          className="h-full w-auto object-contain transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.07]"
        />
      </div>
      <span
        className="mt-3 block text-center font-jost-extrabold text-xs sm:mt-5 sm:text-sm lg:text-base"
        style={{ color: GHEE_LABEL }}
      >
        {label}
      </span>
    </>
  );

  const cardClass =
    'group block rounded-2xl p-3.5 transition-all duration-500 ease-out sm:p-6 lg:p-8 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.28)]';

  if (href) {
    return (
      <SmartLink
        href={href}
        aria-label={`View ${label} Jivo A2 cow ghee`}
        className={`${cardClass} focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ghee-leaf)] focus-visible:outline-none`}
        style={{
          backgroundColor: GHEE_FOREST_BG,
          ['--ghee-leaf' as string]: GHEE_LEAF,
        }}
      >
        {inner}
      </SmartLink>
    );
  }

  return (
    <figure className={cardClass} style={{ backgroundColor: GHEE_FOREST_BG }}>
      {inner}
    </figure>
  );
}

export function RangeSectionSkeleton() {
  return (
    <section
      className="animate-pulse px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24 2xl:py-28"
      style={{ backgroundColor: GHEE_LEAF }}
    >
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">
        <div className="mx-auto h-8 w-72 rounded-md bg-white/20 sm:h-10 lg:h-12 lg:w-[30rem]" />
        <div className="mx-auto mt-9 grid max-w-3xl grid-cols-2 gap-3 sm:gap-6 md:mt-10 md:gap-7 lg:mt-12 lg:gap-8 2xl:gap-10">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-3.5 sm:p-6 lg:p-8"
              style={{ backgroundColor: GHEE_FOREST }}
            >
              <div className="mx-auto h-[clamp(11rem,34vw,18rem)] w-24 rounded-lg bg-white/10" />
              <div className="mx-auto mt-3 h-4 w-20 rounded bg-white/15 sm:mt-5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
