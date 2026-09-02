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
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** Keep the arrows' disabled state in sync with the scroll position. */
  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // 2px tolerance: sub-pixel scroll offsets never quite hit the exact edge.
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    syncArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows, { passive: true });
    return () => {
      el.removeEventListener('scroll', syncArrows);
      window.removeEventListener('resize', syncArrows);
    };
  }, [syncArrows]);

  const scrollByPage = useCallback(
    (direction: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      el.scrollBy({
        left: direction * el.clientWidth * 0.8,
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
    },
    [prefersReduced],
  );

  return (
    <section
      aria-labelledby="wheatgrass-range-heading"
      className="overflow-x-clip px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24 2xl:py-28"
      style={{ backgroundColor: WHEATGRASS_SAGE }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto w-full max-w-6xl 2xl:max-w-7xl"
      >
        <motion.h2
          id="wheatgrass-range-heading"
          variants={item}
          className="group/heading mx-auto block w-fit cursor-default text-balance text-center font-jost-extrabold text-[clamp(1.5rem,1.05rem+1.9vw,2.75rem)] leading-[1.12] tracking-[0.1em] text-white uppercase transition-transform duration-300 ease-out hover:-translate-y-0.5"
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

        {/* Carousel: arrows flank a scroll-snapping track. */}
        <div className="relative mt-9 md:mt-10 lg:mt-12">
          <CarouselArrow
            side="left"
            disabled={atStart}
            onClick={() => scrollByPage(-1)}
            label="Previous products"
          />

          <div
            ref={trackRef}
            // The native scrollbar is hidden; arrows and swipe are the intended
            // affordances (the site hides scrollbars globally anyway).
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 md:gap-7 lg:gap-8 2xl:gap-10 [&::-webkit-scrollbar]:hidden"
          >
            {variants.map((variant, i) => (
              <motion.div
                key={`${variant.label}-${i}`}
                variants={cardItem}
                // Two-up on phones, three at md, four from lg — matching the
                // design's four-across desktop row.
                className="w-[calc(50%-0.375rem)] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1.167rem)] lg:w-[calc(25%-1.5rem)]"
              >
                <VariantCard variant={variant} />
              </motion.div>
            ))}
          </div>

          <CarouselArrow
            side="right"
            disabled={atEnd}
            onClick={() => scrollByPage(1)}
            label="Next products"
          />
        </div>
      </motion.div>
    </section>
  );
}

/** Prev/next control. Disabled (and non-interactive) at each end of the track. */
function CarouselArrow({
  side,
  disabled,
  onClick,
  label,
}: {
  side: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-all duration-300 ease-out hover:scale-110 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none md:inline-flex ${
        side === 'left' ? '-left-2 lg:-left-8' : '-right-2 lg:-right-8'
      }`}
    >
      <Icon className="h-8 w-8" strokeWidth={2.5} />
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
    'group block h-full rounded-2xl p-3.5 transition-all duration-500 ease-out sm:p-6 lg:p-8 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.28)]';

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
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">
        <div className="mx-auto h-8 w-72 rounded-md bg-white/20 sm:h-10 lg:h-12 lg:w-[30rem]" />
        <div className="mt-9 flex gap-3 sm:gap-6 md:mt-10 md:gap-7 lg:mt-12 lg:gap-8 2xl:gap-10">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[calc(50%-0.375rem)] shrink-0 rounded-2xl p-3.5 sm:w-[calc(50%-0.75rem)] sm:p-6 md:w-[calc(33.333%-1.167rem)] lg:w-[calc(25%-1.5rem)] lg:p-8"
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
