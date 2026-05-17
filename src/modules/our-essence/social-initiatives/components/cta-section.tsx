import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from '@/components/shared';
import { fallbackImage, defaultCtaContent } from '../data/defaults';
import type { SocialInitiativesCtaContent } from '../types';

interface SocialInitiativesCtaSectionProps {
  data?: SocialInitiativesCtaContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function SocialInitiativesCtaSection({ data }: SocialInitiativesCtaSectionProps) {
  const { heading, primaryLabel, primaryHref, secondaryLabel, secondaryHref, backgroundImage } =
    data ?? defaultCtaContent;

  return (
    <section className="relative overflow-hidden bg-[#030504] px-4 py-20 sm:px-6 lg:px-8 lg:py-28 2xl:px-20">
      <SafeImage
        src={imageWithFallback(backgroundImage)}
        alt=""
        fill
        loading="lazy"
        className="object-cover object-center opacity-24"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/74 via-[#06100b]/86 to-black" />
      <div className="absolute top-1/2 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(214,192,141,0.18),transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-5xl rounded-[2rem] border border-white/12 bg-white/[0.055] px-5 py-10 text-center shadow-[0_32px_90px_rgba(0,0,0,0.48)] backdrop-blur-md sm:px-8 sm:py-14 lg:px-14 lg:py-16">
        <p className="font-jost-medium text-xs tracking-[0.32em] text-[#d6c08d]/78 uppercase">
          Take Part
        </p>
        <h2 className="font-jost-extrabold mx-auto mt-4 max-w-4xl text-3xl leading-tight text-balance text-white uppercase sm:text-4xl lg:text-5xl">
          {heading}
        </h2>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#06100b] transition hover:-translate-y-0.5 hover:bg-[#f2e8cf]"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-full border border-white/22 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/14"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SocialInitiativesCtaSectionSkeleton() {
  return (
    <section aria-hidden className="relative overflow-hidden bg-[#030504] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl animate-pulse rounded-[2rem] border border-white/12 bg-white/[0.055] px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto h-4 w-36 rounded bg-white/18" />
        <div className="mx-auto mt-5 h-12 w-full max-w-3xl rounded bg-white/22" />
        <div className="mx-auto mt-8 flex max-w-md gap-3">
          <div className="h-11 flex-1 rounded-full bg-white/18" />
          <div className="h-11 flex-1 rounded-full bg-white/12" />
        </div>
      </div>
    </section>
  );
}
