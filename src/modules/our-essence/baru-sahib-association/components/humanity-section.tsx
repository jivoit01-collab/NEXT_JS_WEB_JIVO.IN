'use client';

import { useEffect, useRef, useState } from 'react';
import { SafeImage } from '@/components/shared/public';
import { cn } from '@/lib/utils';
import {
  baruSahibAssociationHumanityFallbackImage,
  humanitySectionData,
} from '../content-defaults';
import type { BaruSahibAssociationHumanityContent } from '../types';

interface HumanitySectionProps {
  data?: BaruSahibAssociationHumanityContent;
}

const HUMANITY_IMAGE_SIZES = '100vw';

function imageWithFallback(image: string) {
  return image || baruSahibAssociationHumanityFallbackImage;
}

export function HumanitySection({ data }: HumanitySectionProps) {
  const { title, description, image } = data ?? humanitySectionData;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (typeof IntersectionObserver === 'undefined') {
      const fallbackTimer = window.setTimeout(() => setIsVisible(true), 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.28 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[700px] overflow-hidden bg-[#06110b] sm:min-h-[730px] md:min-h-[75svh] lg:min-h-[90svh] xl:min-h-screen"
    >
      <div className="absolute inset-0">
        <SafeImage
          src={imageWithFallback(image)}
          alt=""
          fill
          loading="lazy"
          quality={100}
          unoptimized
          className="object-cover object-[72%_96%] sm:object-[68%_92%] md:object-center"
          sizes={HUMANITY_IMAGE_SIZES}
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-black/58 via-black/26 to-black/6" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/28 to-transparent" />

      <div className="relative z-10 flex min-h-[700px] px-4 pt-12 pb-80 sm:min-h-[730px] sm:px-6 sm:pt-14 sm:pb-80 md:min-h-[75svh] md:py-16 lg:min-h-[90svh] lg:items-start lg:px-8 lg:pt-28 lg:pb-20 xl:min-h-screen xl:pt-32 2xl:px-20 2xl:pt-40 2xl:pb-28">
        <div className="w-full max-w-7xl 2xl:max-w-screen-2xl">
          <div className="max-w-[760px] min-w-0 2xl:max-w-[940px]">
            <h2
              className={cn(
                'font-jost-extrabold text-3xl leading-tight text-white uppercase opacity-0 drop-shadow-[0_3px_14px_rgba(0,0,0,0.55)] transition-all duration-700 ease-out sm:text-4xl md:whitespace-nowrap lg:text-5xl 2xl:text-6xl',
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8',
              )}
            >
              {title}
            </h2>
            <p
              className={cn(
                'mt-4 max-w-[520px] text-xs leading-relaxed text-pretty text-white/92 opacity-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] transition-all delay-150 duration-700 ease-out sm:mt-5 sm:text-base md:text-[17px] lg:mt-6 2xl:mt-8 2xl:max-w-[640px] 2xl:text-xl',
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8',
              )}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HumanitySectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[700px] overflow-hidden bg-[#06110b] sm:min-h-[730px] md:min-h-[75svh] lg:min-h-[90svh] xl:min-h-screen"
    >
      <div className="absolute inset-0 animate-pulse bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/58 via-black/26 to-black/6" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/28 to-transparent" />
      <div className="relative z-10 flex min-h-[700px] items-center px-4 pt-12 pb-80 sm:min-h-[730px] sm:px-6 sm:pt-14 sm:pb-80 md:min-h-[75svh] md:py-16 lg:min-h-[90svh] lg:items-start lg:px-8 lg:pt-28 lg:pb-20 xl:min-h-screen xl:pt-32 2xl:px-20 2xl:pt-40 2xl:pb-28">
        <div className="w-full max-w-7xl 2xl:max-w-screen-2xl">
          <div className="max-w-[760px] animate-pulse 2xl:max-w-[940px]">
            <div className="h-9 w-full rounded bg-white/20 sm:h-11 md:h-14 lg:h-16 2xl:h-20" />
            <div className="mt-5 max-w-[520px] space-y-2 lg:mt-6 2xl:mt-8 2xl:max-w-[640px]">
              <div className="h-4 w-full rounded bg-white/15 sm:h-5 2xl:h-6" />
              <div className="h-4 w-full rounded bg-white/15 sm:h-5 2xl:h-6" />
              <div className="h-4 w-5/6 rounded bg-white/15 sm:h-5 2xl:h-6" />
              <div className="h-4 w-2/3 rounded bg-white/15 sm:h-5 2xl:h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
