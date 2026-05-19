import { SafeImage } from '@/components/shared';
import { defaultHeroContent, fallbackImage } from '../data/defaults';
import type { OurFairShareHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzFlMjExYiIvPjwvc3ZnPg==';

interface OurFairShareHeroSectionProps {
  data?: OurFairShareHeroContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function OurFairShareHeroSection({ data }: OurFairShareHeroSectionProps) {
  const { title, subtitle, description, image } = data ?? defaultHeroContent;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#161a14]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        className="object-cover motion-safe:animate-[socialHeroZoom_14s_ease-out_forwards]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/18 via-black/8 to-black/34" />
      <div className="absolute inset-0 bg-linear-to-b from-black/18 via-transparent to-black/16" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 pt-28 pb-16 text-center sm:px-6 lg:px-8 lg:text-right 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="animate-fadeIn ml-auto w-full max-w-3xl min-w-0 lg:w-[52%] 2xl:max-w-4xl">
          <h1 className="font-jost-extrabold text-3xl leading-[1.05] text-balance text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.34)] sm:text-4xl md:text-5xl 2xl:text-6xl">
            {title}
          </h1>
          <p className="font-jost-medium mt-4 text-[11px] tracking-[0.18em] text-white/90 uppercase sm:text-xs md:text-sm 2xl:text-base">
            {subtitle}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-base md:text-[17px] lg:ml-auto 2xl:max-w-3xl 2xl:text-xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export function OurFairShareHeroSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative flex min-h-screen animate-pulse items-center overflow-hidden bg-[#161a14]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/18 via-black/8 to-black/34" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 pt-28 pb-16 text-center sm:px-6 lg:px-8 lg:text-right 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="ml-auto w-full max-w-3xl lg:w-[52%] 2xl:max-w-4xl">
          <div className="mx-auto h-10 w-full max-w-2xl rounded bg-white/24 lg:mr-0 2xl:h-16" />
          <div className="mx-auto mt-4 h-4 w-4/5 rounded bg-white/18 lg:mr-0" />
          <div className="mx-auto mt-6 space-y-2 lg:mr-0">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-5/6 rounded bg-white/14 lg:ml-auto" />
            <div className="h-4 w-2/3 rounded bg-white/14 lg:ml-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
