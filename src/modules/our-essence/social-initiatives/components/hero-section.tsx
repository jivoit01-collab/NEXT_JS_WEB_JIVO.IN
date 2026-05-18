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
  const {
    title,
    subtitle,
    image,
    alignmentTitle,
    alignmentDescription,
    goalTitle,
    goalDescription,
  } = data ?? defaultHeroContent;

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
      <div className="absolute" />
      <div className="absolute" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 pt-28 pb-16 text-center sm:px-6 sm:pt-32 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="animate-fadeIn ml-auto max-w-3xl min-w-0 lg:w-[54%] lg:text-right">
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

        <div className="mt-16 grid gap-9 md:grid-cols-2 md:gap-12 lg:mt-24 lg:gap-24">
          <HeroStoryBlock title={alignmentTitle} description={alignmentDescription} />
          <HeroStoryBlock title={goalTitle} description={goalDescription} />
        </div>
      </div>
    </section>
  );
}

function HeroStoryBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="animate-fadeIn mx-auto max-w-xl md:mx-0">
      <h2 className="font-jost-bold text-base tracking-[0.14em] text-white uppercase sm:text-lg lg:text-xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-pretty text-white/84 sm:text-base lg:text-lg">
        {description}
      </p>
    </div>
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
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="ml-auto w-full max-w-3xl lg:w-[54%]">
          <div className="ml-auto h-4 w-40 rounded bg-white/20" />
          <div className="mt-5 ml-auto h-14 w-full rounded bg-white/25 sm:h-18 lg:h-24" />
          <div className="mt-5 ml-auto h-5 w-4/5 rounded bg-white/18" />
        </div>
        <div className="mt-16 grid gap-9 md:grid-cols-2 lg:mt-24 lg:gap-24">
          {[0, 1].map((item) => (
            <div key={item} className="mx-auto w-full max-w-xl md:mx-0">
              <div className="h-5 w-56 rounded bg-white/22" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-white/14" />
                <div className="h-4 w-5/6 rounded bg-white/14" />
                <div className="h-4 w-2/3 rounded bg-white/14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
