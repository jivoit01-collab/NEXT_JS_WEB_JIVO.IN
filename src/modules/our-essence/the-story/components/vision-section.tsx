'use client';

import type { TheStoryVisionContent } from '../types';
import { defaultVisionContent } from '../data/defaults';

interface Props {
  data?: TheStoryVisionContent;
}

/** Vision section — lighter green background, two-column text. */
export function VisionSection({ data }: Props) {
  const { sectionHeading, title, leftColumn, rightColumn } = data ?? defaultVisionContent;

  return (
    <section className="bg-[#7eaf7e] py-14 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
        {/* Heading */}
        <h2 className="mb-4 text-center font-jost-bold text-2xl uppercase tracking-[0.12em] text-white sm:text-3xl md:text-4xl lg:text-5xl">
          {sectionHeading}
        </h2>

        {/* Sub-heading */}
        <h3 className="mb-8 font-jost-medium text-base uppercase tracking-wider text-white/90 sm:mb-10 sm:text-lg md:text-xl lg:mb-14">
          {title}
        </h3>

        {/* Two-column text */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">
            {leftColumn}
          </p>
          <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">
            {rightColumn}
          </p>
        </div>
      </div>
    </section>
  );
}
