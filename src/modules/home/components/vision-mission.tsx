import { SafeImage } from '@/components/shared';
import { visionMissionContent as defaults } from '../data/home-content';
import type { VisionMissionContent } from '../types';

interface VisionMissionProps {
  data?: VisionMissionContent;
}

export function VisionMission({ data }: VisionMissionProps) {
  const content = data ?? defaults;

  return (
    <section className="relative w-full overflow-hidden py-24 md:py-20">
      <SafeImage
        src={content.backgroundImage || defaults.backgroundImage}
        alt="Nature background"
        fill
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/25" />

      {/* IMPORTANT: Wider container + shift upward */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-white md:px-8">

        {/* ── TOP CONTENT (slightly up, not center-heavy) ── */}
        <div className=''>
          <h2 className="font-sans text-center mb-15 text-2xl font-jost-bold uppercase tracking-[0.15em] md:text-4xl lg:text-[42px]">
            {content.heading}
          </h2>
        </div>
        <div className='w-2/4'>
          <p className=" text-base italic text-white/80 md:text-lg">
            {content.subtitle}
          </p>

          {content.intro && (
            <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base">
              {content.intro}
            </p>
          )}

          {content.intro2 && (
            <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base">
              {content.intro2}
            </p>
          )}
        </div>

        {/* ── VISION + MISSION (spread like design) ── */}
        <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-32">
          
          {/* LEFT SIDE */}
          <div className="max-w-md">
            <h3 className="mb-6 font-sans text-2xl font-jost-extrabold uppercase tracking-[0.15em] md:text-4xl">
              Vision
            </h3>
            <p className="text-base leading-relaxed text-white/85">
              {content.vision}
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="max-w-md md:ml-auto">
            <h3 className="mb-6 font-sans text-2xl font-jost-extrabold uppercase tracking-[0.15em] md:text-4xl">
              Mission
            </h3>
            <p className="text-base leading-relaxed text-white/85">
              {content.mission}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}