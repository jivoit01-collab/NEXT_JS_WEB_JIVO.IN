import { SafeImage, isPlaceholderValue } from '@/components/shared/public';
import type { RefinedGoldOilsHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';
import { GOLD_MAROON } from '../constants';
import { resolveCtaLink } from '@/lib/cta-link';
import { HeroBottles } from './hero-bottles';

interface Props {
  data?: RefinedGoldOilsHeroContent;
}

export function RefinedGoldOilsHero({ data }: Props) {
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
      aria-labelledby="refined-gold-hero-heading"
      // MOBILE (< sm): normal stacked flow — logo, then bottles, then the
      // heading/copy/CTA block. The absolute overlay layout below is gated
      // behind sm:, so every desktop breakpoint keeps its current positions.
      className="group relative isolate flex w-full max-w-full flex-col items-center overflow-hidden pt-24 pb-10 sm:block sm:min-h-[72svh] sm:pt-0 sm:pb-0 lg:min-h-dvh"
      style={{ backgroundColor: GOLD_MAROON }}
    >
      {/* ============================================================
          CENTER JIVO LOGO

          Keep this independent from the bottle composition.
          ============================================================ */}
      {/* Width is an INLINE STYLE, not `w-[58vw]`. Tailwind's scanner does not
          reliably emit arbitrary values written inside multi-line template
          literals — that class produced NO CSS, so the logo had no width,
          collapsed, and drifted off-centre. An inline width always applies;
          because inline styles beat classes, the responsive sizing has to live
          here too, hence one clamp() covering mobile → desktop. */}
      <div
        style={{ width: 'clamp(170px, 52vw, 420px)' }}
        className="
          relative
          z-20
          mx-auto
          min-w-[170px]

          sm:absolute
          sm:top-[16%]
          sm:left-1/2
          sm:mx-0
          sm:-translate-x-1/2

          transition-transform
          duration-700
          ease-out

          group-hover:-translate-y-1
        "
      >
        {/* Inner wrapper carries the entrance animation — putting it on the
            parent would overwrite its -translate-x-1/2 centering. */}
        <div className="animate-groundnut-hero-rise">
        {isPlaceholderValue(logoImage) ? (
          <span
            className="
              font-jost-extrabold
              block
              text-center
              text-[clamp(3.5rem,6vw,5rem)]
              leading-none
              tracking-tight
              text-white
            "
          >
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
            className="
              mx-auto
              h-auto
              w-full
              object-contain

              transition-transform
              duration-700
              ease-out

              group-hover:scale-[1.02]
            "
          />
        )}
        </div>
      </div>

      {/* ============================================================
          BOTTLE COMPOSITION

          IMPORTANT:
          This is intentionally oversized.

          The whole group is pushed outside the RIGHT side of the
          viewport so the bottles look like they are entering from
          the side.

          Reference behavior:

                     ┌─────────────────────┐
                     │      BIG BOTTLE     │
                     │                     │────── CROPPED
               ╱─────│                     │
             ╱ SMALL │                     │
            ╱        │                     │
           ╱         └─────────────────────┘

          ============================================================ */}
      {/* ── Bottle group ──────────────────────────────────────────
          ONE rule at every screen size: the box is pinned to the RIGHT edge
          with a 5% bleed (translateX(5%) of the box), and the two bottles hold fixed
          percentage positions inside it. Because both the box and the bottles
          are sized in %, the pair scales with the viewport while their
          overlap and tilt stay identical — mobile through 2xl.

          On mobile it sits in normal flow (between the logo and the copy);
          from sm up it is absolutely positioned, as the design requires. */}
      <HeroBottles
        // ONE box holding BOTH bottles. Their positions are percentages of
        // this box, so the pair scales as a single unit — the small bottle can
        // never drift away from the big one when the screen or zoom changes.
        //
        // Inline rather than Tailwind classes because the scanner does not
        // reliably emit arbitrary values from these multi-line template
        // literals — `w-[78%]` emitted no CSS, which is why the big bottle
        // vanished entirely.
        style={{
          width: 'clamp(13rem, 37vw, 68rem)',
          // FIXED ASPECT RATIO: the box keeps its shape at every screen
          // size, so the two bottles (positioned in % of this box) stay
          // locked together instead of drifting apart on zoom/resize.
          aspectRatio: '1 / 1.05',
        }}
        className="
          pointer-events-none
          relative
          z-10
          self-end
          mt-8

          sm:absolute
          sm:right-0
          sm:bottom-[4%]
          sm:mt-0
        "
      >
        <div className="relative h-full w-full">

          {/* ========================================================
              SMALL BOTTLE

              BEHIND BIG BOTTLE

              Larger than previous implementation.

              It comes from behind the big bottle and leans toward
              the LEFT, exactly giving the "side se nikal rahi hai"
              feeling.
              ======================================================== */}
          {/* Outer wrapper owns the throw-in; the inner one owns the resting
              tilt and hover-straighten. Keeping them on separate elements
              stops the keyframe's transform from clobbering the tilt. */}
          {hasSecondBottle ? (
            <div
              style={{ animationDelay: '250ms' }}
              className="
                animate-groundnut-bottle-throw
                pointer-events-none
                absolute
                left-[5%]
                bottom-[25%]

                z-[1]

                h-[62%]
              "
            >
            <div
              className="
                group/small
                pointer-events-auto
                h-full
                w-auto

                origin-[60%_90%]

                rotate-[-18deg]

                transition-all
                duration-700
                ease-[cubic-bezier(0.22,1,0.36,1)]

                hover:translate-x-4
                hover:rotate-0
                hover:scale-[1.03]

                motion-reduce:transition-none
              "
            >
              <SafeImage
                src={productImageSecondary}
                alt=""
                width={680}
                height={860}
                priority
                quality={90}
                sizes="
                  (max-width: 640px) 40vw,
                  (max-width: 1024px) 34vw,
                  28vw
                "
                className="
                  h-full
                  w-auto
                  max-w-none
                  object-contain
                  object-bottom

                  drop-shadow-[0_22px_42px_rgba(0,0,0,0.25)]
                "
              />
            </div>
            </div>
          ) : null}

          {/* ========================================================
              BIG BOTTLE

              THIS IS THE MAIN VISUAL.

              It is intentionally:
              - much bigger
              - pushed outside right
              - cropped by viewport
              - in front of small bottle

              This produces the exact "bottle coming from side"
              appearance.
              ======================================================== */}
          {/* Outer wrapper owns the throw-in, inner one the hover transforms. */}
          <div
            style={{ animationDelay: '500ms' }}
            className="
              animate-groundnut-bottle-throw
              pointer-events-none
              absolute
              right-[-20%]
              bottom-[0%]

              z-[2]

              h-[100%]
            "
          >
          <div
            className="
              pointer-events-auto
              h-full
              w-auto

              max-w-none

              origin-[50%_94%]

              transition-all
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]

              hover:-translate-y-2
              hover:rotate-[-7deg]
              hover:scale-[1.02]

              motion-reduce:transform-none
              motion-reduce:transition-none
            "
          >
            <SafeImage
              src={productImage}
              alt=""
              width={1000}
              height={1220}
              priority
              fetchPriority="high"
              quality={90}
              sizes="
                (max-width: 640px) 58vw,
                (max-width: 1024px) 60vw,
                52vw
              "
              className="
                h-full
                w-auto
                max-w-none
                object-contain
                object-bottom

                drop-shadow-[0_30px_65px_rgba(0,0,0,0.24)]
              "
            />
          </div>
          </div>
        </div>
      </HeroBottles>

      {/* ============================================================
          CENTER-BOTTOM CONTENT

          Keep the text independent from the bottles.

          The reference has the text centered around the lower
          middle of the screen.
          ============================================================ */}
      <div
        className="
          relative
          z-30
          mt-8

          flex
          w-full
          max-w-full
          min-w-0
          self-stretch
          flex-col
          items-center

          sm:absolute
          sm:bottom-[10%]
          sm:left-1/2
          sm:mt-0
          sm:-translate-x-1/2

          px-5
          text-center
        "
      >
        {/* Heading */}
        <h1
          id="refined-gold-hero-heading"
          style={{ animationDelay: '120ms' }}
          className="
            font-jost-extrabold
            text-balance

            text-[clamp(1.85rem,1.1rem+3.4vw,4.75rem)]

            leading-[0.98]
            tracking-[-0.018em]

            text-white
            uppercase

            animate-groundnut-hero-rise

            transition-all
            duration-500
            ease-out

            hover:-translate-y-1
          "
        >
          {heading}
        </h1>

        {/* Description */}
        <div
          style={{ animationDelay: '240ms' }}
          className="
            mt-4
            max-w-[680px]

            animate-groundnut-hero-rise

            transition-transform
            duration-500
            ease-out

            hover:-translate-y-0.5

            sm:mt-3.5
          "
        >
          <p
            className="
              font-jost-light
              text-[clamp(1.05rem,0.9rem+0.75vw,1.6rem)]
              leading-[1.55]
              text-white/90

              transition-colors
              duration-300

              hover:text-white
            "
          >
            {subtitleLineOne}
          </p>

          {subtitleLineTwo ? (
            <p
              className="
                font-jost-light
                text-[clamp(1.05rem,0.9rem+0.75vw,1.6rem)]
                leading-[1.55]
                text-white/90

                transition-colors
                duration-300

                hover:text-white
              "
            >
              {subtitleLineTwo}
            </p>
          ) : null}
        </div>

        {/* CTA */}
        <a
          href={cta.href}
          {...(cta.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="
            font-jost-extrabold

            group/cta

            mt-6

            animate-groundnut-hero-rise

            inline-flex
            min-h-12

            items-center
            justify-center

            rounded-full
            border-5
            border-white

            px-9
            py-3

            text-[clamp(0.78rem,0.9vw,0.95rem)]
            tracking-[0.18em]

            text-white
            uppercase

            transition-all
            duration-300
            ease-out

            hover:-translate-y-1
            hover:scale-[1.04]
            hover:bg-white
            hover:text-[color:var(--gold-maroon)]
            hover:shadow-[0_16px_38px_rgba(0,0,0,0.26)]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-white
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[color:var(--gold-maroon)]

            active:translate-y-0

            motion-reduce:transform-none
          "
          style={{
            ['--gold-maroon' as string]: GOLD_MAROON,
            animationDelay: '360ms',
          }}
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

export function RefinedGoldOilsHeroSkeleton() {
  return (
    <section
      className="relative min-h-dvh animate-pulse overflow-hidden"
      style={{ backgroundColor: GOLD_MAROON }}
    >
      {/* Center logo */}
      <div
        className="
          absolute
          top-[16%]
          left-1/2
          w-[52vw]
          max-w-[420px]
          min-w-[170px]
          -translate-x-1/2

          sm:w-[50vw]
          lg:w-[46vw]
        "
      >
        <div className="h-20 w-full rounded-md bg-white/10 sm:h-24 lg:h-28" />
      </div>

      {/* Bottle composition */}
      <div
        style={{ width: 'clamp(13rem, 37vw, 68rem)', aspectRatio: '1 / 1.05' }}
        className="
          absolute
          right-0
          bottom-[4%]
        "
      >
        {/* Small bottle */}
        <div
          className="
            absolute
            left-[5%]
            bottom-[25%]
            z-[1]

            h-[62%]
            w-[28%]

            rotate-[-10deg]

            rounded-[22px]
            bg-white/5
          "
        />

        {/* Big bottle */}
        <div
          className="
            absolute
            right-[-20%]
            bottom-[-2%]
            z-[2]

            h-[86%]
            w-[58%]

            sm:h-[95%]
            md:h-[104%]
            lg:h-[112%]

            rounded-[42px]
            bg-white/5
          "
        />
      </div>

      {/* Bottom content */}
      <div
        className="
          absolute
          bottom-[7%]
          left-1/2

          flex
          w-full
          -translate-x-1/2
          flex-col
          items-center

          px-5
        "
      >
        <div className="h-12 w-72 rounded-md bg-white/10" />

        <div className="mt-4 h-5 w-96 max-w-full rounded bg-white/10" />

        <div className="mt-2 h-5 w-80 max-w-full rounded bg-white/10" />

        <div className="mt-6 h-10 w-32 rounded-full bg-white/10" />
      </div>
    </section>
  );
}