import { SafeImage } from '@/components/shared';
import { fallbackImage, defaultEducateContent } from '../data/defaults';
import type { SocialInitiativesEducateContent } from '../types';

interface EducateEmpowerSectionProps {
  data?: SocialInitiativesEducateContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function EducateEmpowerSection({ data }: EducateEmpowerSectionProps) {
  const { heading, paragraph, image } = data ?? defaultEducateContent;

  return (
    <section className="overflow-hidden bg-[#2c1c0f]">
      <div className="grid min-h-[620px] grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative flex min-w-0 items-center px-4 py-16 sm:px-6 lg:px-8 2xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(255,210,132,0.24),transparent_38%)]" />
          <div className="animate-fadeIn relative z-10 max-w-3xl">
            <p className="font-jost-medium text-xs tracking-[0.3em] text-[#f2c676]/70 uppercase">
              Human-Centered Impact
            </p>
            <h2 className="font-jost-extrabold mt-4 text-4xl leading-tight text-balance text-white uppercase sm:text-5xl lg:text-6xl 2xl:text-7xl">
              {heading}
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-pretty text-white/82 sm:text-base lg:text-lg 2xl:text-xl">
              {paragraph}
            </p>
          </div>
        </div>

        <div className="group relative min-h-[420px] overflow-hidden bg-[#1b130b] lg:min-h-[620px]">
          <SafeImage
            src={imageWithFallback(image)}
            alt={heading}
            fill
            loading="lazy"
            className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/38 via-transparent to-black/18" />
        </div>
      </div>
    </section>
  );
}

export function EducateEmpowerSectionSkeleton() {
  return (
    <section aria-hidden className="overflow-hidden bg-[#2c1c0f]">
      <div className="grid min-h-[620px] grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex animate-pulse items-center px-4 py-16 sm:px-6 lg:px-8 2xl:px-20">
          <div className="w-full max-w-3xl">
            <div className="h-4 w-48 rounded bg-white/20" />
            <div className="mt-5 h-12 w-full rounded bg-white/25 sm:h-16" />
            <div className="mt-3 h-12 w-4/5 rounded bg-white/25 sm:h-16" />
            <div className="mt-6 space-y-2">
              <div className="h-4 w-full rounded bg-white/15" />
              <div className="h-4 w-5/6 rounded bg-white/15" />
              <div className="h-4 w-2/3 rounded bg-white/15" />
            </div>
          </div>
        </div>
        <div className="min-h-[420px] animate-pulse bg-white/12 lg:min-h-[620px]" />
      </div>
    </section>
  );
}
