'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SmartLink } from '@/components/shared/smart-link';
import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { WheatgrassRangeContent, WheatgrassVariant } from '../types';
import { defaultRangeContent } from '../data/defaults';
import { WHEATGRASS_SAGE, WHEATGRASS_CARD_GREEN, WHEATGRASS_CREAM } from '../constants';

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
  data?: WheatgrassRangeContent;
}

/**
 * Section 2 — "HEALTHY WHEATGRASS RANGE OF PRODUCTS".
 *
 * A scroll-snapping carousel on a sage field, with prev/next arrows as in the
 * design. Native scrolling does the work (so touch/trackpad swiping is free and
 * it degrades gracefully without JS); the arrows just scroll by one page.
 */
export function RangeSection({ data }: Props) {
  const { heading, variants } = data ?? defaultRangeContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;
  const cardItem = prefersReduced ? reducedMotion : throwFromLeft;

  const trackRef = useRef<HTMLDivElement>(null);

  /**
   * Continuous, seamless marquee.
   *
   * The card list is rendered TWICE. A rAF loop advances scrollLeft by a few
   * px each frame; once it passes the width of the first copy it subtracts
   * that width, which lands on the identical card in the second copy. The jump
   * is invisible, so the row cycles 1→last→1 forever with no pagination steps
   * and no visible reset.
   */
  const [paused, setPaused] = useState(false);
  // Only animate while the section is actually on screen.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // Start as soon as any part of the row is visible.
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Honour reduced-motion, and idle while off-screen or paused.
    if (prefersReduced || paused || !inView) return;
    const el = trackRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    const SPEED = 40; // px per second — slow, readable drift.

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      // Half the scrollWidth = one full copy of the card list.
      const cycle = el.scrollWidth / 2;
      if (cycle > 0) {
        let next = el.scrollLeft + SPEED * dt;
        // Wrap by subtracting exactly one copy — visually identical, so the
        // loop is seamless rather than snapping back to zero.
        if (next >= cycle) next -= cycle;
        el.scrollLeft = next;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, prefersReduced, inView, variants.length]);

  /** Arrow steps move by ONE card, smoothly, then hand back to the marquee. */
  const handleArrow = useCallback(
    (direction: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      setPaused(true);
      const firstCard = el.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0;
      const step = firstCard ? firstCard.offsetWidth + gap : 240;
      el.scrollBy({ left: direction * step, behavior: prefersReduced ? 'auto' : 'smooth' });
      window.setTimeout(() => setPaused(false), 2500);
    },
    [prefersReduced],
  );

  return (
    <section
      aria-labelledby="wheatgrass-range-heading"
      className="overflow-x-clip px-4 py-14  sm:py-16 md:py-20  lg:py-24 2xl:py-28"
      style={{ backgroundColor: WHEATGRASS_SAGE }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto w-full max-w-[95%] sm:max-w-[82%] lg:max-w-[80%]"
      >
        <motion.h2
          id="wheatgrass-range-heading"
          variants={item}
          className="group/heading mx-auto block w-fit cursor-default text-center font-jost-extrabold text-[clamp(0.95rem,0.5rem+1.6vw,2rem)] leading-[1.12] tracking-[0.08em] whitespace-nowrap text-white uppercase transition-transform duration-300 ease-out hover:-translate-y-0.5"
        >
          <span className="relative inline-block">
            {heading}
            {/* Growing underline on hover, mirroring the nav/footer treatment. */}
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-0 h-[2px] w-0 transition-all duration-500 ease-out group-hover/heading:w-full motion-reduce:transition-none"
              style={{ backgroundColor: WHEATGRASS_CREAM }}
            />
          </span>
        </motion.h2>

        {/* Carousel — FULL-BLEED.
            Negative margins cancel the parent's max-width + section padding, so
            the track spans the whole viewport and cards appear to run in from
            off-screen. `100vw` is deliberate: the site hides scrollbars, so it
            matches the visible width without overflowing.
            Auto-scroll pauses while the pointer is inside this box or a control
            has focus, and resumes — from the same position — when it leaves. */}
        <div
          className="relative mt-9 left-1/2 w-screen max-w-[100vw] -translate-x-1/2 md:mt-10 lg:mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          // Touch: pause while the finger is down, resume shortly after.
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => window.setTimeout(() => setPaused(false), 4000)}
        >
          {/* Desktop/tablet: chevrons pinned to the OUTER edges of the row. */}
          <CarouselArrow
            side="left"
            onClick={() => handleArrow(-1)}
            label="Previous products"
          />

          <div
            ref={trackRef}
            // The native scrollbar is hidden; arrows and swipe are the intended
            // affordances (the site hides scrollbars globally anyway).
            // `overflow-x-auto` clips on BOTH axes, which cut off the cards'
            // hover lift and shadow. Vertical padding (plus matching negative
            // margins so the layout is unchanged) gives that motion room, and
            // the horizontal padding keeps the first/last card's shadow intact.
            // No scroll-snap and no `scroll-smooth`: both fight a continuous
            // rAF marquee, causing stutter. Vertical padding + matching
            // negative margins keep the cards' hover lift/shadow unclipped.
            className="-my-6 flex gap-4 overflow-x-auto px-4 py-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 sm:px-20 md:gap-6 lg:gap-7 lg:px-24 [&::-webkit-scrollbar]:hidden"
          >
            {/* Rendered twice: the marquee wraps by exactly one copy's width,
                so the seam lands on an identical card and is invisible. The
                duplicates are decorative, hence aria-hidden. */}
            {[...variants, ...variants].map((variant, i) => (
              <motion.div
                key={`${variant.label}-${i}`}
                variants={cardItem}
                aria-hidden={i >= variants.length}
                // Fluid width with a generous floor so cards never shrink to
                // thumbnails on sm/md — they grow with the viewport instead.
                className="w-[clamp(14rem,26vw,21rem)] shrink-0"
              >
                <VariantCard variant={variant} />
              </motion.div>
            ))}
          </div>

          <CarouselArrow
            side="right"
            onClick={() => handleArrow(1)}
            label="Next products"
          />
        </div>
      </motion.div>
    </section>
  );
}

/** Prev/next control. The marquee loops, so it never reaches a disabled end. */
function CarouselArrow({
  side,
  onClick,
  label,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  label: string;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      // Solid pill pinned INSIDE the full-bleed track, hard against the
      // screen edge, so it sits over the cards running past it.
      className={`absolute top-1/2 z-20 inline-flex min-h-11 -translate-y-1/2 items-center justify-center gap-1.5 rounded-full bg-black/25 px-3 py-3 text-white backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 hover:bg-black/40 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none sm:px-3.5 ${
        side === 'left' ? 'left-2 sm:left-4 lg:left-6' : 'right-2 sm:right-4 lg:right-6'
      }`}
    >
      {/* Label only on the smallest screens; icon-only from sm up. */}
      {side === 'left' ? <Icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9" strokeWidth={2.5} /> : null}
      <span className="text-xs font-jost-medium tracking-[0.08em] uppercase sm:hidden">
        {side === 'left' ? 'Prev' : 'Next'}
      </span>
      {side === 'right' ? <Icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9" strokeWidth={2.5} /> : null}
    </button>
  );
}

/** One bottle card. Renders as a link when `href` is set, else a plain figure. */
function VariantCard({ variant }: { variant: WheatgrassVariant }) {
  const { image, label, size, href } = variant;

  const inner = (
    <>
      <div className="flex h-[clamp(11rem,30vw,17rem)] items-center justify-center">
        {/* SafeImage resolves empty/unknown values to the upload placeholder,
            so a card never renders an empty hole before art is uploaded. */}
        <SafeImage
          src={image}
          alt={`Jivo healthy wheatgrass juice — ${label} ${size}`}
          width={260}
          height={420}
          quality={85}
          sizes="(max-width: 767px) 45vw, (max-width: 1024px) 30vw, 260px"
          className="h-full w-auto object-contain transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.07]"
        />
      </div>
      <span
        className="mt-3 block text-center font-jost-bold-italic text-xs sm:mt-5 sm:text-sm lg:text-base"
        style={{ color: WHEATGRASS_CREAM }}
      >
        {label}
      </span>
      {size ? (
        <span
          className="mt-1 block text-center font-jost-light text-xs sm:text-sm"
          style={{ color: WHEATGRASS_CREAM }}
        >
          {size}
        </span>
      ) : null}
    </>
  );

  const cardClass =
    'group block h-full rounded-2xl p-3.5 transition-all duration-500 ease-out sm:p-5 lg:p-7 hover:-translate-y-2 hover:shadow-[0_22px_50px_rgba(0,0,0,0.35)] motion-reduce:transform-none motion-reduce:transition-none';

  if (href) {
    return (
      <SmartLink
        href={href}
        aria-label={`View ${label} ${size} Jivo healthy wheatgrass juice`}
        className={`${cardClass} focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--wheatgrass-sage)] focus-visible:outline-none`}
        style={{
          backgroundColor: WHEATGRASS_CARD_GREEN,
          ['--wheatgrass-sage' as string]: WHEATGRASS_SAGE,
        }}
      >
        {inner}
      </SmartLink>
    );
  }

  return (
    <figure className={cardClass} style={{ backgroundColor: WHEATGRASS_CARD_GREEN }}>
      {inner}
    </figure>
  );
}

export function RangeSectionSkeleton() {
  return (
    <section
      className="animate-pulse px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24 2xl:py-28"
      style={{ backgroundColor: WHEATGRASS_SAGE }}
    >
      <div className="mx-auto w-full max-w-[95%] sm:max-w-[82%] lg:max-w-[80%]">
        <div className="mx-auto h-8 w-72 rounded-md bg-white/20 sm:h-10 lg:h-12 lg:w-[30rem]" />
        <div className="mt-9 flex gap-3 sm:gap-6 md:mt-10 md:gap-7 lg:mt-12 lg:gap-8 2xl:gap-10">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[clamp(9.5rem,26vw,15rem)] shrink-0 rounded-2xl p-3.5 sm:p-5 lg:p-7"
              style={{ backgroundColor: WHEATGRASS_CARD_GREEN }}
            >
              <div className="mx-auto h-[clamp(11rem,30vw,17rem)] w-20 rounded-lg bg-white/10" />
              <div className="mx-auto mt-3 h-4 w-20 rounded bg-white/15 sm:mt-5" />
              <div className="mx-auto mt-1.5 h-3 w-12 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
