import { SafeImage } from '@/components/shared/public';
import { baruSahibAssociationHeroFallbackImage, heroSectionData } from '../content-defaults';
import type { BaruSahibAssociationHeroContent } from '../types';

interface BaruSahibAssociationHeroProps {
  data?: BaruSahibAssociationHeroContent;
}

const HERO_IMAGE_SIZES = '100vw';

function imageWithFallback(image: string) {
  return image || baruSahibAssociationHeroFallbackImage;
}

export function BaruSahibAssociationHero({ data }: BaruSahibAssociationHeroProps) {
  const { title, description, image } = data ?? heroSectionData;

  return (
    <section className="relative flex min-h-[55svh] items-center overflow-hidden bg-[#07100b] sm:min-h-[60svh] md:min-h-[75svh] lg:min-h-[95svh] xl:min-h-screen">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        quality={100}
        unoptimized
        className="object-cover object-center"
        sizes={HERO_IMAGE_SIZES}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl px-4 pt-20 pb-10 sm:px-6 sm:pt-24 sm:pb-12 md:pt-28 md:pb-14 lg:justify-end lg:px-8 lg:pt-20 lg:pb-24 2xl:max-w-screen-2xl 2xl:px-20 2xl:pt-52 2xl:pb-36">
        <div className="animate-fadeIn max-w-3xl min-w-0 lg:w-[54%]">
          <h1 className="font-jost-extrabold text-3xl leading-[0.95] text-balance text-white uppercase sm:text-4xl md:text-6xl lg:text-5xl 2xl:text-7xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-pretty text-white/90 sm:text-base md:text-lg lg:mt-5 lg:text-xl 2xl:mt-7 2xl:max-w-3xl 2xl:text-2xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export function BaruSahibAssociationHeroSkeleton() {
  return (
    <section
      aria-hidden
      className="bg-muted relative flex min-h-[55svh] animate-pulse items-center overflow-hidden sm:min-h-[60svh] md:min-h-[75svh] lg:min-h-[95svh] xl:min-h-screen"
    >
      <div className="from-muted-foreground/25 via-muted-foreground/10 to-muted-foreground/25 absolute inset-0 bg-linear-to-r" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl px-4 pt-20 pb-10 sm:px-6 sm:pt-24 sm:pb-12 md:pt-28 md:pb-14 lg:justify-end lg:px-8 lg:pt-40 lg:pb-24 2xl:max-w-screen-2xl 2xl:px-20 2xl:pt-52 2xl:pb-36">
        <div className="w-full max-w-3xl lg:w-[54%]">
          <div className="bg-muted-foreground/20 h-10 w-5/6 rounded-md sm:h-12 md:h-16 lg:h-18 2xl:h-20" />
          <div className="bg-muted-foreground/20 mt-3 h-10 w-2/3 rounded-md sm:h-12 md:h-16 lg:h-18 2xl:h-20" />
          <div className="mt-5 max-w-2xl space-y-2 2xl:mt-7 2xl:max-w-3xl">
            <div className="bg-muted-foreground/15 h-4 w-full rounded sm:h-5 2xl:h-6" />
            <div className="bg-muted-foreground/15 h-4 w-5/6 rounded sm:h-5 2xl:h-6" />
            <div className="bg-muted-foreground/15 h-4 w-2/3 rounded sm:h-5 2xl:h-6" />
          </div>
        </div>
      </div>
    </section>
  );
}
