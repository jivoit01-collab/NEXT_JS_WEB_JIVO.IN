'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { OliveOilsVariantContent, OliveProductVariant } from '../types';
import { OLIVE_CARD, OLIVE_LABEL } from '../constants';

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

/** Olive artwork drifts in from whichever edge it is anchored to. */
const artFromRight = {
  hidden: { opacity: 0, x: 120 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 70, damping: 18, mass: 1 },
  },
};
const artFromLeft = {
  hidden: { opacity: 0, x: -120 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 70, damping: 18, mass: 1 },
  },
};

/* ══════════════════════════════════════════════════════════════
   OLIVE ARTWORK — tuning knobs. Change these to resize / re-angle
   the decorative olive branch in sections 2-4.
   ══════════════════════════════════════════════════════════════ */

/** Height of the artwork relative to the section. Bigger % = taller branch. */
const ART_HEIGHT = 'h-[92%]';

/** Width at each breakpoint. Raise the vw/max-w values to grow the branch. */
const ART_WIDTH = 'w-[45vw] max-w-[30rem] lg:w-[38vw] lg:max-w-[38rem] 2xl:max-w-[45rem]';

/**
 * Tilt applied to the branch. The design leans it clockwise, so the
 * right-hand artwork gets a positive angle; the left-hand one mirrors it so
 * both lean "into" the section rather than off the edge.
 *
 * The left-hand copy is also FLIPPED horizontally (`-scale-x-100`), so the
 * branch grows inward from the left edge instead of appearing back-to-front.
 */
const ART_TILT_RIGHT = 'rotate-[25deg]';
const ART_TILT_LEFT = 'rotate-[-28deg]';

/**
 * Vertical position of the branch. Negative values move it UP.
 * `-40px` lifts it ~40px above centre; use `-50px` for a little more.
 */
const ART_OFFSET_Y = '-translate-y-[50px]';

interface Props {
  /** Stable id for the section heading (used by aria-labelledby). */
  id: string;
  data: OliveOilsVariantContent;
  /** Section background colour. */
  background: string;
  /** Which side the decorative olive artwork sits on. */
  imageSide: 'left' | 'right';
}

/**
 * Sections 2-4 — "Extra Virgin", "Extra Light" and "Pomace".
 *
 * All three share this layout: centred copy above a row of pack cards, with
 * decorative olive artwork bleeding in from one side. Only the background
 * colour, the artwork side and the content differ, so they are one component
 * rather than three near-identical files.
 *
 * The artwork is decorative, so it sits outside the copy flow (responsive.md
 * §6 permits absolute positioning for decoration) and is hidden from AT.
 */
export function VariantSection({ id, data, background, imageSide }: Props) {
  const { heading, paragraph, paragraphTwo, bestFor, sideImage, variants } = data;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;
  const cardItem = prefersReduced ? reducedMotion : throwFromLeft;
  const art = prefersReduced ? reducedMotion : imageSide === 'left' ? artFromLeft : artFromRight;

  return (
    <section
      aria-labelledby={id}
      className="relative overflow-x-clip px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      style={{ backgroundColor: background }}
    >
      {/* ── Decorative olive artwork, bleeding off one edge ── */}
      <motion.div
        variants={art}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        aria-hidden
        // Motion owns this element's transform, so the tilt/offset live on the
        // inner wrapper below — putting them here would be overwritten.
        className={`pointer-events-none absolute top-1/2 z-0 hidden -translate-y-1/2 sm:block ${
          imageSide === 'left' ? 'left-0' : 'right-0'
        } ${ART_HEIGHT} ${ART_WIDTH}`}
      >
        <div
          className={`h-full w-full ${ART_OFFSET_Y} ${
            imageSide === 'left' ? ART_TILT_LEFT : ART_TILT_RIGHT
          }`}
        >
          {/* SafeImage resolves empty/unknown values to the upload placeholder. */}
          <SafeImage
            src={sideImage}
            alt=""
            width={900}
            height={900}
            quality={85}
            sizes="(max-width: 1024px) 42vw, 36vw"
            className={`h-full w-full object-contain ${
              imageSide === 'left' ? 'object-left' : 'object-right'
            }`}
          />
        </div>
      </motion.div>

      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto w-full max-w-6xl"
      >
        {/* ── Centred copy ── */}
        <motion.h2
          id={id}
          variants={item}
          className="mx-auto block w-fit text-balance text-center font-jost-extrabold text-[clamp(1.5rem,1.05rem+1.9vw,2.75rem)] leading-[1.12] tracking-[0.06em] text-white uppercase"
        >
          {heading}
        </motion.h2>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-[68ch] text-pretty text-center text-[clamp(0.9rem,0.82rem+0.34vw,1.125rem)] leading-[1.75] text-white/90 lg:mt-8"
        >
          {paragraph}
        </motion.p>

        {paragraphTwo ? (
          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-[68ch] text-pretty text-center text-[clamp(0.9rem,0.82rem+0.34vw,1.125rem)] leading-[1.75] text-white/90"
          >
            {paragraphTwo}
          </motion.p>
        ) : null}

        {bestFor ? (
          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-[68ch] text-pretty text-center text-[clamp(0.9rem,0.82rem+0.34vw,1.125rem)] leading-[1.75] text-white/90"
          >
            {bestFor}
          </motion.p>
        ) : null}

        {/* ── Pack cards ── */}
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
                <VariantCard variant={variant} fullWidth={spansRow} background={background} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

/** One pack card. Renders as a link when `href` is set, else a plain figure. */
function VariantCard({
  variant,
  fullWidth = false,
  background,
}: {
  variant: OliveProductVariant;
  fullWidth?: boolean;
  background: string;
}) {
  const { image, label, href } = variant;

  const inner = (
    <>
      {/* A row-spanning card is twice as wide, so its pack is capped by vw
          rather than the column — otherwise it renders oversized. */}
      <div
        className={
          fullWidth
            ? 'flex h-[clamp(11rem,26vw,18rem)] items-center justify-center lg:h-[clamp(11rem,34vw,18rem)]'
            : 'flex h-[clamp(11rem,34vw,18rem)] items-center justify-center'
        }
      >
        {/* SafeImage resolves empty/unknown values to the upload placeholder,
            so a card never renders an empty hole before art is uploaded. */}
        <SafeImage
          src={image}
          alt={`Jivo olive oil — ${label}`}
          width={260}
          height={420}
          quality={85}
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 260px"
          className="h-full w-auto object-contain transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.07]"
        />
      </div>
      <span
        className="mt-3 block text-center font-jost-light text-xs sm:mt-5 sm:text-sm lg:text-base"
        style={{ color: OLIVE_LABEL }}
      >
        {label}
      </span>
    </>
  );

  const cardClass =
    'group block rounded-2xl p-3.5 transition-all duration-500 ease-out sm:p-6 lg:p-8 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.28)]';

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`View ${label} Jivo olive oil`}
        className={`${cardClass} focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--olive-section-bg)] focus-visible:outline-none`}
        style={{
          backgroundColor: OLIVE_CARD,
          ['--olive-section-bg' as string]: background,
        }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <figure className={cardClass} style={{ backgroundColor: OLIVE_CARD }}>
      {inner}
    </figure>
  );
}

export function VariantSectionSkeleton({ background }: { background: string }) {
  return (
    <section
      className="animate-pulse px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      style={{ backgroundColor: background }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto h-8 w-72 rounded-md bg-white/20 sm:h-10 lg:h-12 lg:w-[26rem]" />
        <div className="mx-auto mt-6 max-w-[68ch] space-y-2.5 lg:mt-8">
          <div className="mx-auto h-4 w-full rounded bg-white/10" />
          <div className="mx-auto h-4 w-11/12 rounded bg-white/10" />
        </div>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-6 lg:mt-12 lg:grid-cols-3 lg:gap-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`rounded-2xl p-3.5 sm:p-6 lg:p-8 ${i === 2 ? 'col-span-2 lg:col-span-1' : ''}`}
              style={{ backgroundColor: OLIVE_CARD }}
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
