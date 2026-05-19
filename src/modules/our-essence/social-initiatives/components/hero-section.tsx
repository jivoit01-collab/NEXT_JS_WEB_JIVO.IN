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
    <section className="relative min-h-[100svh] overflow-hidden bg-[#060b08]">
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
      <div className="absolute inset-0 bg-linear-to-b from-black/24 via-black/8 to-black/28" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-5 pt-28 pb-16 text-center sm:px-6 sm:pt-32 lg:block lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="animate-fadeIn mx-auto max-w-xl min-w-0 lg:absolute lg:top-[31%] lg:right-[8.5%] lg:w-[38vw] lg:max-w-[430px] 2xl:right-[10%] 2xl:max-w-[520px]">
          <h1 className="font-jost-extrabold text-[clamp(1.7rem,3.2vw,3.55rem)] leading-[1.04] text-balance text-white uppercase drop-shadow-[0_3px_16px_rgba(0,0,0,0.35)]">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-[350px] text-[clamp(0.78rem,1.2vw,1.2rem)] leading-snug text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.34)] 2xl:max-w-[430px]">
            {subtitle}
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:contents">
          <HeroStoryBlock
            title={alignmentTitle}
            description={alignmentDescription}
            className="lg:absolute lg:bottom-[20%] lg:left-[7%] lg:w-[34vw] lg:max-w-[380px] 2xl:left-[9%] 2xl:max-w-[450px]"
          />
          <HeroStoryBlock
            title={goalTitle}
            description={goalDescription}
            className="lg:absolute lg:right-[8%] lg:bottom-[20%] lg:w-[35vw] lg:max-w-[420px] 2xl:right-[10%] 2xl:max-w-[500px]"
          />
        </div>
      </div>
    </section>
  );
}

function HeroStoryBlock({
  title,
  description,
  className = '',
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={`animate-fadeIn mx-auto max-w-xl text-center md:mx-0 ${className}`}>
      <h2 className="font-jost-bold text-[clamp(0.92rem,1.55vw,1.45rem)] tracking-[0.08em] text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
        {title}
      </h2>
      <p className="mt-2 text-[clamp(0.78rem,1.12vw,1rem)] leading-snug text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
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
      <div className="absolute inset-0 bg-black/26" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 pt-28 pb-16 sm:px-6 sm:pt-32 lg:block lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="mx-auto w-full max-w-xl lg:absolute lg:top-[31%] lg:right-[8.5%] lg:w-[38vw] lg:max-w-[430px]">
          <div className="mx-auto h-10 w-4/5 rounded bg-white/25 sm:h-14" />
          <div className="mx-auto mt-4 h-5 w-3/4 rounded bg-white/18" />
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:contents">
          {[0, 1].map((item) => (
            <div
              key={item}
              className={
                item === 0
                  ? 'mx-auto w-full max-w-xl text-center md:mx-0 lg:absolute lg:bottom-[20%] lg:left-[7%] lg:w-[34vw] lg:max-w-[380px]'
                  : 'mx-auto w-full max-w-xl text-center md:mx-0 lg:absolute lg:right-[8%] lg:bottom-[20%] lg:w-[35vw] lg:max-w-[420px]'
              }
            >
              <div className="mx-auto h-5 w-56 rounded bg-white/22" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-white/14" />
                <div className="mx-auto h-4 w-5/6 rounded bg-white/14" />
                <div className="mx-auto h-4 w-2/3 rounded bg-white/14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
