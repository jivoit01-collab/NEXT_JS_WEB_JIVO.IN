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
        className="origin-center object-cover object-top motion-safe:animate-[cinematicZoomOut_12s_ease-out_forwards]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/18 via-black/8 to-black/34" />
      <div className="absolute inset-0 bg-linear-to-b from-black/18 via-transparent to-black/16" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 pt-28 pb-16 text-center sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="animate-fadeIn ml-auto w-full max-w-3xl min-w-0 text-center lg:-mt-14 lg:w-[62%] lg:max-w-[760px] lg:translate-x-10 xl:translate-x-16 2xl:-mt-18 2xl:max-w-[880px] 2xl:translate-x-20">
          <div className="mx-auto flex w-full max-w-[720px] flex-col items-center text-center 2xl:max-w-[820px]">
            <h1 className="font-jost-extrabold text-3xl leading-[1.05] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.34)] sm:text-4xl md:text-[2.1rem] lg:text-[2.35rem] lg:whitespace-nowrap xl:text-[2.55rem] 2xl:text-[2.85rem]">
              {title}
            </h1>
            <p className="font-jost-medium mt-3 text-center text-[10px] tracking-[0.18em] text-white/90 uppercase sm:text-xs md:text-[13px] 2xl:text-sm">
              {subtitle}
            </p>
            <p className="mt-4 w-full max-w-[580px] text-center text-sm text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-[15px] md:text-base lg:text-[15px] 2xl:max-w-[660px] 2xl:text-lg">
              {description}
            </p>
          </div>
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
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 pt-28 pb-16 text-center sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="ml-auto w-full max-w-3xl lg:w-[52%] lg:translate-x-10 xl:translate-x-16 2xl:max-w-4xl 2xl:translate-x-20">
          <div className="mx-auto flex w-full max-w-[720px] flex-col items-center">
            <div className="h-10 w-full max-w-2xl rounded bg-white/24 2xl:h-16" />
            <div className="mt-4 h-4 w-4/5 rounded bg-white/18" />
            <div className="mt-6 w-full max-w-[580px] space-y-2">
              <div className="h-4 w-full rounded bg-white/14" />
              <div className="mx-auto h-4 w-5/6 rounded bg-white/14" />
              <div className="mx-auto h-4 w-2/3 rounded bg-white/14" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
