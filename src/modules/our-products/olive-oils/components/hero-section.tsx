import { SafeImage, isPlaceholderValue } from '@/components/shared/public';
import type { OliveOilsHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';
import { OLIVE_HERO } from '../constants';
import { resolveCtaLink } from '@/lib/cta-link';
import { HeroBottles } from './hero-bottles';

interface Props {
  data?: OliveOilsHeroContent;
}

/**
 * Olive hero — differs from the other product heroes on purpose:
 *
 *   • THREE packs standing side by side on the right, all UPRIGHT (no tilt)
 *   • each pack a step larger than the last (small → medium → large)
 *   • copy block LEFT-aligned on the left half
 *   • packs throw in from the right in sequence: small first, then medium,
 *     then large (staggered via animation-delay)
 *
 * Server-rendered for LCP; the headline is never animated by JS. The entrance
 * is CSS keyframes (`.animate-olive-bottle-throw`) so nothing on the LCP path
 * waits for hydration, and `HeroBottles` only layers scroll parallax on top.
 */
export function OliveOilsHero({ data }: Props) {
  const {
    logoImage,
    heading,
    subtitleLineOne,
    subtitleLineTwo,
    ctaLabel,
    ctaHref,
    productImage,
    productImageSecondary,
    productImageThree,
  } = data ?? defaultHeroContent;

  // Admin-entered links may be bare domains ("shop.jivo.in"); without a scheme
  // the browser resolves them against this page and 404s.
  const cta = resolveCtaLink(ctaHref, '/our-products');

  /* ════════════════════════════════════════════════════════════
     PACK LINEUP — tuning knobs. Change these to adjust the layout.
     ════════════════════════════════════════════════════════════
     size    : pack height, as a % of the lineup box. Ascending.
     drop    : how far this pack sits BELOW the tallest one, so the
               group steps down-right on a diagonal instead of
               sitting on one flat baseline.
     overlap : how much of THIS pack's right edge is hidden behind
               the next pack. Also the exact distance it slides
               LEFT on hover, which fully reveals it.
     delay   : entrance stagger — smallest arrives first.
     ════════════════════════════════════════════════════════════ */
  const PACK_LAYOUT = [
    { size: 'h-[72%]', drop: 'mb-[14%]', overlap: '-mr-[4%]', delay: '250ms' },
    { size: 'h-[86%]', drop: 'mb-[7%]', overlap: '-mr-[4%]', delay: '450ms' },
    { size: 'h-full', drop: 'mb-0', overlap: '', delay: '650ms' },
  ] as const;

  // Index 0 is the smallest/backmost, 2 the largest/frontmost.
  // Only packs with a real image render, so a 1- or 2-pack setup still works.
  const packs = [productImage, productImageSecondary, productImageThree]
    .map((src, i) => ({ src, ...PACK_LAYOUT[i] }))
    .filter((p) => !isPlaceholderValue(p.src));

  return (
    <section
      aria-labelledby="olive-hero-heading"
      // MOBILE (< sm): normal stacked flow — logo, then packs, then copy+CTA.
      // The absolute overlay layout below only kicks in from sm up, where
      // there is room for the copy to sit beside the pack lineup.
      className="group relative isolate flex flex-col overflow-hidden pt-24 pb-10 sm:block sm:min-h-[72svh] sm:pt-0 sm:pb-0 lg:min-h-dvh"
      style={{ backgroundColor: OLIVE_HERO }}
    >
      {/* ── Centred JIVO wordmark ─────────────────────────────── */}
      <div
        // Static + centred on mobile so it stacks above the packs; absolute
        // from sm up, which restores the original overlay position.
        className="
          relative z-20 mx-auto w-[58vw] max-w-[420px] min-w-[170px]
          transition-transform duration-700 ease-out
          group-hover:-translate-y-1
          sm:absolute sm:top-[15%] sm:left-1/2 sm:mx-0 sm:w-[46vw] sm:-translate-x-1/2
          lg:w-[38vw]
        "
      >
        {/* Inner wrapper carries the entrance animation — putting it on the
            parent would overwrite its -translate-x-1/2 centering. */}
        <div className="animate-olive-hero-rise">
          {isPlaceholderValue(logoImage) ? (
            <span className="font-jost-extrabold block text-center text-[clamp(3.5rem,6vw,5rem)] leading-none tracking-tight text-white">
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
              sizes="(max-width: 640px) 52vw, (max-width: 1024px) 46vw, 420px"
              className="mx-auto h-auto w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          )}
        </div>
      </div>

      {/* ── Three upright packs, right side ───────────────────────
          Laid out as a flex row aligned to their shared baseline, so the
          ascending heights read as one lineup rather than three separate
          images. No rotation anywhere — the design calls for straight packs.

          The group sits far enough right that the largest pack's outer ~10%
          is clipped by the viewport; hovering the section slides the whole
          lineup back into view. */}
      <HeroBottles
        // ONE box holding ALL THREE packs. Their heights/offsets are percentages
        // of this box, so the lineup scales as a single unit and the packs can
        // never drift apart when the screen or zoom changes.
        //
        // The width uses one clamp() and the height comes from a FIXED aspect
        // ratio. Previously width and height scaled on separate curves
        // (sm:h-[50%] sm:w-[48vw], md:h-[58%] md:w-[44vw]...), so the box changed
        // SHAPE per screen and the overlap between packs shifted.
        style={{
          width: 'clamp(min(78vw, 20rem), 36vw, 62rem)',
          aspectRatio: '1 / 1',
        }}
        className="
          pointer-events-none relative z-10 ml-auto mr-[-2%] mt-8
          flex items-end justify-end
          sm:absolute sm:bottom-[6%] sm:mx-0 sm:mr-0 sm:mt-0
          sm:right-[-2%]
        "
      >
        {packs.map((pack, i) => (
          // Outer wrapper owns the throw-in; the inner one owns hover, so the
          // keyframe's transform never clobbers the hover transform.
          //
          // Overlap: every pack after the first is pulled left so its right
          // ~10% tucks BEHIND the next one. Earlier packs get a lower z-index,
          // so the taller pack in front does the hiding. Hovering a pack slides
          // it right by that same amount and lifts it above its neighbour, so
          // the full label is revealed.
          <div
            key={i}
            style={{
              animationDelay: pack.delay,
              // Later packs sit in front (higher z), matching the design where
              // each pack partially covers the one behind it.
              zIndex: i + 1,
            }}
            className={`animate-olive-bottle-throw group/pack relative flex items-end ${pack.size} ${pack.drop} ${pack.overlap}`}
          >
            <div
              className="
                pointer-events-auto h-full w-auto origin-bottom
                transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover/pack:z-30 group-hover/pack:-translate-y-2
                group-hover/pack:-translate-x-[5%] group-hover/pack:scale-[1.04]
                motion-reduce:transform-none motion-reduce:transition-none
              "
            >
              <SafeImage
                src={pack.src}
                alt=""
                width={620}
                height={1000}
                priority={i === packs.length - 1}
                fetchPriority={i === packs.length - 1 ? 'high' : 'auto'}
                quality={90}
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 19vw, 16vw"
                className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_26px_55px_rgba(0,0,0,0.26)]"
              />
            </div>
          </div>
        ))}
      </HeroBottles>

      {/* ── Copy — LEFT aligned on the left half ──────────────── */}
      <div
        // Width is capped short of the pack lineup so the copy never sits
        // underneath it — the packs occupy roughly the right 40%.
        // Mobile: in-flow below the packs, full width. From sm up it returns
        // to the absolute lower-left block, capped short of the pack lineup.
        className="
          relative z-30 mt-8 flex w-full max-w-full flex-col items-start
          px-5 text-left
          sm:absolute sm:bottom-[12%] sm:left-0 sm:mt-0 sm:max-w-[50vw] sm:px-8
          lg:max-w-[46vw] lg:px-14
          2xl:px-20
        "
      >
        <h1
          id="olive-hero-heading"
          style={{ animationDelay: '120ms' }}
          className="
            font-jost-extrabold animate-olive-hero-rise text-balance
            text-[clamp(1.6rem,1rem+2.6vw,3.4rem)]
            leading-[1.02] tracking-[-0.012em] text-white uppercase
            transition-transform duration-500 ease-out hover:-translate-y-1
            motion-reduce:transform-none
          "
        >
          {heading}
        </h1>

        <div
          style={{ animationDelay: '240ms' }}
          className="animate-olive-hero-rise mt-3 max-w-[52ch]"
        >
          <p className="font-jost-light text-[clamp(0.85rem,0.75rem+0.45vw,1.15rem)] leading-[1.5] text-white/90 transition-colors duration-300 hover:text-white">
            {subtitleLineOne}
          </p>
          {subtitleLineTwo ? (
            <p className="font-jost-light text-[clamp(0.85rem,0.75rem+0.45vw,1.15rem)] leading-[1.5] text-white/90 transition-colors duration-300 hover:text-white">
              {subtitleLineTwo}
            </p>
          ) : null}
        </div>

        <a
          href={cta.href}
          {...(cta.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          style={{
            ['--olive-hero' as string]: OLIVE_HERO,
            animationDelay: '360ms',
          }}
          className="
            font-jost-extrabold group/cta animate-olive-hero-rise
            mt-6 inline-flex min-h-12 items-center justify-center rounded-full border-4 border-white px-9 py-3
            text-[clamp(0.75rem,0.85vw,0.9rem)] tracking-[0.18em] text-white uppercase
            transition-all duration-300 ease-out
            hover:-translate-y-1 hover:scale-[1.04] hover:bg-white
            hover:text-[color:var(--olive-hero)]
            hover:shadow-[0_16px_38px_rgba(0,0,0,0.26)]
            focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2
            focus-visible:ring-offset-[color:var(--olive-hero)] focus-visible:outline-none
            active:translate-y-0
            motion-reduce:transform-none
          "
        >
          {ctaLabel}

        </a>
      </div>
    </section>
  );
}

/* ================================================================
   SKELETON
   ================================================================ */

export function OliveOilsHeroSkeleton() {
  return (
    <section
      className="relative min-h-[62svh] animate-pulse overflow-hidden sm:min-h-[72svh] lg:min-h-dvh"
      style={{ backgroundColor: OLIVE_HERO }}
    >
      {/* Centre logo */}
      <div className="absolute top-[15%] left-1/2 w-[52vw] max-w-[420px] min-w-[170px] -translate-x-1/2 sm:w-[46vw] lg:w-[38vw]">
        <div className="h-20 w-full rounded-md bg-white/10 sm:h-24 lg:h-28" />
      </div>

      {/* Three packs */}
      <div
        style={{ width: 'clamp(min(78vw, 20rem), 36vw, 62rem)', aspectRatio: '1 / 1' }}
        className="absolute right-[-2%] bottom-[6%] flex items-end justify-end gap-[2%]"
      >
        <div className="h-[74%] w-[28%] rounded-[18px] bg-white/5" />
        <div className="h-[87%] w-[30%] rounded-[18px] bg-white/5" />
        <div className="h-full w-[32%] rounded-[18px] bg-white/5" />
      </div>

      {/* Copy */}
      <div className="absolute bottom-[12%] left-0 flex w-full max-w-[92vw] flex-col items-start px-5 sm:max-w-[62vw] sm:px-8 lg:max-w-[48vw] lg:px-14 2xl:px-20">
        <div className="h-10 w-72 max-w-full rounded-md bg-white/10" />
        <div className="mt-4 h-4 w-96 max-w-full rounded bg-white/10" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-white/10" />
        <div className="mt-6 h-11 w-36 rounded-full bg-white/10" />
      </div>
    </section>
  );
}
