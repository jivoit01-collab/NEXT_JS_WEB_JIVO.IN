import { SafeImage, isPlaceholderValue } from '@/components/shared/public';
import type { WheatgrassHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';
import { WHEATGRASS_GREEN } from '../constants';
import { resolveCtaLink } from '@/lib/cta-link';
import { HeroBottles } from './hero-bottles';

interface Props {
  data?: WheatgrassHeroContent;
}

/**
 * Height of each bottle in the fan, as a % of the group box, indexed left → right.
 * The middle bottle is tallest, its neighbours a step shorter, and the outer
 * pair shortest — the staggered arc from the design.
 */
const BOTTLE_HEIGHT = ['95%', '110%', '125%', '110%', '95%'];

/**
 * Horizontal centre of each bottle as a % of the group box. Evenly spaced with
 * a slight overlap so the fan reads as one cluster rather than five separate
 * bottles.
 */
const BOTTLE_LEFT = ['16%', '31%', '44%', '60%', '76%'];

/**
 * Stacking order: the middle bottle sits in FRONT, with each neighbour tucked
 * progressively behind it — so the overlaps fall away from the centre.
 */
const BOTTLE_Z = [1, 2, 3, 2, 1];

/**
 * Entrance delay per bottle (ms). The CENTRE bottle arrives first (it is the
 * hero flavour), then its two neighbours, then the outer pair — each rising
 * smoothly up from the bottom into place.
 */
const BOTTLE_DELAY = [700, 350, 0, 350, 700];

export function WheatgrassHero({ data }: Props) {
  const {
    logoImage,
    heading,
    subtitleLineOne,
    subtitleLineTwo,
    ctaLabel,
    ctaHref,
    bottles,
  } = data ?? defaultHeroContent;

  // Always render five slots so the fan keeps its shape even when an admin has
  // filled only some of them; SafeImage resolves the gaps to the placeholder.
  const fan = Array.from({ length: 5 }, (_, i) => bottles?.[i] ?? '');

  // Admin-entered links may be bare domains ("shop.jivo.in"); without a scheme
  // the browser resolves them against this page and 404s.
  const cta = resolveCtaLink(ctaHref, '/our-products');

  return (
    <section
      aria-labelledby="wheatgrass-hero-heading"
      // Flat #148311 field per the design — this section has NO background
      // image by design. Copy sits left, the bottle fan right.
      className="group relative isolate block w-full max-w-full overflow-hidden min-h-[54svh] sm:min-h-[72svh] lg:min-h-dvh"
      style={{ backgroundColor: WHEATGRASS_GREEN }}
    >
      {/* ============================================================
          CENTER JIVO LOGO
          ============================================================ */}
      {/* Width is an INLINE STYLE, not `w-[52vw]`. Tailwind's scanner does not
          reliably emit arbitrary values written inside multi-line template
          literals — that class produced NO CSS, so the logo collapsed and
          drifted off-centre. An inline width always applies; because inline
          styles beat classes, the responsive sizing lives here too, hence one
          clamp() covering mobile → desktop. */}
      <div
        style={{ width: 'clamp(200px, 48vw, 470px)' }}
        className="
          absolute
          z-20
          top-[17%]
          left-1/2
          min-w-[170px]
          -translate-x-1/2

          sm:top-[18%]

          transition-transform
          duration-700
          ease-out

          group-hover:-translate-y-1
        "
      >
        {/* Inner wrapper carries the entrance animation — putting it on the
            parent would overwrite its -translate-x-1/2 centering. */}
        <div className="animate-canola-hero-rise">
          {isPlaceholderValue(logoImage) ? (
            <span className="block text-center font-jost-extrabold text-[clamp(3rem,6vw,4.5rem)] leading-none tracking-tight text-white">
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
              sizes="(max-width: 640px) 48vw, (max-width: 1024px) 42vw, 470px"
              className="mx-auto h-auto w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          )}
        </div>
      </div>

      {/* ============================================================
          BOTTLE FAN — five bottles, right side

              ┌─┐   ┌───┐   ┌─┐
            ┌─┤ ├─┐ │   │ ┌─┤ ├─┐
            │ │ │ │ │ 3 │ │ │ │ │
            │1│2│ │ │   │ │ │4│5│
            └─┴─┴─┘ └───┘ └─┴─┴─┘

          Heights stagger (BOTTLE_HEIGHT) and the middle bottle stacks in
          front (BOTTLE_Z). Every bottle is positioned in % of the group box,
          so the arrangement scales intact from mobile to 2xl.
          ============================================================ */}
      <HeroBottles
        // Sizing is inline and expressed with clamp() so ONE declaration covers
        // every breakpoint — inline styles beat classes, so responsive `sm:w-*`
        // classes could not override them anyway. Inline rather than Tailwind
        // arbitrary values because the scanner does not reliably emit them from
        // multi-line template literals.
        style={{
          // SIZE dial: raise the vw term to enlarge the whole fan. Capped so
          // the five bottles stay fully inside the viewport on wide screens.
          width: 'clamp(20rem, 62vw, 74rem)',
          // Fixed aspect ratio keeps the fan's shape locked at every size, so
          // the bottles never drift apart on resize/zoom.
          aspectRatio: '1 / 0.62',
          // Clear gap from the viewport's right edge so the 5th bottle is
          // never clipped. Inline (not `right-6`) because inline styles win
          // over classes and the width above is already inline.
          // ~25px clear of the viewport edge so the 5th bottle is never
          // clipped. Inline (not `right-6`) because inline styles win over
          // classes and the width above is already inline.
          right: '4px',
        }}
        className="
          pointer-events-none
          absolute
          bottom-[-9%]
          z-10

          sm:bottom-[-10%] 
          lg:bottom-[-16%]        
          "
      >
        <div className="relative h-full w-full">
          {fan.map((src, i) => (
            <div
              key={i}
              // Each bottle rises in turn — the outer pair first, the centre
              // bottle last so it lands as the focal point.
              style={{
                left: BOTTLE_LEFT[i],
                height: BOTTLE_HEIGHT[i],
                zIndex: BOTTLE_Z[i],
                animationDelay: `${BOTTLE_DELAY[i]}ms`,
              }}
              // `pointer-events-auto` must sit HERE, on the same element the
              // group's `pointer-events-none` would otherwise disable — a
              // nested re-enable does not restore hover for the whole subtree.
              className="animate-wheatgrass-bottle-rise pointer-events-auto absolute bottom-0"
            >
              <div
                className="
                  h-full
                  w-auto

                  origin-bottom

                  transition-transform
                  duration-500
                  ease-[cubic-bezier(0.22,1,0.36,1)]

                  hover:-translate-y-3
                  hover:scale-[1.06]

                  motion-reduce:transform-none
                  motion-reduce:transition-none
                "
              >
                {/* SafeImage resolves empty/unknown values to the upload
                    placeholder, so an unfilled slot never leaves a hole. */}
                <SafeImage
                  src={src}
                  alt=""
                  width={520}
                  height={1200}
                  priority={i === 2}
                  fetchPriority={i === 2 ? 'high' : undefined}
                  quality={90}
                  sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 15vw"
                  className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_22px_42px_rgba(0,0,0,0.22)]"
                />
              </div>
            </div>
          ))}
        </div>
      </HeroBottles>

      {/* ============================================================
          LEFT CONTENT BOX — heading, subtitles, CTA
          ============================================================ */}
      <div
        className="
          absolute
          z-30
          bottom-25
          left-0

          flex
          w-full
          max-w-full
          min-w-0
          flex-col
          items-start

          px-5
          text-left

          sm:bottom-[14%]
          sm:px-8
          lg:px-[6%]
        "
      >
        {/* Capped so the copy never runs under the bottle fan. */}
        <div className="w-full max-w-[min(88%,26rem)] sm:max-w-[48%] lg:max-w-[34%]">
          <h1
            id="wheatgrass-hero-heading"
            style={{ animationDelay: '120ms' }}
            className="
              animate-canola-hero-rise
              text-balance
              font-jost-extrabold

              text-[clamp(1.6rem,0.95rem+2.7vw,3.75rem)]

              leading-[1.02]
              tracking-[-0.018em]

              text-white
              uppercase

              transition-transform
              duration-500
              ease-out

              hover:-translate-y-1
              motion-reduce:transform-none
            "
          >
            {heading}
          </h1>

          {/* Subtitles. whitespace-pre-line keeps the admin's line breaks —
              the design stacks three short lines here. */}
          <div
            style={{ animationDelay: '240ms' }}
            className="animate-canola-hero-rise mt-4 transition-transform duration-500 ease-out hover:-translate-y-0.5 motion-reduce:transform-none"
          >
            <p className="font-jost-light whitespace-pre-line text-[clamp(0.95rem,0.85rem+0.5vw,1.35rem)] leading-[1.5] text-white/90 transition-colors duration-300 hover:text-white">
              {subtitleLineOne}
            </p>
            {subtitleLineTwo ? (
              <p className="font-jost-light whitespace-pre-line text-[clamp(0.95rem,0.85rem+0.5vw,1.35rem)] leading-[1.5] text-white/90 transition-colors duration-300 hover:text-white">
                {subtitleLineTwo}
              </p>
            ) : null}
          </div>

          {/* CTA — CSS-only hover/focus, so the LCP path stays free of JS. */}
          <a
            href={cta.href}
            {...(cta.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            style={{
              ['--wheatgrass-green' as string]: WHEATGRASS_GREEN,
              animationDelay: '360ms',
            }}
            className="
              animate-canola-hero-rise
              mt-6
              inline-flex
              min-h-11

              items-center
              justify-center

              rounded-full
              border-4
              border-white

              px-7
              py-2.5

              font-jost-medium
              text-[clamp(0.75rem,0.7rem+0.2vw,0.9rem)]
              tracking-[0.14em]

              text-white
              uppercase

              transition-all
              duration-300
              ease-out

              hover:-translate-y-1
              hover:scale-[1.04]
              hover:bg-white
              hover:text-[color:var(--wheatgrass-green)]
              hover:shadow-[0_16px_38px_rgba(0,0,0,0.26)]

              focus-visible:ring-2
              focus-visible:ring-white
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[color:var(--wheatgrass-green)]
              focus-visible:outline-none

              active:translate-y-0
              motion-reduce:transform-none
            "
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SKELETON
   ================================================================ */

export function WheatgrassHeroSkeleton() {
  return (
    <section
      className="relative min-h-[74svh] animate-pulse overflow-hidden sm:min-h-[72svh] lg:min-h-dvh"
      style={{ backgroundColor: WHEATGRASS_GREEN }}
    >
      {/* Center logo */}
      <div
        style={{ width: 'clamp(200px, 48vw, 470px)' }}
        className="absolute top-[7%] left-1/2 min-w-[170px] -translate-x-1/2 sm:top-[10%]"
      >
        <div className="h-16 w-full rounded-md bg-white/10 sm:h-20 lg:h-24" />
      </div>

      {/* Bottle fan */}
      <div
        style={{ width: 'clamp(19rem, 60vw, 78rem)', aspectRatio: '1 / 0.72' }}
        className="absolute right-0 bottom-0 sm:right-[1%] sm:bottom-[2%]"
      >
        <div className="relative h-full w-full">
          {BOTTLE_HEIGHT.map((h, i) => (
            <div
              key={i}
              style={{ left: BOTTLE_LEFT[i], height: h, width: '15%' }}
              className="absolute bottom-0 rounded-t-2xl bg-white/5"
            />
          ))}
        </div>
      </div>

      {/* Left content */}
      <div className="absolute bottom-[8%] left-0 flex w-full flex-col items-start px-5 sm:bottom-[14%] sm:px-8 lg:px-[6%]">
        <div className="w-full max-w-[min(88%,26rem)] sm:max-w-[48%] lg:max-w-[34%]">
          <div className="h-10 w-3/4 rounded-md bg-white/10 sm:h-14" />
          <div className="mt-4 h-4 w-2/3 rounded bg-white/10" />
          <div className="mt-2 h-4 w-1/2 rounded bg-white/10" />
          <div className="mt-6 h-11 w-28 rounded-full bg-white/10" />
        </div>
      </div>
    </section>
  );
}
