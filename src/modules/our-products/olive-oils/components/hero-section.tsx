import { ArrowRight } from 'lucide-react';
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
      className="group relative isolate min-h-[62svh] overflow-hidden sm:min-h-[72svh] lg:min-h-dvh"
      style={{ backgroundColor: OLIVE_HERO }}
    >
      {/* ── Centred JIVO wordmark ─────────────────────────────── */}
      <div
        className="
          absolute top-[15%] left-1/2 z-20
          w-[52vw] max-w-[420px] min-w-[170px] -translate-x-1/2
          transition-transform duration-700 ease-out
          group-hover:-translate-y-1
          sm:w-[46vw] lg:w-[38vw]
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
        className="
          pointer-events-none absolute bottom-[6%] z-10
          right-[-3vw] lg:right-[-2vw]
          flex h-[40%] w-[52vw] items-end justify-end
          min-w-[210px] max-w-[560px]
          sm:h-[50%] sm:w-[48vw]
          md:h-[58%] md:w-[44vw]
          lg:h-[66%] lg:w-[40vw]
          xl:h-[70%] xl:w-[37vw]
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
        className="
          absolute bottom-[12%] left-0 z-30
          flex w-full max-w-[52vw] flex-col items-start
          px-5 text-left
          sm:max-w-[50vw] sm:px-8
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
            mt-6 inline-flex min-h-12 items-center justify-center gap-2
            rounded-full border-4 border-white px-9 py-3
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
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
          />
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
      <div className="absolute right-[-4vw] bottom-[6%] flex h-[42%] w-[66vw] max-w-[760px] min-w-[240px] items-end justify-end gap-[2%] sm:h-[50%] sm:w-[62vw] md:h-[58%] md:w-[58vw] lg:right-[-2vw] lg:h-[64%] lg:w-[52vw] xl:h-[68%] xl:w-[48vw]">
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
