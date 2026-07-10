'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { SafeImage } from '@/components/shared/public';
import { isPlaceholderValue } from '@/components/shared/safe-image';
import { container, scaleIn, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CertificationsBadgesContent } from '../types';
import { defaultBadgesContent } from '../data/defaults';

interface Props {
  data?: CertificationsBadgesContent;
}

/** Responsive grid of certification badge tiles over the shared page background. */
export function BadgesGridSection({ data }: Props) {
  const items = (data ?? defaultBadgesContent).items;
  const prefersReducedMotion = useReducedMotion();
  const containerVariant = prefersReducedMotion ? reducedMotion : container;
  const itemVariant = prefersReducedMotion ? reducedMotion : scaleIn;

  if (!items.length) return null;

  return (
    <section aria-label="Our certifications" className="mt-10 sm:mt-14 lg:mt-16 2xl:mt-20">
      <LazyMotion features={domAnimation}>
        <m.ul
          variants={containerVariant}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="mx-auto grid max-w-md grid-cols-2 gap-4 px-4 sm:max-w-2xl sm:grid-cols-3 sm:gap-5 lg:max-w-3xl lg:gap-6 2xl:max-w-4xl 2xl:gap-8"
        >
          {items.map((badge, i) => (
            <m.li
              key={`${badge.label}-${i}`}
              variants={itemVariant}
              className="list-none [perspective:1000px]"
            >
              <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white/30 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.14)] ring-1 ring-white/45 backdrop-blur-[2px] transition-all duration-500 ease-out will-change-transform [transform-style:preserve-3d] hover:bg-white/45 hover:shadow-[0_24px_55px_rgba(0,0,0,0.18)] hover:[transform:translateY(-10px)_rotateX(5deg)_rotateY(-6deg)_scale(1.025)] sm:p-6 2xl:p-8 dark:bg-white/30 dark:hover:bg-white/45">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/28 via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 translate-x-[-130%] skew-x-[-18deg] bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[130%]"
                />
                {isPlaceholderValue(badge.image) ? (
                  // Fallback until the admin uploads the real transparent logo.
                  <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 text-center transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:[transform:translateZ(28px)]">
                    <BadgeCheck
                      className="h-7 w-7 text-neutral-400 transition-all duration-500 group-hover:scale-110 group-hover:text-[#18805a] sm:h-8 sm:w-8"
                      aria-hidden="true"
                    />
                    <span className="text-pretty text-[11px] font-jost-medium leading-tight text-neutral-600 transition-all duration-500 group-hover:translate-y-0.5 group-hover:text-neutral-900 sm:text-xs">
                      {badge.label}
                    </span>
                  </div>
                ) : (
                  <div className="relative h-full w-full transition-transform duration-500 ease-out group-hover:[transform:translateZ(30px)_scale(1.08)]">
                    <SafeImage
                      src={badge.image}
                      alt={badge.label}
                      fill
                      quality={80}
                      className="object-contain"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                    />
                  </div>
                )}
              </div>
            </m.li>
          ))}
        </m.ul>
      </LazyMotion>
    </section>
  );
}

export function BadgesGridSectionSkeleton() {
  return (
    <section className="mt-10 sm:mt-14 lg:mt-16 2xl:mt-20" aria-hidden="true">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-4 px-4 sm:max-w-2xl sm:grid-cols-3 sm:gap-5 lg:max-w-3xl lg:gap-6 2xl:max-w-4xl 2xl:gap-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-3xl bg-white/40 ring-1 ring-white/40"
          />
        ))}
      </div>
    </section>
  );
}
