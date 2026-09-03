'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';

/** Heading/paragraph reveal — rises and settles with a soft ease. */
const textReveal = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Artwork throw-in — enters from off the right edge and settles with a spring,
 * mirroring the range cards' throw from the left.
 */
const artReveal = {
  // NOTE: no `rotate` here. The per-section tilt lives on the same CSS
  // transform, so animating rotate would overwrite it and flatten the artwork.
  //
  // `hidden` keeps FULL opacity and only offsets the position: this artwork is
  // decorative and server-rendered, so it must be visible even before (or
  // without) hydration. An opacity-0 start left it permanently invisible when
  // the viewport trigger did not fire.
  hidden: { opacity: 1, x: 90 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 70, damping: 18, mass: 1 },
  },
};

/**
 * ── ARTWORK TUNING DIALS ──────────────────────────────────────
 * Each section passes its own values, so the two artworks can be positioned
 * independently without touching the shared layout below.
 *
 *   tilt    — rotation in DEGREES. Negative = anticlockwise, positive = clockwise.
 *   offsetX — maps to CSS `right`. POSITIVE pulls the art INWARD (away from the
 *             right edge); NEGATIVE pushes it OFF the edge, where the section's
 *             `overflow-hidden` clips it. Use `0%` to sit flush against the edge.
 *   offsetY — nudge from the section's vertical CENTRE. Use absolute units
 *             (rem/px), NOT percentages: a % here resolves against the
 *             section's height, which changes as the copy reflows, so the art
 *             would drift up/down between screens. NEGATIVE moves it UP,
 *             POSITIVE moves it DOWN.
 *   width   — art size as a CSS width (a clamp() so it scales with the viewport).
 */
export interface ArtTuning {
  tilt: number;
  offsetX: string;
  offsetY: string;
  width: string;
}

interface Props {
  /** Anchors `aria-labelledby` — must be unique per section on the page. */
  headingId: string;
  heading: string;
  paragraph: string;
  /** Decorative artwork bleeding off the section's right edge. */
  image: string;
  /** Section background. */
  backgroundColor: string;
  /** Heading colour. */
  headingColor: string;
  /** Body copy colour. */
  bodyColor: string;
  /** Per-section artwork tilt/offset/size — see ArtTuning above. */
  artTuning: ArtTuning;
}

/**
 * Shared layout for sections 3 and 4 — "MORE THAN A JUICE" and "A DIFFERENCE
 * YOU CAN SEE AND TASTE".
 *
 * Both are LEFT-ALIGNED copy with a decorative image bleeding off the right
 * edge, differing only in palette, artwork and copy. The artwork is decorative
 * (`aria-hidden`, outside the copy flow), which responsive.md §6 permits;
 * primary content stays in normal flow and reflows on its own.
 */
export function CopyWithArtSection({
  headingId,
  heading,
  paragraph,
  image,
  backgroundColor,
  headingColor,
  bodyColor,
  artTuning,
}: Props) {
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const art = prefersReduced ? reducedMotion : artReveal;

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex w-full min-h-[36dvh] items-start overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:min-h-dvh md:py-24 lg:px-[5%] lg:py-28 2xl:px-[7%] 2xl:py-32"
      style={{ backgroundColor }}
    >
      {/* ── ART ANCHOR ────────────────────────────────────────────
          A centred, max-width box — NOT the section edge. The section's own
          padding grows with the viewport (px-4 → 2xl:px-[7%]), so anchoring to
          its edge made the art drift as the screen changed. Anchoring to this
          fixed-width box keeps the art in the SAME relative position at every
          breakpoint; only its size changes (via the clamp() width below). */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-full max-w-[90rem] -translate-x-1/2">
      <motion.div
        aria-hidden
        variants={art}
        initial="hidden"
        whileInView="show"
        // `amount: 0` (not the shared 0.25): this artwork is deliberately
        // positioned to overflow its section, so a 25% threshold may never be
        // reached and the reveal would never fire — leaving it at opacity 0.
        viewport={{ once: true, amount: 0 }}
        style={{
          width: artTuning.width,
          right: artTuning.offsetX,
          // ALWAYS anchored to the vertical CENTRE, never to `bottom`.
          //
          // A `bottom: N%` offset is a share of the SECTION's height, and that
          // height changes whenever the copy reflows (zoom, font size, a longer
          // paragraph) — so the art visibly slid up and down between screens.
          // Centring pins it to a stable reference; `offsetY` (below) then
          // nudges it from that centre in absolute units, so the relationship
          // to the copy stays identical at every size.
          top: '50%',
        }}
        className="pointer-events-none absolute z-0 opacity-25 sm:opacity-60 lg:opacity-100"
      >
        {/* Separate element for the centring + vertical nudge. Motion animates
            `x` on the wrapper above, which writes to the SAME `transform`
            property — putting the translateY there let Motion overwrite it on
            hydration and the art jumped out of position. */}
        <div style={{ transform: `translateY(calc(-50% + ${artTuning.offsetY}))` }}>
        {/* SafeImage resolves empty/unknown values to the upload placeholder.
            The tilt lives on the IMAGE, not this wrapper, so it never fights
            the centring transform above. */}
        <SafeImage
          src={image}
          alt=""
          width={1100}
          height={900}
          quality={85}
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 62vw, 52vw"
          style={{ transform: `rotate(${artTuning.tilt}deg)` }}
          className="h-auto w-full origin-center object-contain"
        />
        </div>
      </motion.div>
      </div>

      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto w-full max-w-400"
      >
        {/* Left-aligned copy column, capped so it clears the artwork. */}
        <div className="min-w-0 max-w-[72ch] lg:max-w-[88%]">
          <motion.h2
            id={headingId}
            variants={item}
            className="font-jost-extrabold text-balance text-[clamp(1.5rem,1.05rem+2.2vw,3rem)] leading-[1.1] tracking-[0.04em] uppercase"
            style={{ color: headingColor }}
          >
            {heading}
          </motion.h2>

          {/* whitespace-pre-line preserves the admin's line breaks (Enter) —
              without it, `\n` collapses to a single space. */}
          <motion.p
            variants={item}
            className="mt-6 lg:max-w-[65%] text-pretty whitespace-pre-line font-jost-light text-[clamp(0.95rem,0.88rem+0.3vw,1.15rem)] leading-[1.75] lg:mt-40"            style={{ color: bodyColor }}
          >
            {paragraph}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

export function CopyWithArtSectionSkeleton({ backgroundColor }: { backgroundColor: string }) {
  return (
    <section
      className="flex w-full min-h-[70dvh] animate-pulse items-center px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:min-h-dvh lg:px-[7%] lg:py-24 2xl:px-[9%] 2xl:py-28"
      style={{ backgroundColor }}
    >
      <div className="mx-auto w-full max-w-400">
        <div className="max-w-[62ch] lg:max-w-[58%]">
          <div className="h-9 w-72 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-[32rem]" />
          <div className="mt-6 space-y-2.5 lg:mt-8">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-11/12 rounded bg-white/10" />
            <div className="h-4 w-10/12 rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
