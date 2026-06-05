import { SafeImage } from '@/components/shared/public';
import {
  defaultOilPlantContent,
  defaultWaterPlantContent,
  fallbackImage,
} from '../data/defaults';
import type { TheJivoCapitalPlantContent } from '../types';

const PLANT_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3Lnczb3JnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzM1MzUzNCIvPjwvc3ZnPg==';
const PLANT_IMAGE_SIZES = '(max-width: 768px) 140vw, (max-width: 1536px) 110vw, 1920px';

interface PlantSectionProps {
  data?: TheJivoCapitalPlantContent;
  fallback: 'oil' | 'water';
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function PlantSection({ data, fallback }: PlantSectionProps) {
  const section = data ?? (fallback === 'oil' ? defaultOilPlantContent : defaultWaterPlantContent);
  const alignRight = section.align === 'right';

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#30302f]">
      <SafeImage
        src={imageWithFallback(section.image)}
        alt=""
        fill
        quality={90}
        placeholder="blur"
        blurDataURL={PLANT_BLUR}
        className="object-cover object-center"
        sizes={PLANT_IMAGE_SIZES}
      />
      <div className="absolute inset-0 bg-black/28" />
      <div
        className={
          alignRight
            ? 'absolute inset-0 bg-linear-to-b from-black/26 via-black/6 to-black/18'
            : 'absolute inset-0 bg-linear-to-r from-black/55 via-black/18 to-black/2'
        }
      />

      <div
        className={`relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl px-5 py-16 text-white sm:px-8 2xl:max-w-screen-2xl 2xl:px-20 ${
          alignRight
            ? 'items-start justify-center pt-[clamp(7rem,14vh,10rem)] text-center lg:justify-end lg:text-right'
            : 'items-end justify-start pb-[clamp(3rem,8vh,5rem)] text-left'
        }`}
      >
        <div
          className={
            alignRight
              ? 'w-full max-w-[780px] lg:mr-[2vw]'
              : 'w-full max-w-[760px] lg:ml-[1vw]'
          }
        >
          <h2 className="font-jost-extrabold text-[clamp(2rem,3.25vw,4.2rem)] leading-[1.08] text-balance drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]">
            {section.title}
          </h2>
          <p className="mt-5 max-w-[820px] text-[clamp(0.86rem,1vw,1.12rem)] leading-relaxed text-pretty text-white/92 drop-shadow-[0_3px_12px_rgba(0,0,0,0.48)]">
            {section.description}
          </p>
        </div>
      </div>
    </section>
  );
}

export function PlantSectionSkeleton({ align = 'left' }: { align?: 'left' | 'right' }) {
  const alignRight = align === 'right';

  return (
    <section aria-hidden className="relative min-h-[100svh] animate-pulse overflow-hidden bg-[#30302f]">
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-black/22" />
      <div
        className={`relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl px-5 py-16 sm:px-8 2xl:max-w-screen-2xl 2xl:px-20 ${
          alignRight
            ? 'items-start justify-center pt-[clamp(7rem,14vh,10rem)] text-center lg:justify-end'
            : 'items-end justify-start pb-[clamp(3rem,8vh,5rem)]'
        }`}
      >
        <div className={alignRight ? 'w-full max-w-[780px]' : 'w-full max-w-[760px]'}>
          <div className={`h-16 w-full max-w-2xl rounded bg-white/24 ${alignRight ? 'ml-auto' : ''}`} />
          <div className="mt-5 space-y-2">
            <div className={`h-4 w-full rounded bg-white/16 ${alignRight ? 'ml-auto' : ''}`} />
            <div className={`h-4 w-5/6 rounded bg-white/16 ${alignRight ? 'ml-auto' : ''}`} />
            <div className={`h-4 w-2/3 rounded bg-white/16 ${alignRight ? 'ml-auto' : ''}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
