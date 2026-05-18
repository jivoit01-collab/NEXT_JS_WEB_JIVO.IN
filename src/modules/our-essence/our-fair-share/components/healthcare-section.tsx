import { SafeImage } from '@/components/shared';
import { defaultHealthcareContent, fallbackImage } from '../data/defaults';
import type { OurFairShareHealthcareContent } from '../types';

interface HealthcareSectionProps {
  data?: OurFairShareHealthcareContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function HealthcareSection({ data }: HealthcareSectionProps) {
  const { title, paragraph1, paragraph2, image } = data ?? defaultHealthcareContent;

  return (
    <section className="relative min-h-[560px] overflow-hidden bg-[#172735] md:min-h-[620px] lg:min-h-[660px] 2xl:min-h-[760px]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/14 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-black/12 via-transparent to-black/18" />

      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-start px-4 py-12 sm:px-6 md:min-h-[620px] lg:min-h-[660px] lg:px-8 lg:py-16 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-20">
        <div className="animate-fadeIn w-full max-w-[520px] text-left text-white 2xl:max-w-[640px]">
          <h2 className="font-jost-extrabold text-3xl leading-[1.12] text-balance drop-shadow-[0_3px_14px_rgba(0,0,0,0.34)] sm:text-4xl lg:text-5xl 2xl:text-6xl">
            {title}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] sm:text-base 2xl:text-lg">
            {paragraph1}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-pretty text-white/84 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] sm:text-base 2xl:text-lg">
            {paragraph2}
          </p>
        </div>
      </div>
    </section>
  );
}

export function HealthcareSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[560px] animate-pulse overflow-hidden bg-[#172735] md:min-h-[620px] lg:min-h-[660px] 2xl:min-h-[760px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/14 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-start px-4 py-12 sm:px-6 md:min-h-[620px] lg:min-h-[660px] lg:px-8 lg:py-16 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-20">
        <div className="w-full max-w-[520px] 2xl:max-w-[640px]">
          <div className="h-24 w-full rounded bg-white/24 sm:h-32 2xl:h-40" />
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full rounded bg-white/16" />
            <div className="h-4 w-5/6 rounded bg-white/16" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-11/12 rounded bg-white/14" />
            <div className="h-4 w-4/5 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
