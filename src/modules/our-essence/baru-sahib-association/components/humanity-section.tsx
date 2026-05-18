'use client';

import { useEffect, useRef, useState } from 'react';
import { SafeImage } from '@/components/shared';
import { cn } from '@/lib/utils';
import { fallbackImage, humanitySectionData } from '../content-defaults';
import type { BaruSahibAssociationHumanityContent } from '../types';

interface HumanitySectionProps {
  data?: BaruSahibAssociationHumanityContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
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
      className="relative min-h-[560px] overflow-hidden bg-[#06110b] md:min-h-[520px] lg:h-[600px] 2xl:h-[720px]"
    >
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/18 via-black/8 to-transparent" />

      <div className="relative z-10 flex min-h-[80vh] px-4 py-24 sm:px-6 sm:py-16 md:min-h-[520px] lg:h-[80vh] lg:px-8 lg:py-20 2xl:h-[720px] 2xl:px-20 2xl:py-28">
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
                'mt-5 max-w-[520px] text-sm leading-relaxed text-pretty text-white/92 opacity-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] transition-all delay-150 duration-700 ease-out sm:text-base md:text-[17px] lg:mt-6 2xl:mt-8 2xl:max-w-[640px] 2xl:text-xl',
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
      className="relative min-h-[560px] overflow-hidden bg-[#06110b] md:min-h-[520px] lg:h-[600px] 2xl:h-[720px]"
    >
      <div className="absolute inset-0 animate-pulse bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/18 via-black/8 to-transparent" />
      <div className="relative z-10 flex min-h-[560px] items-center px-4 py-14 sm:px-6 sm:py-16 md:min-h-[520px] lg:h-[600px] lg:px-8 lg:py-20 2xl:h-[720px] 2xl:px-20 2xl:py-28">
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
