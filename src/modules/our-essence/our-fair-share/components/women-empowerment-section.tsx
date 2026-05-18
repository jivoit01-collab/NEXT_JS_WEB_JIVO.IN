import { SafeImage } from '@/components/shared';
import { defaultWomenContent, fallbackImage } from '../data/defaults';
import type { OurFairShareWomenContent } from '../types';

interface WomenEmpowermentSectionProps {
  data?: OurFairShareWomenContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function WomenEmpowermentSection({ data }: WomenEmpowermentSectionProps) {
  const { title, subtitle, description, image } = data ?? defaultWomenContent;

  return (
    <section className="relative min-h-[560px] overflow-hidden bg-[#1b1a17] md:min-h-[620px] lg:min-h-[660px] 2xl:min-h-[760px]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/24 via-black/6 to-black/18" />
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/8 to-black/26" />

      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-start px-4 py-14 text-center sm:px-6 md:min-h-[620px] lg:min-h-[660px] lg:px-8 lg:py-20 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-24">
        <div className="animate-fadeIn mx-auto w-full max-w-3xl text-white lg:mr-[3%] lg:ml-auto lg:w-[54%] 2xl:max-w-4xl">
          <h2 className="font-jost-extrabold text-3xl leading-none tracking-[0.02em] text-balance text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.34)] sm:text-4xl md:text-5xl 2xl:text-6xl">
            {title}
          </h2>
          <p className="font-jost-medium mt-4 text-[10px] tracking-[0.22em] text-white/88 uppercase sm:text-xs 2xl:text-sm">
            {subtitle}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)] sm:text-base 2xl:max-w-3xl 2xl:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export function WomenEmpowermentSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[560px] animate-pulse overflow-hidden bg-[#1b1a17] md:min-h-[620px] lg:min-h-[660px] 2xl:min-h-[760px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-b from-black/24 via-black/6 to-black/18" />
      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-start px-4 py-14 text-center sm:px-6 md:min-h-[620px] lg:min-h-[660px] lg:px-8 lg:py-20 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-24">
        <div className="mx-auto w-full max-w-3xl lg:mr-[3%] lg:ml-auto lg:w-[54%] 2xl:max-w-4xl">
          <div className="mx-auto h-10 w-full max-w-2xl rounded bg-white/24 sm:h-14 2xl:h-18" />
          <div className="mx-auto mt-4 h-4 w-2/3 rounded bg-white/18" />
          <div className="mx-auto mt-5 space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-5/6 rounded bg-white/14" />
            <div className="mx-auto h-4 w-2/3 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
