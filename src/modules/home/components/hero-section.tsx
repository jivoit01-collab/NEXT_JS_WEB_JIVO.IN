'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { SafeImage } from '@/components/shared';
import { heroContent as defaults, defaultHeroSlides } from '../data/home-content';
import type { HeroContent, HeroSlideData } from '../types';

interface HeroSectionProps {
  data?: HeroContent;
  slides?: HeroSlideData[];
  isLoading?: boolean;
}

export function HeroSection({ data, slides, isLoading }: HeroSectionProps) {
  if (isLoading) return <HeroSectionSkeleton />;

  const content = data ?? defaults;
  const logoSrc = content.logo || defaults.logo;

  // Build the full slides array:
  // Slide 0 = hero section content (from HomePage table)
  // Slide 1+ = carousel slides (from HeroSlide table)
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

  // Single slide — no carousel needed
  if (allSlides.length <= 1) {
    const slide = allSlides[0];
    return (
      <section className="relative h-[60vh] w-full overflow-hidden sm:h-[70vh] lg:h-screen lg:min-h-150">
        <SafeImage
          src={slide.backgroundImage}
          alt={slide.headline}
          fill
          priority
          quality={100}
          sizes="(max-width: 768px) 100vw, 1920px"
          className="object-cover object-[center_30%]"
        />
        {/* Centered column — logo + text vertically & horizontally centered */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center text-white sm:gap-7 md:gap-9 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <SafeImage
              src={logoSrc}
              alt="Jivo Logo"
              width={520}
              height={220}
              priority
              quality={100}
              sizes="(max-width: 640px) 160px, (max-width: 768px) 240px, (max-width: 1024px) 320px, 400px"
              className="h-auto w-24 sm:w-40 md:w-52 lg:w-64 xl:w-72"
            />
          </motion.div>

          <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-sans font-jost-bold uppercase leading-tight tracking-wide text-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
            >
              {slide.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="max-w-65 text-[11px] font-jost-light leading-relaxed text-white/80 sm:max-w-md sm:text-sm md:max-w-xl md:text-base lg:text-lg"
            >
              {slide.subtitle}
            </motion.p>
          </div>
        </div>
      </section>
    );
  }

  return <HeroCarousel logoSrc={logoSrc} slides={allSlides} />;
}

// ---- Carousel (only rendered when 2+ slides) ----

function HeroCarousel({
  logoSrc,
  slides,
}: {
  logoSrc: string;
  slides: HeroSlideData[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 50 }, [
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: false }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="relative h-[60vh] w-full overflow-hidden sm:h-[70vh] lg:h-screen lg:min-h-150">
      {/* Embla viewport */}
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              <SafeImage
                src={slide.backgroundImage}
                alt={slide.headline}
                fill
                priority
                quality={100}
                sizes="(max-width: 768px) 100vw, 1920px"
                className="object-cover object-[center_30%]"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/30" />
            </div>
          ))}
        </div>
      </div>

      {/* Centered column overlay — logo + text vertically & horizontally centered */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 text-center text-white sm:gap-7 md:gap-9 lg:gap-12">
        <SafeImage
          src={logoSrc}
          alt="Jivo Logo"
          width={520}
          height={220}
          priority
          quality={100}
          sizes="(max-width: 640px) 160px, (max-width: 768px) 240px, (max-width: 1024px) 320px, 400px"
          className="h-auto w-24 sm:w-40 md:w-52 lg:w-64 xl:w-72"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4"
          >
            <h1 className="font-sans font-jost-bold uppercase leading-tight tracking-wide text-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              {slides[selectedIndex].headline}
            </h1>
            <p className="max-w-65 text-[11px] font-jost-light leading-relaxed text-white/80 sm:max-w-md sm:text-sm md:max-w-xl md:text-base lg:text-lg">
              {slides[selectedIndex].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ---- Skeleton ----

function HeroSectionSkeleton() {
  return (
    <section className="relative h-[60vh] w-full animate-pulse overflow-hidden bg-muted sm:h-[70vh] lg:h-screen lg:min-h-150">
      <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-10 md:gap-12 lg:gap-14">
        {/* Logo */}
        <div className="h-16 w-40 rounded-lg bg-muted-foreground/20 sm:w-52 md:w-60 lg:w-72" />
        {/* Headline */}
        <div className="h-9 w-3/4 max-w-lg rounded-md bg-muted-foreground/20 sm:h-11 md:h-12" />
        {/* Subtitle */}
        <div className="-mt-4 flex flex-col items-center gap-2 sm:-mt-6 md:-mt-8">
          <div className="h-4 w-80 rounded bg-muted-foreground/20 md:w-96" />
          <div className="h-4 w-64 rounded bg-muted-foreground/20 md:w-72" />
        </div>
      </div>
    </section>
  );
}
