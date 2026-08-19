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
const ART_HEIGHT = 'h-full';

/**
 * Width at each breakpoint. Raise these values to grow the branch.
 *
 * From lg up these are FIXED rem sizes, not vw. The art is anchored to the
 * fixed-width card container, so a vw width would keep growing past the
 * container on xl/2xl and push the branch back out to the screen edge —
 * the drift this layout exists to prevent. Below lg it stays vw-based so it
 * still scales down on phones and tablets.
 */
const ART_WIDTH =
  'w-[45vw] max-w-[30rem] lg:w-[26rem] lg:max-w-[26rem] xl:w-[30rem] xl:max-w-[30rem] 2xl:w-[34rem] 2xl:max-w-[34rem]';

/**
 * Tilt applied to the branch. The design leans it clockwise, so the
 * right-hand artwork gets a positive angle; the left-hand one mirrors it so
 * both lean "into" the section rather than off the edge.
 *
 * The left-hand copy is also FLIPPED horizontally (`-scale-x-100`), so the
 * branch grows inward from the left edge instead of appearing back-to-front.
 */
const ART_TILT_RIGHT = 'rotate-[30deg]';
const ART_TILT_LEFT = 'rotate-[-30deg]';

/**
 * Vertical position of the branch. Negative values move it UP.
 * `-40px` lifts it ~40px above centre; use `-50px` for a little more.
 */
const ART_OFFSET_Y = '-translate-y-[50px]';

/**
 * Horizontal nudge, applied per side so each branch moves OUTWARD toward its
 * own screen edge.
 *
 * The design keeps a deliberate overlap: the right-hand olive fruit sits
 * partly BEHIND the last card, and the left-hand branch tucks behind the
 * first — so this is a small nudge, not a full clear-out. Raise it to pull
 * the art further off the cards; lower it to increase the overlap.
 *
 * Set as an INLINE STYLE, not a Tailwind class: these values live in a
 * template literal, and Tailwind's scanner does not reliably generate
 * arbitrary classes from those — `translate-x-[5rem]` produced no CSS at all
 * and the art silently stayed put. An inline transform always applies.
 */
const ART_OFFSET_X = '-3rem';

interface Props {
  /** Stable id for the section heading (used by aria-labelledby). */
  id: string;
  data: OliveOilsVariantContent;
  /** Section background colour. */
  background: string;
  /** Which side the decorative olive artwork sits on. */
  imageSide: 'left' | 'right';
  /**
   * Pack-label colour under each card. Defaults to the pale sage used on the
   * Extra Virgin section; Extra Light and Pomace pass white, which reads
   * better against their darker section backgrounds.
   */
  labelColor?: string;
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
export function VariantSection({
  id,
  data,
  background,
  imageSide,
  labelColor = OLIVE_LABEL,
}: Props) {
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
      {/* ── Decorative olive artwork ──────────────────────────────
          ANCHOR: pinned to the SECTION edges (inset-x-0), so the right-hand
          branch touches the right edge of the screen and the left-hand one
          touches the left — never tucked behind the cards.

          What stops it drifting on xl/2xl is the FIXED rem width below
          (ART_WIDTH), not the anchor: the branch is a constant size flush to
          the screen edge, while the cards stay centred in their own
          container. Previously the width was vw-based, so the art grew with
          the viewport and its inner edge crept across the cards.

          `inset-y-0` gives the absolutely-positioned art a full-height box;
          `z-0` keeps it behind the cards (z-10). */}
      {/* Negative insets cancel the section's px-4/sm:px-6/lg:px-8 padding so
          the art reaches the true screen edge. Written as `left-[-1rem]` etc.
          rather than `-left-4`: Tailwind v4 does not generate the responsive
          `sm:-left-6` / `lg:-left-8` forms, so those silently produced no CSS
          and the art stayed inset. */}
      <div className="pointer-events-none absolute inset-y-0 left-[-1rem] right-[-1rem] z-0 sm:left-[-1.5rem] sm:right-[-1.5rem] lg:left-[-2rem] lg:right-[-2rem]">
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
        {/* Separate element for the horizontal nudge: the wrapper below already
            owns translate-Y + rotate, and Tailwind merges all transforms on one
            element, so a third translate there would fight the others. */}
        <div
          className="h-full w-full"
          style={{
            transform: `translateX(${imageSide === 'left' ? '-' : ''}${ART_OFFSET_X})`,
          }}
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
        </div>
      </motion.div>
      </div>

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
          className="mx-auto mt-6 max-w-[68ch] text-pretty font-jost-light text-center text-[clamp(0.9rem,0.82rem+0.34vw,1.125rem)] leading-[1.75] text-white/90 lg:mt-8"
        >
          {paragraph}
        </motion.p>

        {paragraphTwo ? (
          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-[68ch] text-pretty font-jost-light text-center text-[clamp(0.9rem,0.82rem+0.34vw,1.125rem)] leading-[1.75] text-white/90"
          >
            {paragraphTwo}
          </motion.p>
        ) : null}

        {bestFor ? (
          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-[68ch] text-pretty font-jost-light text-center text-[clamp(0.9rem,0.82rem+0.34vw,1.125rem)] leading-[1.75] text-white/90"
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
                <VariantCard
                  variant={variant}
                  fullWidth={spansRow}
                  background={background}
                  labelColor={labelColor}
                />
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
  labelColor = OLIVE_LABEL,
}: {
  variant: OliveProductVariant;
  fullWidth?: boolean;
  background: string;
  labelColor?: string;
}) {
  const { image, label, href } = variant;

  const inner = (
    <>
      {/* A row-spanning card is twice as wide, so its pack is capped by vw
          rather than the column — otherwise it renders oversized.
          The 18rem ceiling stops the pack growing indefinitely on xl/2xl,
          so the 3-up row simply scales down as the window narrows. */}
      <div
        className={
          fullWidth
            ? 'flex h-[clamp(9rem,22vw,15rem)] items-center justify-center lg:h-[clamp(9rem,20vw,16rem)]'
            : 'flex h-[clamp(9rem,26vw,15rem)] items-center justify-center lg:h-[clamp(9rem,20vw,16rem)]'
        }
      >
        {/* SafeImage resolves empty/unknown values to the upload placeholder,
            so a card never renders an empty hole before art is uploaded. */}
        {/* `max-h-full max-w-full` (not `h-full w-auto`): height-driven sizing
            lets a tall pack grow wider than its grid column and spill over the
            card as the window narrows. Capping BOTH axes keeps the pack inside
            its column at every width, and object-contain preserves the aspect
            ratio so it simply scales down. */}
        <SafeImage
          src={image}
          alt={`Jivo olive oil — ${label}`}
          width={260}
          height={420}
          quality={85}
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 260px"
          className="h-auto max-h-full w-auto max-w-full object-contain transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.07]"
        />
      </div>
      <span
        className="mt-3 block text-center font-jost-extrabold text-xs sm:mt-5 sm:text-sm lg:text-base"
        style={{ color: labelColor }}
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
