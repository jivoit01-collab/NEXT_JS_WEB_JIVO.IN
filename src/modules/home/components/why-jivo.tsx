'use client';

import {
  whyJivoContent as textDefaults,
  valuePillars as pillarDefaults,
} from '../data/home-content';
import { SafeImage } from '@/components/shared/public';
import { GsapReveal, SplitReveal } from './home-motion';
import type { WhyJivoContent } from '../types';

interface WhyJivoProps {
  data?: WhyJivoContent;
  isLoading?: boolean;
}

export function WhyJivo({ data, isLoading }: WhyJivoProps) {
  if (isLoading) return <WhyJivoSkeleton />;

  const content = data
    ? {
        heading: data.heading,
        subheading: data.subheading,
        leftText: data.leftText,
        rightParagraphs: data.rightParagraphs,
      }
    : textDefaults;

  const pillars = data?.valuePillars ?? pillarDefaults;

  return (
    <section
      className="font-sans px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8 lg:py-28 2xl:py-36"
      style={{ backgroundColor: '#7b593e', color: '#cbc995' }}
    >
      <div className="container mx-auto max-w-6xl 2xl:max-w-7xl">
        {/* ── TOP SECTION ───────────────── */}
        <div className="mb-16 grid grid-cols-1 gap-10 sm:mb-20 md:mb-24 md:grid-cols-2 md:gap-16 lg:gap-20 2xl:mb-28 2xl:gap-24">
          {/* LEFT */}
          <div>
            <SplitReveal
              as="h2"
              text={content.heading}
              className="font-jost-extrabold block text-[clamp(1.75rem,1.2rem+2.6vw,4rem)] leading-[1.05] tracking-tight text-balance uppercase"
            />

            <GsapReveal stagger={0.12} y={26} className="mt-4 space-y-6 sm:mt-6 sm:space-y-8">
              <p className="text-base sm:text-lg md:text-xl 2xl:text-2xl">{content.subheading}</p>
              <p className="text-base leading-relaxed text-pretty italic md:text-lg 2xl:text-xl">
                {content.leftText}
              </p>
            </GsapReveal>
          </div>

          {/* RIGHT */}
          <GsapReveal stagger={0.12} y={26} className="flex flex-col space-y-5 md:pt-2 2xl:space-y-6">
            {content.rightParagraphs.map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-pretty md:text-lg 2xl:text-lg">
                {paragraph}
              </p>
            ))}
          </GsapReveal>
        </div>

        {/* ── VALUE PILLARS ───────────────── */}
        <GsapReveal
          stagger={0.1}
          y={30}
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 md:gap-y-12 lg:grid-cols-6 2xl:gap-x-8 2xl:gap-y-14"
        >
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title + index}
              className="group flex flex-col items-center text-center transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
            >
              <div className="relative mb-4 h-10 w-10 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:mb-5 sm:h-12 sm:w-12 2xl:mb-6 2xl:h-16 2xl:w-16">
                <SafeImage
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  sizes="(max-width: 1536px) 48px, 64px"
                  className="object-contain"
                />
              </div>

              <h3 className="mb-2 text-sm font-jost-bold italic sm:mb-3 md:text-base 2xl:text-lg">
                {pillar.title}
              </h3>

              <p className="text-sm leading-relaxed 2xl:text-base">{pillar.description}</p>
            </div>
          ))}
        </GsapReveal>
      </div>
    </section>
  );
}

// ---- Skeleton ----

export function WhyJivoSkeleton() {
  return (
    <section
      className="animate-pulse px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8 lg:py-28 2xl:py-36"
      style={{ backgroundColor: '#7b593e' }}
    >
      <div className="container mx-auto max-w-6xl 2xl:max-w-7xl">
        {/* Top 2-column */}
        <div className="mb-16 grid grid-cols-1 gap-10 sm:mb-20 md:mb-24 md:grid-cols-2 md:gap-16 lg:gap-20 2xl:mb-28 2xl:gap-24">
          {/* Left */}
          <div className="space-y-5">
            <div className="h-10 w-4/5 rounded-md bg-white/20 2xl:h-14" />
            <div className="h-5 w-2/3 rounded bg-white/15 2xl:h-6" />
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full rounded bg-white/10 2xl:h-5" />
              <div className="h-4 w-5/6 rounded bg-white/10 2xl:h-5" />
            </div>
          </div>
          {/* Right */}
          <div className="flex flex-col space-y-5 md:pt-2 2xl:space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full rounded bg-white/10 2xl:h-5" />
                <div className="h-4 w-5/6 rounded bg-white/10 2xl:h-5" />
              </div>
            ))}
          </div>
        </div>
        {/* Value pillars — 6 columns */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 md:gap-y-12 lg:grid-cols-6 2xl:gap-x-8 2xl:gap-y-14">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 2xl:gap-4">
              <div className="h-10 w-10 rounded-full bg-white/20 sm:h-12 sm:w-12 2xl:h-16 2xl:w-16" />
              <div className="h-4 w-16 rounded bg-white/15 2xl:h-5 2xl:w-20" />
              <div className="w-full space-y-1">
                <div className="h-3 w-full rounded bg-white/10 2xl:h-4" />
                <div className="h-3 w-4/5 rounded bg-white/10 2xl:h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
