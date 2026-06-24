import { SafeImage } from '@/components/shared/public';
import { defaultHeroContent, fallbackImage } from '../data/defaults';
import type { OurFairShareHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzFlMjExYiIvPjwvc3ZnPg==';
const HERO_IMAGE_SIZES = '100vw';

interface OurFairShareHeroSectionProps {
  data?: OurFairShareHeroContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function OurFairShareHeroSection({ data }: OurFairShareHeroSectionProps) {
  const { title, subtitle, description, image } = data ?? defaultHeroContent;

  return (
    <section className="relative min-h-[58svh] overflow-hidden bg-[#161a14] sm:min-h-[60svh] md:min-h-[68svh] lg:min-h-[100svh]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        quality={80}
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        className="object-cover object-[30%_center] sm:object-[34%_center] md:object-[42%_center] lg:object-top"
        sizes={HERO_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/14 via-black/6 to-black/28" />
      <div className="absolute inset-0 bg-linear-to-b from-black/12 via-transparent to-black/16" />
      <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-black/36 lg:hidden" />

      <div className="relative z-10 mx-auto flex min-h-[58svh] w-full max-w-7xl items-end justify-center px-3 pt-20 pb-9 text-center sm:min-h-[60svh] sm:px-4 sm:pt-24 sm:pb-11 md:min-h-[68svh] md:pt-28 lg:min-h-[100svh] lg:items-center lg:justify-end lg:px-6 lg:pt-24 lg:pb-16 xl:px-8 2xl:max-w-screen-2xl 2xl:px-12">
        <div className="w-full max-w-[92vw] min-w-0 text-white sm:max-w-[500px] md:max-w-[560px] lg:w-[46vw] lg:max-w-[680px]">
          <h1 className="font-jost-extrabold cursor-default text-[clamp(1rem,4.4vw,1.45rem)] leading-[1.05] text-balance text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.48)] transition-all duration-500 ease-out will-change-transform hover:-translate-y-1 hover:drop-shadow-[0_12px_32px_rgba(0,0,0,0.55)] lg:text-[clamp(2rem,2.85vw,2.7rem)]">
            {title}
          </h1>
          <p className="font-jost-medium mx-auto mt-1.5 max-w-[620px] text-center text-[clamp(0.45rem,1.7vw,0.62rem)] tracking-[0.12em] text-white/92 uppercase sm:mt-2 lg:text-[clamp(0.68rem,0.78vw,0.82rem)] lg:tracking-[0.18em]">
            {subtitle}
          </p>
          <p className="mx-auto mt-2 w-full max-w-[560px] cursor-default text-center text-[clamp(0.55rem,2.1vw,0.72rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.44)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:text-white sm:mt-3 lg:text-[clamp(0.86rem,1vw,0.98rem)]">
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
      className="relative min-h-[58svh] animate-pulse overflow-hidden bg-[#161a14] sm:min-h-[60svh] md:min-h-[68svh] lg:min-h-[100svh]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/14 via-black/6 to-black/28" />
      <div className="relative z-10 mx-auto flex min-h-[58svh] w-full max-w-7xl items-end justify-center px-3 pt-20 pb-9 sm:min-h-[60svh] sm:px-4 sm:pt-24 sm:pb-11 md:min-h-[68svh] md:pt-28 lg:min-h-[100svh] lg:items-center lg:justify-end lg:px-6 lg:pt-24 lg:pb-16 xl:px-8 2xl:max-w-screen-2xl 2xl:px-12">
        <div className="w-full max-w-[92vw] min-w-0 sm:max-w-[500px] md:max-w-[560px] lg:w-[46vw] lg:max-w-[680px]">
          <div className="mx-auto h-10 w-full max-w-2xl rounded bg-white/24 sm:h-14 2xl:h-16" />
          <div className="mx-auto mt-4 h-4 w-4/5 rounded bg-white/18" />
          <div className="mx-auto mt-5 w-full max-w-[560px] space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="h-4 w-5/6 rounded bg-white/14" />
            <div className="h-4 w-2/3 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
