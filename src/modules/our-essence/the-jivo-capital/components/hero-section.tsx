import { SafeImage } from '@/components/shared/public';
import { defaultHeroContent, fallbackImage } from '../data/defaults';
import type { TheJivoCapitalHeroContent } from '../types';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzg0NzA0NSIvPjwvc3ZnPg==';
const HERO_IMAGE_SIZES = '100vw';

interface TheJivoCapitalHeroProps {
  data?: TheJivoCapitalHeroContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function TheJivoCapitalHero({ data }: TheJivoCapitalHeroProps) {
  const { title, description, image } = data ?? defaultHeroContent;

  return (
    <section className="relative min-h-[60svh] overflow-hidden bg-[#75643f] sm:min-h-[70svh] lg:min-h-[100svh]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        priority
        quality={80}
        placeholder="blur"
        blurDataURL={HERO_BLUR}
        className="object-cover object-center"
        sizes={HERO_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/4 via-transparent to-black/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/3 via-transparent to-black/5" />

      <div className="relative z-10 mx-auto flex min-h-[60svh] w-full max-w-7xl items-end justify-center px-3 py-14 text-center sm:min-h-[70svh] sm:px-4 sm:py-16 lg:min-h-[100svh] lg:justify-end lg:px-6 lg:pb-[clamp(3.5rem,8svh,6rem)] lg:text-right xl:px-8 2xl:max-w-screen-2xl 2xl:px-12">
        <div className="w-full max-w-[760px] text-white">
          <h1 className="font-jost-extrabold cursor-default text-[clamp(2rem,8vw,3.25rem)] leading-[0.98] text-balance uppercase drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out will-change-transform hover:-translate-y-1 lg:text-[clamp(2.75rem,4vw,4rem)]">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-[760px] cursor-default text-[clamp(0.9rem,3.8vw,1rem)] leading-relaxed text-pretty text-white/94 drop-shadow-[0_3px_14px_rgba(0,0,0,0.52)] transition-[transform,color] duration-300 ease-out hover:-translate-y-0.5 hover:text-white lg:text-[clamp(1rem,1.18vw,1.25rem)]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export function TheJivoCapitalHeroSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[60svh] animate-pulse overflow-hidden bg-[#75643f] sm:min-h-[70svh] lg:min-h-[100svh]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="relative z-10 mx-auto flex min-h-[60svh] w-full max-w-7xl items-end justify-center px-3 py-14 text-center sm:min-h-[70svh] sm:px-4 sm:py-16 lg:min-h-[100svh] lg:justify-end lg:px-6 lg:pb-[clamp(3.5rem,8svh,6rem)] lg:text-right xl:px-8 2xl:max-w-screen-2xl 2xl:px-12">
        <div className="w-full max-w-[760px]">
          <div className="ml-auto h-12 w-full max-w-xl rounded bg-white/25 sm:h-16 lg:h-20" />
          <div className="mt-5 space-y-2">
            <div className="ml-auto h-4 w-full rounded bg-white/18" />
            <div className="ml-auto h-4 w-5/6 rounded bg-white/18" />
            <div className="ml-auto h-4 w-2/3 rounded bg-white/18" />
          </div>
        </div>
      </div>
    </section>
  );
}
