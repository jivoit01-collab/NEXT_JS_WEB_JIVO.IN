'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { SafeImage } from '@/components/shared';
import type { HeroSlideData } from '../types';

export function HeroCarousel({ logoSrc, slides }: { logoSrc: string; slides: HeroSlideData[] }) {
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
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative h-full min-w-0 flex-[0_0_100%]">
              <SafeImage
                src={slide.backgroundImage}
                alt={slide.headline}
                fill
                priority={index === 0}
                quality={90}
                sizes="(max-width: 768px) 100vw, 1920px"
                className="object-cover object-[center_30%]"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/30" />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 text-center text-white sm:gap-7 md:gap-9 lg:gap-12 2xl:gap-16">
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

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 2xl:gap-6"
          >
            <h1 className="font-jost-bold font-sans text-xl leading-tight tracking-wide text-white uppercase sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
              {slides[selectedIndex].headline}
            </h1>
            <p className="font-jost-light max-w-xs text-xs leading-relaxed text-white/80 sm:max-w-md sm:text-sm md:max-w-xl md:text-base lg:text-lg 2xl:max-w-2xl 2xl:text-xl">
              {slides[selectedIndex].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
