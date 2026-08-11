'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CanolaOilsRangeContent, CanolaProductVariant } from '../types';
import { defaultRangeContent } from '../data/defaults';
import { CANOLA_TAUPE, CANOLA_CARD_GREEN } from '../constants';

interface Props {
  data?: CanolaOilsRangeContent;
}

/** Section 2 — "CANOLA OIL RANGE OF PRODUCTS": bottle cards on a taupe field. */
export function RangeSection({ data }: Props) {
  const { heading, variants } = data ?? defaultRangeContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;

  return (
    <section
      aria-labelledby="canola-range-heading"
      className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      style={{ backgroundColor: CANOLA_TAUPE }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto w-full max-w-6xl"
      >
        <motion.h2
          id="canola-range-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-center text-xl tracking-[0.1em] text-white uppercase sm:text-2xl lg:text-3xl"
        >
          {heading}
        </motion.h2>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-12 lg:grid-cols-3 lg:gap-8">
          {variants.map((variant, i) => (
            <motion.div key={`${variant.label}-${i}`} variants={item}>
              <VariantCard variant={variant} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/** One bottle card. Renders as a link when `href` is set, else a plain figure. */
function VariantCard({ variant }: { variant: CanolaProductVariant }) {
  const { image, label, href } = variant;

  const inner = (
    <>
      <div className="flex h-56 items-center justify-center sm:h-64 lg:h-72">
        {/* SafeImage resolves empty/unknown values to the upload placeholder,
            so a card never renders an empty hole before art is uploaded. */}
        <SafeImage
          src={image}
          alt={`Jivo cold pressed canola oil — ${label}`}
          width={260}
          height={420}
          quality={85}
          sizes="(max-width: 640px) 60vw, (max-width: 1024px) 40vw, 260px"
          className="h-full w-auto object-contain transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.07]"
        />
      </div>
      <span className="mt-5 block text-center font-jost-medium text-sm text-white/95 sm:text-base">
        {label}
      </span>
    </>
  );

  const cardClass =
    'group block rounded-2xl p-6 transition-all duration-500 ease-out sm:p-8 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.28)]';

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`View ${label} Jivo cold pressed canola oil`}
        className={`${cardClass} focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--canola-taupe)] focus-visible:outline-none`}
        style={{
          backgroundColor: CANOLA_CARD_GREEN,
          ['--canola-taupe' as string]: CANOLA_TAUPE,
        }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <figure className={cardClass} style={{ backgroundColor: CANOLA_CARD_GREEN }}>
      {inner}
    </figure>
  );
}

export function RangeSectionSkeleton() {
  return (
    <section
      className="animate-pulse px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      style={{ backgroundColor: CANOLA_TAUPE }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto h-7 w-72 rounded-md bg-white/20 sm:h-8 lg:h-9 lg:w-96" />
        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-12 lg:grid-cols-3 lg:gap-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-6 sm:p-8"
              style={{ backgroundColor: CANOLA_CARD_GREEN }}
            >
              <div className="mx-auto h-56 w-24 rounded-lg bg-white/10 sm:h-64 lg:h-72" />
              <div className="mx-auto mt-5 h-4 w-20 rounded bg-white/15" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
