import Link from 'next/link';
import { SafeImage, isPlaceholderValue } from '@/components/shared/public';
import type { CanolaOilsHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';
import { CANOLA_GREEN } from '../constants';
import { HeroBottles } from './hero-bottles';

interface Props {
  data?: CanolaOilsHeroContent;
}

/**
 * Hero — built to the approved UI/UX reference.
 *
 * Composition:
 *   • flat #007363 field; the fixed navbar overlays it
 *   • JIVO wordmark centred in the upper area, modestly sized
 *   • two bottles (1L in front, 5L behind) filling the right half and
 *     cropped by the right edge of the viewport
 *   • "CANOLA OILS" + subtitles + BUY ALL at the lower-left, overlapping
 *     the bottle group slightly
 *
 * Height: fills the viewport (100dvh). Critically, the internal rhythm is
 * distributed with flex ratios rather than svh padding — padding scales with
 * the viewport and pulls the composition apart on tall screens, which is what
 * made an earlier version look stretched. Ratios keep the reference density
 * at every height.
 *
 * Copy and bottles share one grid cell so they overlap while staying in
 * normal flow (responsive.md §6) — no absolute positioning for primary
 * content, and all sizing is %/clamp based, never fixed pixel offsets.
 *
 * Server-rendered for LCP; the headline is never animated.
 */
export function CanolaOilsHero({ data }: Props) {
  const {
    logoImage,
    heading,
    subtitleLineOne,
    subtitleLineTwo,
    ctaLabel,
    ctaHref,
    productImage,
    productImageSecondary,
  } = data ?? defaultHeroContent;

  const hasSecondBottle = !isPlaceholderValue(productImageSecondary);

  return (
    <section
      aria-labelledby="canola-hero-heading"
      className="relative isolate flex h-dvh max-h-[64rem] min-h-[34rem] flex-col overflow-hidden"
      style={{ backgroundColor: CANOLA_GREEN }}
    >
      {/* ── Wordmark band: fixed share of the height, below the navbar ── */}
      <div className="flex shrink-0 basis-[30%] items-center justify-center px-4 pt-14 sm:px-6 lg:pt-16">
        <div className="h-full w-full min-w-0 max-w-[430px] py-2">
          {isPlaceholderValue(logoImage) ? (
            // A placeholder box would read as a broken logo, so set the
            // wordmark in type until a real logo is uploaded.
            <span className="font-futura-heavy flex h-full items-center justify-center text-[clamp(2.5rem,1.5rem+5vw,5rem)] leading-none tracking-[0.04em] text-white">
              JIVO
            </span>
          ) : (
            <SafeImage
              src={logoImage}
              alt="Jivo"
              width={860}
              height={330}
              priority
              fetchPriority="high"
              quality={90}
              sizes="(max-width: 640px) 56vw, (max-width: 1024px) 40vw, 430px"
              className="mx-auto h-full w-auto max-w-full object-contain"
            />
          )}
        </div>
      </div>

      {/* ── Stage: copy + bottles overlap in one cell ─────────────── */}
      <div className="relative grid flex-1 [grid-template-areas:'stack'] *:[grid-area:stack]">
        {/* Bottles — anchored bottom-right, cropped by the viewport edge. */}
        <HeroBottles className="pointer-events-none z-10 flex items-end justify-end">
          {/* pointer-events re-enabled here so the bottles respond to hover
              while the wrapper stays click-through over the copy column. */}
          <div className="group pointer-events-auto relative -mr-[10%] flex h-full w-[64%] items-end sm:-mr-[7%] sm:w-[58%] lg:-mr-[5%] lg:w-[52%] xl:w-[48%]">
            {/* Large bottle (back) — sets the group height. */}
            <SafeImage
              src={productImage}
              alt=""
              width={1000}
              height={1220}
              priority
              fetchPriority="high"
              quality={90}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 42vw, 34vw"
              className="ml-auto block h-full w-auto max-w-full origin-bottom object-contain object-bottom transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
            />

            {/* Small bottle (front) — overlaps the large one's lower left. */}
            {hasSecondBottle ? (
              <SafeImage
                src={productImageSecondary}
                alt=""
                width={680}
                height={860}
                priority
                quality={90}
                sizes="(max-width: 640px) 16vw, (max-width: 1024px) 14vw, 11vw"
                className="absolute bottom-0 left-[8%] h-[72%] w-auto origin-bottom object-contain object-bottom drop-shadow-[0_18px_42px_rgba(0,0,0,0.3)] transition-transform duration-700 ease-out will-change-transform group-hover:-translate-y-2 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
              />
            ) : null}
          </div>
        </HeroBottles>

        {/* Copy — lower-left. Sits in the lower portion of the stage so it
            relates to the bottles instead of drifting to the very bottom. */}
        <div className="z-20 flex items-center px-4 pt-[6%] pb-[8%] sm:px-6 lg:px-10 2xl:px-14">
          <div className="w-[52%] min-w-0 sm:w-full sm:max-w-[26rem] lg:max-w-[30rem]">
            <h1
              id="canola-hero-heading"
              className="font-futura-heavy text-balance text-[clamp(1.75rem,0.95rem+2.9vw,3.25rem)] leading-[1.02] tracking-[0.01em] text-white uppercase"
            >
              {heading}
            </h1>

            <p className="font-futura-light mt-3 max-w-[34ch] text-pretty text-[clamp(0.8rem,0.72rem+0.28vw,1.0625rem)] leading-relaxed text-white/85 transition-colors duration-300 hover:text-white lg:mt-4">
              {subtitleLineOne}
            </p>
            {subtitleLineTwo ? (
              <p className="font-futura-light max-w-[34ch] text-pretty text-[clamp(0.8rem,0.72rem+0.28vw,1.0625rem)] leading-relaxed text-white/85 transition-colors duration-300 hover:text-white">
                {subtitleLineTwo}
              </p>
            ) : null}

            {/* CSS-only hover/focus — keeps the LCP path free of JS. */}
            <Link
              href={ctaHref || '/our-products'}
              className="font-futura-heavy mt-5 inline-flex min-h-11 items-center justify-center rounded-full border-2 border-white px-8 py-2.5 text-[clamp(0.72rem,0.66rem+0.2vw,0.875rem)] tracking-[0.2em] text-white uppercase transition-[background-color,color,transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-[color:var(--canola-green)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.28)] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--canola-green)] focus-visible:outline-none motion-reduce:transform-none lg:mt-7"
              style={{ ['--canola-green' as string]: CANOLA_GREEN }}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CanolaOilsHeroSkeleton() {
  return (
    <section
      className="relative flex h-dvh max-h-[64rem] min-h-[34rem] animate-pulse flex-col overflow-hidden"
      style={{ backgroundColor: CANOLA_GREEN }}
    >
      <div className="flex shrink-0 basis-[30%] items-center justify-center px-4 pt-14 sm:px-6 lg:pt-16">
        <div className="h-[60%] w-full max-w-[430px] rounded-md bg-white/10" />
      </div>
      <div className="grid flex-1 [grid-template-areas:'stack'] *:[grid-area:stack]">
        <div className="flex items-end justify-end">
          <div className="-mr-[10%] h-[86%] w-[64%] rounded-2xl bg-white/5 sm:w-[58%] lg:w-[52%]" />
        </div>
        <div className="flex items-center px-4 pt-[6%] pb-[8%] sm:px-6 lg:px-10 2xl:px-14">
          <div className="w-[52%] sm:w-full sm:max-w-[26rem] lg:max-w-[30rem]">
            <div className="h-9 w-56 rounded-md bg-white/15 sm:h-11 sm:w-72 lg:h-12" />
            <div className="mt-4 h-4 w-full max-w-xs rounded bg-white/10" />
            <div className="mt-2 h-4 w-4/5 max-w-[16rem] rounded bg-white/10" />
            <div className="mt-6 h-11 w-40 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
