import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SafeImage, isPlaceholderValue } from '@/components/shared/public';
import type { GroundnutOilsHeroContent } from '../types';
import { defaultHeroContent } from '../data/defaults';
import { GROUNDNUT_BROWN } from '../constants';
import { HeroBottles } from './hero-bottles';

interface Props {
  data?: GroundnutOilsHeroContent;
}

export function GroundnutOilsHero({ data }: Props) {
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
      aria-labelledby="groundnut-hero-heading"
      className="group relative isolate min-h-[62svh] overflow-hidden sm:min-h-[72svh] lg:min-h-dvh"
      style={{ backgroundColor: GROUNDNUT_BROWN }}
    >
      {/* ============================================================
          CENTER JIVO LOGO

          Keep this independent from the bottle composition.
          ============================================================ */}
      <div
        className="
          absolute
          top-[16%]
          left-1/2
          z-20
          w-[52vw]
          max-w-[420px]
          min-w-[170px]
          -translate-x-1/2

          sm:w-[50vw]
          lg:w-[46vw]

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
              font-futura-heavy
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
      <HeroBottles
        className="
          pointer-events-none
          absolute
          right-[-9vw]
          bottom-[4%]
          z-10

          h-[50%]
          w-[68vw]

          min-w-[240px]
          max-w-[800px]

          sm:h-[58%]
          sm:w-[70vw]

          md:h-[68%]
          md:w-[64vw]

          lg:h-[74%]
          lg:w-[58vw]

          xl:h-[76%]
          xl:w-[54vw]
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
                left-[-6%]
                bottom-[24%]

                z-[1]

                h-[58%]

                sm:h-[59%]
                lg:h-[62%]
              "
            >
            <div
              className="
                group/small
                pointer-events-auto
                h-full
                w-auto

                origin-[60%_90%]

                rotate-[-10deg]

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
              right-[-13%]
              bottom-[-2%]

              z-[2]

              h-[86%]

              sm:h-[95%]
              md:h-[104%]
              lg:h-[112%]
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
          absolute
          bottom-[10%]
          left-1/2
          z-30

          flex
          w-full
          -translate-x-1/2
          flex-col
          items-center

          px-5
          text-center
        "
      >
        {/* Heading */}
        <h1
          id="groundnut-hero-heading"
          style={{ animationDelay: '120ms' }}
          className="
            font-futura-heavy
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
              font-futura-light
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
                font-futura-light
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
          href={ctaHref || '/our-products'}
          target="_blank"
          rel="noopener noreferrer"
          className="
            font-futura-heavy

            group/cta

            mt-6

            animate-groundnut-hero-rise

            inline-flex
            min-h-12

            items-center
            justify-center
            gap-2

            rounded-full
            border-2
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
            hover:text-[color:var(--groundnut-brown)]
            hover:shadow-[0_16px_38px_rgba(0,0,0,0.26)]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-white
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[color:var(--groundnut-brown)]

            active:translate-y-0

            motion-reduce:transform-none
          "
          style={{
            ['--groundnut-brown' as string]: GROUNDNUT_BROWN,
            animationDelay: '360ms',
          }}
        >
          {ctaLabel}
          <ArrowRight
            aria-hidden
            className="
              h-4
              w-4

              transition-transform
              duration-300
              ease-out

              group-hover/cta:translate-x-1

              motion-reduce:transform-none
              motion-reduce:transition-none
            "
          />
        </a>
      </div>
    </section>
  );
}

/* ================================================================
   SKELETON
   ================================================================ */

export function GroundnutOilsHeroSkeleton() {
  return (
    <section
      className="relative min-h-dvh animate-pulse overflow-hidden"
      style={{ backgroundColor: GROUNDNUT_BROWN }}
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
        className="
          absolute
          right-[-9vw]
          bottom-[4%]

          h-[50%]
          w-[68vw]

          min-w-[240px]
          max-w-[800px]

          sm:h-[58%]
          sm:w-[70vw]

          md:h-[68%]
          md:w-[64vw]

          lg:h-[74%]
          lg:w-[58vw]

          xl:h-[76%]
          xl:w-[54vw]
        "
      >
        {/* Small bottle */}
        <div
          className="
            absolute
            left-[-6%]
            bottom-[24%]
            z-[1]

            h-[58%]
            w-[28%]

            sm:h-[59%]
            lg:h-[62%]

            rotate-[-10deg]

            rounded-[22px]
            bg-white/5
          "
        />

        {/* Big bottle */}
        <div
          className="
            absolute
            right-[-13%]
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