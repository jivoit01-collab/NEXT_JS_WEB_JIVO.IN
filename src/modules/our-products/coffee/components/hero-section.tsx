import { SafeImage, isPlaceholderValue } from '@/components/shared/public';
import type { CoffeeHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';
import { COFFEE_ESPRESSO } from '../constants';
import { resolveCtaLink } from '@/lib/cta-link';
import { HeroBottles } from './hero-bottles';

interface Props {
  data?: CoffeeHeroContent;
}

/* ================================================================
   RESPONSIVE MODEL — one composition, scaled to the section

   The section is a SIZE container (`container-type: size`) with a fixed
   height per breakpoint:
     phones (<640)   60svh
     tablets (≥640)  70svh
     desktop (≥1024) 100dvh
   Every position and size below is in container units (cqw / cqh) of that
   box, so the logo, jars and copy keep the SAME relative placement on every
   screen — only the scale changes. Sizes use min(…cqh, …cqw) so the
   composition shrinks by whichever side is tighter and never collides.

   Reference: the approved 1920×945 desktop frame.

   All arbitrary-value classes are kept on ONE line: Tailwind's scanner does
   not reliably emit arbitrary values written inside multi-line template
   literals.
   ================================================================ */

/** Section box — shared by the hero and its skeleton. */
const SECTION_CLASS =
  'relative isolate block h-[60svh] min-h-[22rem] w-full max-w-full overflow-hidden [container-type:size] sm:h-[70svh] lg:h-dvh';

/** JIVO wordmark: top-centre, ~44% of the section height wide on desktop. */
const LOGO_CLASS =
  'absolute top-[max(12cqh,4.5rem)] left-1/2 z-20 w-[min(44cqh,52cqw)] -translate-x-1/2';

/**
 * Jar group: pinned bottom-right, 3% in from the edge, fixed aspect ratio.
 * Width is capped by whichever side is tighter; the cqw cap per breakpoint is
 * as wide as the copy column allows (phones 48, portrait tablets 58, desktop
 * 44), so tall screens don't shrink the jars more than necessary.
 */
const JAR_GROUP_CLASS =
  'pointer-events-none absolute right-[3cqw] bottom-0 z-10 aspect-[1/1.04] w-[min(81cqh,48cqw)] sm:w-[min(81cqh,58cqw)] lg:w-[min(81cqh,44cqw)]';

/** Copy block: bottom-left, 16% up from the bottom edge. */
const COPY_WRAP_CLASS =
  'absolute bottom-[16cqh] left-0 z-30 w-full pl-[6cqw] lg:pl-[8cqw]';

/** Copy column width — keeps the text clear of the jars at every size. */
const COPY_COLUMN_CLASS =
  'flex w-full max-w-[44cqw] min-w-0 flex-col items-start text-left lg:max-w-[34cqw]';

export function CoffeeHero({ data }: Props) {
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
  // Admin-entered links may be bare domains ("shop.jivo.in"); without a scheme
  // the browser resolves them against this page and 404s.
  const cta = resolveCtaLink(ctaHref, '/our-products');

  return (
    <section
      aria-labelledby="coffee-hero-heading"
      // Flat espresso field — this hero has NO background image by design.
      className={`group ${SECTION_CLASS}`}
      style={{ backgroundColor: COFFEE_ESPRESSO }}
    >
      {/* ── CENTER JIVO LOGO — independent of the jar composition ── */}
      <div className={`${LOGO_CLASS} transition-transform duration-700 ease-out group-hover:-translate-y-1`}>
        {/* Inner wrapper carries the entrance animation — putting it on the
            parent would overwrite its -translate-x-1/2 centering. */}
        <div className="animate-canola-hero-rise">
          {isPlaceholderValue(logoImage) ? (
            <span className="font-jost-extrabold block text-center text-[min(12cqh,14cqw)] leading-none tracking-tight text-white">
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
              sizes="(max-width: 1023px) 52vw, 30vw"
              className="mx-auto h-auto w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          )}
        </div>
      </div>

      {/* ============================================================
          JAR COMPOSITION — bottom-right, inset from the edge

                         ┌──────────┐
               ┌───────┐ │   BIG    │   ← gap to the right edge
               │ SMALL │ │   JAR    │
               │  JAR  │ │          │
           ════╧═══════╧═╧══════════╧══  ← bases cropped by the
                                            section's bottom edge

          Both jars sit at % positions inside a fixed-ratio box, so the
          pair scales together without drifting apart.
          ============================================================ */}
      <HeroBottles className={JAR_GROUP_CLASS}>
        <div className="relative h-full w-full">
          {/* ── SMALL JAR — left of the big jar, tucked just behind it ── */}
          {/* Outer wrapper owns the rise-in; the inner one owns hover. Keeping
              them on separate elements stops the keyframe's transform from
              clobbering the hover transform. */}
          {hasSecondBottle ? (
            <div
              style={{ animationDelay: '600ms' }}
              className="animate-coffee-bottle-rise pointer-events-none absolute right-[54%] bottom-[-23%] z-[1] h-full"
            >
              <div className="pointer-events-auto h-full w-auto origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:scale-[1.05] motion-reduce:transform-none motion-reduce:transition-none">
                <SafeImage
                  src={productImageSecondary}
                  alt=""
                  width={680}
                  height={860}
                  priority
                  quality={90}
                  sizes="(max-width: 1023px) 24vw, 20vw"
                  className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_22px_42px_rgba(0,0,0,0.25)]"
                />
              </div>
            </div>
          ) : null}

          {/* ── BIG JAR — the main visual. Taller than the box so its base
              runs off the section bottom. ── */}
          <div
            style={{ animationDelay: '250ms' }}
            className="animate-coffee-bottle-rise pointer-events-none absolute right-[8%] bottom-[-32%] z-[2] h-[122%]"
          >
            <div className="pointer-events-auto h-full w-auto origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-3 hover:scale-[1.05] motion-reduce:transform-none motion-reduce:transition-none">
              <SafeImage
                src={productImage}
                alt=""
                width={1000}
                height={1220}
                priority
                fetchPriority="high"
                quality={90}
                sizes="(max-width: 1023px) 30vw, 24vw"
                className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_30px_65px_rgba(0,0,0,0.24)]"
              />
            </div>
          </div>
        </div>
      </HeroBottles>

      {/* ── BOTTOM-LEFT CONTENT — heading, subtitles, CTA ──
          Font sizes follow the section (cqh) with a readable floor on small
          screens; spacing is in em/cqh so the block keeps its proportions. */}
      <div className={COPY_WRAP_CLASS}>
        <div className={COPY_COLUMN_CLASS}>
          <h1
            id="coffee-hero-heading"
            style={{ animationDelay: '120ms' }}
            className="font-jost-extrabold animate-canola-hero-rise text-balance text-[clamp(1.75rem,min(6.35cqh,4.5cqw),10rem)] leading-[0.98] tracking-[-0.018em] text-white uppercase transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transform-none"
          >
            {heading}
          </h1>

          <div
            style={{ animationDelay: '240ms' }}
            className="animate-canola-hero-rise mt-[max(0.5rem,1.3cqh)] max-w-full text-[clamp(1rem,min(2.7cqh,1.9cqw),4rem)] transition-transform duration-500 ease-out hover:-translate-y-0.5 motion-reduce:transform-none"
          >
            <p className="font-jost-light text-pretty leading-[1.45] text-white/90 transition-colors duration-300 hover:text-white">
              {subtitleLineOne}
            </p>
            {subtitleLineTwo ? (
              <p className="font-jost-light text-pretty leading-[1.45] text-white/90 transition-colors duration-300 hover:text-white">
                {subtitleLineTwo}
              </p>
            ) : null}
          </div>

          <a
            href={cta.href}
            {...(cta.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            style={{
              ['--coffee-espresso' as string]: COFFEE_ESPRESSO,
              animationDelay: '360ms',
            }}
            className="font-jost-extrabold animate-canola-hero-rise mt-[max(1rem,2.1cqh)] inline-flex min-h-11 items-center justify-center rounded-full border-[max(3px,0.27em)] border-white px-[1.85em] py-[0.65em] text-[clamp(0.75rem,min(1.6cqh,1.15cqw),2.5rem)] tracking-[0.18em] text-white uppercase transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:bg-white hover:text-(--coffee-espresso) hover:shadow-[0_16px_38px_rgba(0,0,0,0.26)] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-(--coffee-espresso) focus-visible:outline-none active:translate-y-0 motion-reduce:transform-none"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SKELETON — same box, same container-unit positions
   ================================================================ */

export function CoffeeHeroSkeleton() {
  return (
    <section
      className={`animate-pulse ${SECTION_CLASS}`}
      style={{ backgroundColor: COFFEE_ESPRESSO }}
    >
      <div className={LOGO_CLASS}>
        <div className="aspect-[860/330] w-full rounded-md bg-white/10" />
      </div>

      <div className={JAR_GROUP_CLASS}>
        <div className="absolute right-[54%] bottom-0 h-[77%] w-[40%] rounded-t-[22px] bg-white/5" />
        <div className="absolute right-[8%] bottom-0 h-[90%] w-[50%] rounded-t-[32px] bg-white/10" />
      </div>

      <div className={COPY_WRAP_CLASS}>
        <div className={COPY_COLUMN_CLASS}>
          <div className="h-[clamp(1.75rem,min(6.35cqh,4.5cqw),10rem)] w-3/4 rounded-md bg-white/10" />
          <div className="mt-[max(0.5rem,1.3cqh)] h-[clamp(1rem,min(2.7cqh,1.9cqw),4rem)] w-full rounded bg-white/10" />
          <div className="mt-[max(1rem,2.1cqh)] h-11 w-24 rounded-full bg-white/10 lg:h-[max(2.75rem,5.3cqh)] lg:w-[max(6rem,11cqh)]" />
        </div>
      </div>
    </section>
  );
}
