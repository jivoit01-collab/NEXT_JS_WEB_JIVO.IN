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

      <div className="relative z-10 grid h-full min-h-[58svh] w-full grid-rows-[1fr_auto] px-5 pt-20 pb-8 text-right sm:min-h-[60svh] sm:px-6 sm:pt-24 sm:pb-10 md:min-h-[68svh] md:pt-28 md:pb-12 lg:grid-cols-1 lg:items-end lg:justify-items-end lg:px-0 lg:pb-0 lg:text-center">
        <div className="w-full self-end"></div>
        <div className="w-full max-w-[82vw] min-w-0 self-end text-white sm:max-w-[430px] md:max-w-[520px] lg:mx-auto lg:w-[44vw] lg:max-w-[590px]">
          <h1 className="font-jost-extrabold text-[clamp(1.28rem,5.6vw,1.95rem)] leading-[1.04] text-balance text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.38)] sm:text-[clamp(1.45rem,4.8vw,2.25rem)] md:text-[clamp(1.75rem,4vw,2.9rem)] lg:text-[clamp(1.85rem,2.35vw,3.6rem)]">
            {title}
          </h1>
          <p className="font-jost-medium mt-2 ml-auto max-w-[560px] text-right text-[clamp(0.54rem,2.1vw,0.74rem)] tracking-[0.14em] text-white/92 uppercase sm:mt-3 sm:text-[clamp(0.62rem,1.8vw,0.8rem)] md:text-[clamp(0.68rem,1.4vw,0.88rem)] lg:mx-auto lg:text-center lg:text-[clamp(0.68rem,0.74vw,0.9rem)] lg:tracking-[0.18em]">
            {subtitle}
          </p>
          <p className="mt-3 ml-auto w-full max-w-[560px] text-right text-[clamp(0.62rem,2.35vw,0.82rem)] leading-relaxed text-pretty text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.38)] sm:mt-4 sm:text-[clamp(0.72rem,2vw,0.9rem)] md:text-[clamp(0.78rem,1.55vw,0.98rem)] lg:mx-auto lg:text-center lg:text-[clamp(0.82rem,0.92vw,1.02rem)] 2xl:max-w-[680px]">
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
      <div className="relative z-10 grid h-full min-h-[58svh] w-full grid-rows-[1fr_auto] px-5 pt-20 pb-8 sm:min-h-[60svh] sm:px-6 sm:pt-24 sm:pb-10 md:min-h-[68svh] md:pt-28 md:pb-12 lg:grid-cols-1 lg:items-end lg:justify-items-end lg:px-0 lg:pb-0">
        <div className="w-full self-end"></div>
        <div className="w-full max-w-[82vw] min-w-0 self-end sm:max-w-[430px] md:max-w-[520px] lg:mx-auto lg:w-[44vw] lg:max-w-[590px]">
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
