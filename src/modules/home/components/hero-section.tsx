import dynamic from 'next/dynamic';
import { SafeImage } from '@/components/shared';
import { heroContent as defaults, defaultHeroSlides } from '../data/home-content';
import type { HeroContent, HeroSlideData } from '../types';

const HeroCarousel = dynamic(
  () => import('./hero-carousel').then((module) => module.HeroCarousel),
  { loading: () => <HeroSkeleton /> },
);

interface HeroSectionProps {
  data?: HeroContent;
  slides?: HeroSlideData[];
  isLoading?: boolean;
}

export function HeroSection({ data, slides, isLoading }: HeroSectionProps) {
  if (isLoading) return <HeroSkeleton />;

  const content = data ?? defaults;
  const logoSrc = content.logo || defaults.logo;

  const heroSectionSlide: HeroSlideData = {
    id: 'hero-section',
    backgroundImage: content.backgroundImage || defaults.backgroundImage,
    headline: content.headline || defaults.headline,
    subtitle: content.subtitle || defaults.subtitle,
    sortOrder: 0,
    isActive: true,
  };

  const extraSlides = slides && slides.length > 0 ? slides : defaultHeroSlides.slice(1);
  const allSlides = [heroSectionSlide, ...extraSlides];

  if (allSlides.length <= 1) {
    return <StaticHero logoSrc={logoSrc} slide={allSlides[0]} />;
  }

  return <HeroCarousel logoSrc={logoSrc} slides={allSlides} />;
}

function StaticHero({ logoSrc, slide }: { logoSrc: string; slide: HeroSlideData }) {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden sm:h-[70vh] lg:h-screen lg:min-h-150">
      <SafeImage
        src={slide.backgroundImage}
        alt={slide.headline}
        fill
        priority
        quality={90}
        sizes="(max-width: 768px) 100vw, 1920px"
        className="object-cover object-[center_30%]"
      />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center text-white sm:gap-7 md:gap-9 lg:gap-12 2xl:gap-16">
        <SafeImage
          src={logoSrc}
          alt="Jivo Logo"
          width={520}
          height={220}
          loading="eager"
          quality={90}
          sizes="(max-width: 640px) 160px, (max-width: 768px) 240px, (max-width: 1024px) 320px, (max-width: 1536px) 400px, 520px"
          className="h-auto w-24 sm:w-40 md:w-52 lg:w-64 xl:w-72 2xl:w-96"
        />

        <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 2xl:gap-6">
          <h1 className="font-jost-bold font-sans text-xl leading-tight tracking-wide text-white uppercase sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
            {slide.headline}
          </h1>
          <p className="font-jost-light max-w-xs text-xs leading-relaxed text-white/80 sm:max-w-md sm:text-sm md:max-w-xl md:text-base lg:text-lg 2xl:max-w-2xl 2xl:text-xl">
            {slide.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="bg-muted relative h-[60vh] w-full animate-pulse overflow-hidden sm:h-[70vh] lg:h-screen lg:min-h-150">
      <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-10 md:gap-12 lg:gap-14 2xl:gap-16">
        <div className="bg-muted-foreground/20 h-16 w-40 rounded-lg sm:h-20 sm:w-52 md:w-60 lg:w-72 2xl:h-24 2xl:w-96" />
        <div className="bg-muted-foreground/20 h-9 w-3/4 max-w-lg rounded-md sm:h-11 md:h-12 2xl:h-16 2xl:max-w-2xl" />
        <div className="-mt-4 flex flex-col items-center gap-2 sm:-mt-6 md:-mt-8">
          <div className="bg-muted-foreground/20 h-4 w-80 rounded md:w-96 2xl:h-5 2xl:w-120" />
          <div className="bg-muted-foreground/20 h-4 w-64 rounded md:w-72 2xl:h-5 2xl:w-96" />
        </div>
      </div>
    </section>
  );
}
