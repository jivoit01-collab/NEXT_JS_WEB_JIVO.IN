import { SafeImage } from '@/components/shared';
import { fallbackImage, defaultHeroContent } from '../data/defaults';
import type { SocialInitiativesHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzA2MGIwOCIvPjwvc3ZnPg==';

interface SocialInitiativesHeroProps {
  data?: SocialInitiativesHeroContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function SocialInitiativesHero({ data }: SocialInitiativesHeroProps) {
  const { title, subtitle, image } = data ?? defaultHeroContent;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#060b08]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        className="object-cover object-center motion-safe:animate-[socialHeroZoom_14s_ease-out_forwards]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/28 to-black/62" />
      <div className="absolute inset-0 bg-linear-to-t from-black/82 via-transparent to-black/35" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl justify-center px-4 pt-28 pb-16 text-center sm:px-6 sm:pt-32 lg:justify-end lg:px-8 lg:text-right 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="animate-fadeIn max-w-3xl min-w-0 lg:w-[54%]">
          <p className="font-jost-medium text-xs tracking-[0.34em] text-white/70 uppercase sm:text-sm">
            Our Essence
          </p>
          <h1 className="font-jost-extrabold mt-4 text-4xl leading-none text-balance text-white uppercase sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-pretty text-white/88 sm:text-lg lg:text-xl 2xl:text-2xl">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

export function SocialInitiativesHeroSkeleton() {
  return (
    <section
      aria-hidden
      className="relative flex min-h-screen animate-pulse items-center overflow-hidden bg-[#060b08]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/28 to-black/62" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl justify-center px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:justify-end lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="w-full max-w-3xl lg:w-[54%]">
          <div className="ml-auto h-4 w-40 rounded bg-white/20" />
          <div className="mt-5 ml-auto h-14 w-full rounded bg-white/25 sm:h-18 lg:h-24" />
          <div className="mt-5 ml-auto h-5 w-4/5 rounded bg-white/18" />
        </div>
      </div>
    </section>
  );
}
