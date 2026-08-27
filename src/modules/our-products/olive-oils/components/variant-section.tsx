'use client';

import { SmartLink } from '@/components/shared/smart-link';
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
const ART_HEIGHT = 'h-[90%]';

/**
 * Width of the branch, as a share of the CARD CONTAINER (not the screen).
 *
 * The art box is anchored to the same centred max-w-6xl container as the
 * cards, so a percentage here keeps the branch the same size relative to the
 * cards at every width — the overlap with the first/last card is identical on
 * any screen or zoom level. Raise the % to grow the branch.
 *
 * Fixed rem widths were used previously to stop the art drifting while it was
 * anchored to the SCREEN edge; anchoring to the container removes that need
 * and lets the art scale again.
 */
const ART_WIDTH = 'w-[45vw] max-w-[30rem] lg:w-[34%] lg:max-w-none';

/**
 * Tilt applied to the branch. The design leans it clockwise, so the
 * right-hand artwork gets a positive angle; the left-hand one mirrors it so
 * both lean "into" the section rather than off the edge.
 *
 * The left-hand copy is also FLIPPED horizontally (`-scale-x-100`), so the
 * branch grows inward from the left edge instead of appearing back-to-front.
 */
const ART_TILT_RIGHT = 'rotate-[25deg]';
const ART_TILT_LEFT = 'rotate-[-25deg]';

/**
 * Vertical position of the branch. Negative values move it UP.
 * `-40px` lifts it ~40px above centre; use `-50px` for a little more.
 */
const ART_OFFSET_Y = '-translate-y-[30px]';

/**
 * Horizontal nudge, applied per side so each branch moves OUTWARD toward its
 * own screen edge.
 *
 * The design keeps a deliberate overlap: the right-hand branch sits partly
 * BEHIND the last card and the left-hand one behind the first, with roughly
 * 15% of the art's width covered.
 *
 * Measured as a % of the ART'S OWN WIDTH, so the overlap is identical at any
 * screen size or zoom: +80% leaves 20% hidden, +85% -> 15%, +90% -> 10%.
 * RAISE it to hide less of the art; LOWER it to hide more.
 *
 * Expressed as a PERCENTAGE of the art box (which now tracks the card
 * container), so it scales with everything else. A fixed rem value would stay
 * a constant pixel nudge while the art and cards scaled, shifting the overlap.
 *
 * Set as an INLINE STYLE, not a Tailwind class: these values live in a
 * template literal, and Tailwind's scanner does not reliably generate
 * arbitrary classes from those — `translate-x-[5rem]` produced no CSS at all
 * and the art silently stayed put. An inline transform always applies.
 */
const ART_OFFSET_X = '75%';

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
      {/* The box matches the card container (max-w-6xl, centred), so the art is
          positioned relative to the CARDS rather than the screen. That keeps
          the branch/card overlap constant at every width — anchoring to the
          screen edge let the overlap change as the side gutters grew. */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-full max-w-6xl -translate-x-1/2">
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
            sizes="(max-width: 1024px) 45vw, 34vw"
            className={`h-full w-full object-contain ${
              imageSide === 'left' ? 'object-left -scale-x-100' : 'object-right'
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
          className="mx-auto mt-6 max-w-full text-pretty font-jost-light text-center text-[clamp(0.95rem,0.86rem+0.42vw,1.25rem)] leading-[1.75] text-white/90 lg:mt-8"
        >
          {paragraph}
        </motion.p>

        {paragraphTwo ? (
          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-full text-pretty font-jost-light text-center text-[clamp(0.95rem,0.86rem+0.42vw,1.25rem)] leading-[1.75] text-white/90"
          >
            {paragraphTwo}
          </motion.p>
        ) : null}

        {bestFor ? (
          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-full text-pretty font-jost-light text-center text-[clamp(0.95rem,0.86rem+0.42vw,1.25rem)] leading-[1.75] text-white/90"
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
                  index={i}
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
/** Progressive pack scale by position (smallest → largest), as fractions of the
 *  card's image-box height. The CARD size stays identical — only the pack inside
 *  grows. Beyond 3 variants it caps at full height. */
const BOTTLE_SCALE = ['70%', '85%', '100%'];

function VariantCard({
  variant,
  fullWidth = false,
  background,
  labelColor = OLIVE_LABEL,
  index = 0,
}: {
  variant: OliveProductVariant;
  fullWidth?: boolean;
  background: string;
  labelColor?: string;
  index?: number;
}) {
  const { image, label, href } = variant;
  const bottleHeight = BOTTLE_SCALE[Math.min(index, BOTTLE_SCALE.length - 1)];

  const inner = (
    <>
      {/* A row-spanning card is twice as wide, so its pack is capped by vw
          rather than the column — otherwise it renders oversized.
          The 18rem ceiling stops the pack growing indefinitely on xl/2xl,
          so the 3-up row simply scales down as the window narrows. */}
      <div
        className={
          fullWidth
            ? 'flex h-[clamp(9rem,22vw,15rem)] items-end justify-center lg:h-[clamp(9rem,20vw,16rem)]'
            : 'flex h-[clamp(9rem,26vw,15rem)] items-end justify-center lg:h-[clamp(9rem,20vw,16rem)]'
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
          style={{ maxHeight: bottleHeight }}
          className="h-auto w-auto max-w-full object-contain object-bottom transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.07]"
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
      <SmartLink
        href={href}
        aria-label={`View ${label} Jivo olive oil`}
        className={`${cardClass} focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--olive-section-bg)] focus-visible:outline-none`}
        style={{
          backgroundColor: OLIVE_CARD,
          ['--olive-section-bg' as string]: background,
        }}
      >
        {inner}
      </SmartLink>
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
        <div className="mx-auto mt-6 max-w-full space-y-2.5 lg:mt-8">
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
