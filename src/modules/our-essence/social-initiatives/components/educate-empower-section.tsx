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
    <section className="relative min-h-[640px] overflow-hidden bg-[#2c1c0f] lg:min-h-[760px]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-[#2c1c0f]/82 via-[#2c1c0f]/42 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/18" />

      <div className="relative z-10 mx-auto flex min-h-[640px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:min-h-[760px] lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="animate-fadeIn max-w-3xl">
          <p className="font-jost-medium text-xs tracking-[0.3em] text-[#f2c676]/80 uppercase">
            Human-Centered Impact
          </p>
          <h2 className="font-jost-extrabold mt-4 text-4xl leading-tight text-balance text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl 2xl:text-7xl">
            {heading}
          </h2>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-base lg:text-lg 2xl:text-xl">
            {paragraph}
          </p>
        </div>
      </div>
    </section>
  );
}

export function EducateEmpowerSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[640px] animate-pulse overflow-hidden bg-[#2c1c0f] lg:min-h-[760px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-[#2c1c0f]/82 via-[#2c1c0f]/42 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[640px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:min-h-[760px] lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
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
    </section>
  );
}
