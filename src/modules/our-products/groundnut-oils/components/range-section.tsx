'use client';

import { SmartLink } from '@/components/shared/smart-link';
import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { GroundnutOilsRangeContent, GroundnutProductVariant } from '../types';
import { defaultRangeContent } from '../data/defaults';
import { GROUNDNUT_RANGE_BROWN, GROUNDNUT_CARD_YELLOW, GROUNDNUT_LABEL } from '../constants';

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
  data?: GroundnutOilsRangeContent;
}

/** Section 2 — "GROUNDNUT OIL RANGE OF PRODUCTS": bottle cards on a brown field. */
export function RangeSection({ data }: Props) {
  const { heading, variants } = data ?? defaultRangeContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;
  const cardItem = prefersReduced ? reducedMotion : throwFromLeft;

  return (
    <section
      aria-labelledby="groundnut-range-heading"
      className="overflow-x-clip px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      style={{ backgroundColor: GROUNDNUT_RANGE_BROWN }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto w-full max-w-6xl"
      >
        <motion.h2
          id="groundnut-range-heading"
          variants={item}
          className="group/heading mx-auto block w-fit cursor-default text-balance text-center font-jost-extrabold text-[clamp(1.5rem,1.05rem+1.9vw,2.75rem)] leading-[1.12] tracking-[0.1em] text-white uppercase transition-transform duration-300 ease-out hover:-translate-y-0.5"
        >
          <span className="relative inline-block">
            {heading}
            {/* Growing underline on hover, mirroring the nav/footer treatment. */}
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-0 h-[2px] w-0 transition-all duration-500 ease-out group-hover/heading:w-full motion-reduce:transition-none"
              style={{ backgroundColor: GROUNDNUT_CARD_YELLOW }}
            />
          </span>
        </motion.h2>

        <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-6 lg:mt-12 lg:grid-cols-3 lg:gap-8">
          {variants.map((variant, i) => {
            // Two-up below lg. A trailing odd card would leave a gap, so it
            // spans the full row instead. At lg the grid is 3-up and even.
            const spansRow = variants.length % 2 === 1 && i === variants.length - 1;
            return (
              <motion.div
                key={`${variant.label}-${i}`}
                variants={cardItem}
                className={spansRow ? 'col-span-2 lg:col-span-1' : undefined}
              >
                <VariantCard variant={variant} fullWidth={spansRow} index={i} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

/** Progressive bottle scale by position (smallest → largest), as fractions of
 *  the card's image-box height. The CARD size stays identical — only the bottle
 *  inside grows. Beyond 3 variants it caps at full height. */
const BOTTLE_SCALE = ['70%', '85%', '100%'];

/** One bottle card. Renders as a link when `href` is set, else a plain figure. */
function VariantCard({
  variant,
  fullWidth = false,
  index = 0,
}: {
  variant: GroundnutProductVariant;
  fullWidth?: boolean;
  index?: number;
}) {
  const { image, label, href } = variant;
  const bottleHeight = BOTTLE_SCALE[Math.min(index, BOTTLE_SCALE.length - 1)];

  const inner = (
    <>
      {/* A row-spanning card is twice as wide, so its bottle is capped by vw
          rather than the column. Bottom-aligned so the different heights share
          a common baseline. */}
      <div
        className={
          fullWidth
            ? 'flex h-[clamp(11rem,26vw,18rem)] items-end justify-center lg:h-[clamp(11rem,34vw,18rem)]'
            : 'flex h-[clamp(11rem,34vw,18rem)] items-end justify-center'
        }
      >
        {/* SafeImage resolves empty/unknown values to the upload placeholder,
            so a card never renders an empty hole before art is uploaded. */}
        <SafeImage
          src={image}
          alt={`Jivo cold pressed groundnut oil — ${label}`}
          width={260}
          height={420}
          quality={85}
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 260px"
          style={{ height: bottleHeight }}
          className="w-auto object-contain object-bottom transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.07]"
        />
      </div>
      <span
        className="mt-3 block text-center font-jost-extrabold text-xs sm:mt-5 sm:text-sm lg:text-base"
        style={{ color: GROUNDNUT_LABEL }}
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
        aria-label={`View ${label} Jivo cold pressed groundnut oil`}
        className={`${cardClass} focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--groundnut-range-brown)] focus-visible:outline-none`}
        style={{
          backgroundColor: GROUNDNUT_CARD_YELLOW,
          ['--groundnut-range-brown' as string]: GROUNDNUT_RANGE_BROWN,
        }}
      >
        {inner}
      </SmartLink>
    );
  }

  return (
    <figure className={cardClass} style={{ backgroundColor: GROUNDNUT_CARD_YELLOW }}>
      {inner}
    </figure>
  );
}

export function RangeSectionSkeleton() {
  return (
    <section
      className="animate-pulse px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      style={{ backgroundColor: GROUNDNUT_RANGE_BROWN }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto h-8 w-72 rounded-md bg-white/20 sm:h-10 lg:h-12 lg:w-[30rem]" />
        <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-6 lg:mt-12 lg:grid-cols-3 lg:gap-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`rounded-2xl p-3.5 sm:p-6 lg:p-8 ${i === 2 ? 'col-span-2 lg:col-span-1' : ''}`}
              style={{ backgroundColor: GROUNDNUT_CARD_YELLOW }}
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
