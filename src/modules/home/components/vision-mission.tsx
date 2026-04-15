import { SafeImage } from '@/components/shared';
import { visionMissionContent as defaults } from '../data/home-content';
import type { VisionMissionContent } from '../types';

interface VisionMissionProps {
  data?: VisionMissionContent;
}

export function VisionMission({ data }: VisionMissionProps) {
  const content = data ?? defaults;

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-24">
      <SafeImage
        src={content.backgroundImage || defaults.backgroundImage}
        alt="Nature background"
        fill
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-white md:px-10">
        {/* ── Top: heading + subtitle + intro — CENTERED ─────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-2xl font-bold uppercase tracking-[0.12em] md:text-4xl">
            {content.heading}
          </h2>

          <p className="mt-3 text-sm italic text-white/85 md:text-base">
            {content.subtitle}
          </p>

          {content.intro && content.intro.trim().length > 0 && (
            <p className="mt-5 text-xs leading-relaxed text-white/85 md:text-sm">
              {content.intro}
            </p>
          )}
        </div>

        {/* ── Vision + Mission — columns, each LEFT-ALIGNED internally ── */}
        <div className="mt-14 grid grid-cols-1 gap-12 md:mt-16 md:grid-cols-2 md:gap-20">
          <div className="text-left">
            <h3 className="mb-4 font-sans text-3xl font-extrabold uppercase tracking-[0.12em] md:text-5xl">
              Vision
            </h3>
            <p className="text-sm leading-relaxed text-white/85 md:text-base">
              {content.vision}
            </p>
          </div>

          <div className="text-left">
            <h3 className="mb-4 font-sans text-3xl font-extrabold uppercase tracking-[0.12em] md:text-5xl">
              Mission
            </h3>
            <p className="text-sm leading-relaxed text-white/85 md:text-base">
              {content.mission}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
