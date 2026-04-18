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
}

export function HeroSection({ data, slides }: HeroSectionProps) {
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
      <section className="relative h-screen min-h-150 w-full overflow-hidden">
        <SafeImage
          src={slide.backgroundImage}
          alt={slide.headline}
          fill
          priority
          quality={100}
          sizes="(max-width: 768px) 100vw, 1920px"
          className="object-cover object-[center_30%]"
        />
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
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
              quality={90}
              sizes="(max-width: 640px) 224px, (max-width: 768px) 288px, (max-width: 1024px) 320px, 352px"
              className="mb-43 h-auto w-56 sm:w-72 md:w-80 lg:w-[22rem]"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-sans text-center mb-5 text-2xl font-jost-bold uppercase tracking-[0.15em] md:text-4xl lg:text-4xl"
          >
            {slide.headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-3 max-w-md text-xs font-jost-light leading-relaxed text-white/80 sm:text-sm"
          >
            {slide.subtitle}
          </motion.p>
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
    <section className="relative h-screen min-h-150 w-full overflow-hidden">
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

      {/* Fixed logo + animated text overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
        {/* Logo — always visible, no animation on slide change */}
        <div className="mb-43">
          <SafeImage
            src={logoSrc}
            alt="Jivo Logo"
            width={520}
            height={220}
            priority
            quality={90}
            sizes="(max-width: 640px) 224px, (max-width: 768px) 288px, (max-width: 1024px) 320px, 352px"
            className="h-auto w-56 sm:w-72 md:w-80 lg:w-[22rem]"
          />
        </div>

        {/* Headline + subtitle — crossfade on slide change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <h1 className="font-sans text-center mb-5 text-2xl font-jost-bold uppercase tracking-[0.10em] md:text-4xl lg:text-4xl">
              {slides[selectedIndex].headline}
            </h1>
            <p className="mt-3 max-w-md text-xs font-jost-light leading-relaxed text-white/80 sm:text-sm">
              {slides[selectedIndex].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
