'use client';

import { SafeImage } from '@/components/shared';
import type { TheStoryFounderContent } from '../types';
import { defaultFounderContent } from '../data/defaults';

interface Props {
  data?: TheStoryFounderContent;
}

/** Founder bio section — dark teal background with portrait. */
export function FounderSection({ data }: Props) {
  const { sectionHeading, title, paragraph, founderImage } = data ?? defaultFounderContent;

  return (
    <section className="bg-[#0a7362] py-14 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
        {/* Section heading — centered */}
        <h2 className="mb-8 text-center font-jost-bold text-2xl uppercase tracking-[0.12em] text-white sm:mb-12 sm:text-3xl md:text-4xl lg:mb-16 lg:text-5xl">
          {sectionHeading}
        </h2>

        {/* Two-column: text + portrait */}
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          {/* Left — text */}
          <div className="order-2 lg:order-1">
            <h3 className="mb-3 font-jost-bold text-base uppercase tracking-wider text-white/90 sm:mb-4 sm:text-lg md:text-xl">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
              {paragraph}
            </p>
          </div>

          {/* Right — portrait */}
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative aspect-[3/4] w-48 overflow-hidden rounded-lg sm:w-56 md:w-64 lg:w-72">
              {founderImage ? (
                <SafeImage
                  src={founderImage}
                  alt="Baba Iqbal Singh Ji — Founding Father"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/10 text-sm text-white/50">
                  Founder Portrait
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
