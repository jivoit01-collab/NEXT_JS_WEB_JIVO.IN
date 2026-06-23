import { SafeImage } from '@/components/shared/public';
import { defaultHeroContent, fallbackImage } from '../data/defaults';
import type { ForMotherEarthHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzI5MzgyZCIvPjwvc3ZnPg==';
const HERO_IMAGE_SIZES = '100vw';

interface MotherEarthHeroSectionProps {
  data?: ForMotherEarthHeroContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function MotherEarthHeroSection({ data }: MotherEarthHeroSectionProps) {
  const { title, quote, quoteAuthor, description, image } = data ?? defaultHeroContent;

  return (
    <section className="relative min-h-[56svh] overflow-hidden bg-[#1c261f] sm:min-h-[60svh] md:min-h-[68svh] lg:min-h-[100svh]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        quality={80}
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        className="object-cover object-[50%_48%] sm:object-[50%_46%] md:object-center"
        sizes={HERO_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/8 via-transparent to-black/14" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,rgba(255,246,205,0.18),transparent_32%),radial-gradient(circle_at_24%_22%,rgba(143,217,232,0.1),transparent_30%),radial-gradient(circle_at_76%_20%,rgba(144,202,228,0.1),transparent_32%)]" />

      <div className="relative z-10 mx-auto flex min-h-[56svh] w-full max-w-7xl items-center justify-center px-5 pt-20 pb-8 text-center sm:min-h-[60svh] sm:px-6 sm:pt-24 sm:pb-10 md:min-h-[68svh] lg:min-h-[100svh] lg:items-start lg:px-8 lg:pt-[clamp(6.5rem,15svh,9.25rem)] lg:pb-16 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="mx-auto w-full max-w-[920px] text-white 2xl:max-w-[1100px]">
          <h1 className="font-jost-medium text-[clamp(1.85rem,8vw,3rem)] leading-[1.04] text-balance uppercase drop-shadow-[0_3px_12px_rgba(0,0,0,0.24)] sm:text-[clamp(2.25rem,7vw,3.75rem)] lg:text-[clamp(2rem,4.05vw,5rem)]">
            {title}
          </h1>
          <div className="mx-auto mt-4 max-w-[720px] text-[clamp(0.68rem,2.5vw,0.88rem)] leading-relaxed text-white/95 sm:mt-5 sm:text-[clamp(0.78rem,1.8vw,1rem)] lg:max-w-[780px] lg:text-[clamp(0.72rem,1.02vw,1.05rem)] 2xl:max-w-[880px]">
            <p className="font-jost-medium tracking-[0.08em] italic">{quote}</p>
            <p className="font-jost-medium mt-1">- {quoteAuthor}</p>
          </div>
          <p className="mx-auto mt-4 max-w-[720px] text-[clamp(0.82rem,3vw,1rem)] leading-relaxed text-pretty text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.24)] sm:mt-5 lg:mt-6 lg:max-w-[780px] lg:text-[clamp(0.86rem,1.12vw,1.25rem)] 2xl:max-w-[920px]">
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
      className="relative min-h-[56svh] animate-pulse overflow-hidden bg-[#1c261f] sm:min-h-[60svh] md:min-h-[68svh] lg:min-h-[100svh]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,rgba(255,246,205,0.16),transparent_32%)]" />
      <div className="relative z-10 mx-auto flex min-h-[56svh] w-full max-w-7xl items-center justify-center px-5 pt-20 pb-8 text-center sm:min-h-[60svh] sm:px-6 sm:pt-24 sm:pb-10 md:min-h-[68svh] lg:min-h-[100svh] lg:items-start lg:px-8 lg:pt-[clamp(6.5rem,15svh,9.25rem)] lg:pb-16 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="mx-auto w-full max-w-[920px] 2xl:max-w-[1100px]">
          <div className="mx-auto h-20 w-full max-w-3xl rounded bg-white/25 sm:h-28 2xl:h-36" />
          <div className="mx-auto mt-5 h-4 w-2/3 rounded bg-white/18" />
          <div className="mx-auto mt-2 h-4 w-36 rounded bg-white/18" />
          <div className="mx-auto mt-6 max-w-[780px] space-y-2">
            <div className="h-4 w-full rounded bg-white/14" />
            <div className="mx-auto h-4 w-11/12 rounded bg-white/14" />
            <div className="mx-auto h-4 w-4/5 rounded bg-white/14" />
          </div>
        </div>
      </div>
    </section>
  );
}
