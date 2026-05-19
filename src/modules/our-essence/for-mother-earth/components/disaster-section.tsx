import { SafeImage } from '@/components/shared';
import { defaultDisasterContent, fallbackImage } from '../data/defaults';
import type { ForMotherEarthDisasterContent } from '../types';

interface DisasterSectionProps {
  data?: ForMotherEarthDisasterContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function DisasterSection({ data }: DisasterSectionProps) {
  const { title, description, image } = data ?? defaultDisasterContent;

  return (
    <section className="relative min-h-[560px] overflow-hidden bg-[#201a11] md:min-h-[620px] lg:min-h-[660px] 2xl:min-h-[760px]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/38 via-black/18 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-[#c08735]/22 via-transparent to-black/22" />

      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-center px-4 py-16 sm:px-6 md:min-h-[620px] lg:min-h-[660px] lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="animate-fadeIn w-full max-w-3xl text-left text-white 2xl:max-w-4xl">
          <h2 className="font-jost-extrabold text-3xl leading-[1.08] text-balance drop-shadow-[0_3px_14px_rgba(0,0,0,0.34)] sm:text-4xl lg:text-5xl 2xl:text-6xl">
            {title}
          </h2>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] sm:text-base 2xl:max-w-3xl 2xl:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export function DisasterSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[560px] animate-pulse overflow-hidden bg-[#201a11] md:min-h-[620px] lg:min-h-[660px] 2xl:min-h-[760px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/38 via-black/18 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-center px-4 py-16 sm:px-6 md:min-h-[620px] lg:min-h-[660px] lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="w-full max-w-3xl 2xl:max-w-4xl">
          <div className="h-12 w-full max-w-lg rounded bg-white/24 sm:h-14 2xl:h-18" />
          <div className="mt-6 max-w-2xl space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-11/12 rounded bg-white/14" />
            <div className="h-4 w-4/5 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
