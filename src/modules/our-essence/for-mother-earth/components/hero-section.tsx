import { SafeImage } from '@/components/shared';
import { defaultHeroContent, fallbackImage } from '../data/defaults';
import type { ForMotherEarthHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzI5MzgyZCIvPjwvc3ZnPg==';

interface MotherEarthHeroSectionProps {
  data?: ForMotherEarthHeroContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function MotherEarthHeroSection({ data }: MotherEarthHeroSectionProps) {
  const { title, quote, quoteAuthor, description, image } = data ?? defaultHeroContent;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#1c261f]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        className="object-cover object-bottom motion-safe:animate-[socialHeroZoom_16s_ease-out_forwards]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/16 via-black/5 to-black/24" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,rgba(255,246,205,0.32),transparent_30%),radial-gradient(circle_at_24%_22%,rgba(143,217,232,0.22),transparent_28%),radial-gradient(circle_at_76%_20%,rgba(144,202,228,0.2),transparent_30%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 pt-28 pb-16 text-center sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="animate-fadeIn mx-auto mt-8 max-w-4xl text-white 2xl:max-w-5xl">
          <h1 className="font-jost-medium text-3xl leading-[1.08] text-balance uppercase drop-shadow-[0_4px_18px_rgba(0,0,0,0.28)] sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
            {title}
          </h1>
          <div className="mx-auto mt-5 max-w-3xl text-xs leading-relaxed text-white/88 sm:text-sm 2xl:max-w-4xl 2xl:text-base">
            <p className="font-jost-medium tracking-[0.08em] italic">{quote}</p>
            <p className="font-jost-medium mt-1">- {quoteAuthor}</p>
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)] sm:text-base md:text-[17px] 2xl:max-w-4xl 2xl:text-xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export function MotherEarthHeroSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative flex min-h-screen animate-pulse items-center overflow-hidden bg-[#1c261f]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,rgba(255,246,205,0.22),transparent_30%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 pt-28 pb-16 text-center sm:px-6 lg:px-8 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="mx-auto mt-8 w-full max-w-4xl 2xl:max-w-5xl">
          <div className="mx-auto h-20 w-full max-w-3xl rounded bg-white/25 sm:h-28 2xl:h-36" />
          <div className="mx-auto mt-5 h-4 w-2/3 rounded bg-white/18" />
          <div className="mx-auto mt-2 h-4 w-36 rounded bg-white/18" />
          <div className="mx-auto mt-6 space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="mx-auto h-4 w-11/12 rounded bg-white/14" />
            <div className="mx-auto h-4 w-4/5 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
