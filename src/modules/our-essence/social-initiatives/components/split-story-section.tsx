import { SafeImage } from '@/components/shared';
import { fallbackImage } from '../data/defaults';
import type { SocialInitiativesSplitContent } from '../types';

interface SplitStorySectionProps {
  data?: SocialInitiativesSplitContent;
  fallbackData: SocialInitiativesSplitContent;
  tone?: 'forest' | 'ocean';
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function SplitStorySection({ data, fallbackData, tone = 'forest' }: SplitStorySectionProps) {
  const content = data ?? fallbackData;
  const isOcean = tone === 'ocean';

  return (
    <section className="relative min-h-[620px] overflow-hidden bg-[#070b08] lg:min-h-[720px]">
      <SafeImage
        src={imageWithFallback(content.backgroundImage)}
        alt=""
        fill
        loading="lazy"
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className={
          isOcean
            ? 'absolute inset-0 bg-linear-to-b from-black/62 via-black/42 to-black/72'
            : 'absolute inset-0 bg-linear-to-b from-black/48 via-black/28 to-black/66'
        }
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/30 via-transparent to-black/30" />

      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-end px-4 py-20 sm:px-6 lg:min-h-[720px] lg:px-8 lg:py-28 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="grid w-full gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          <StoryBlock title={content.leftTitle} description={content.leftDescription} />
          <StoryBlock title={content.rightTitle} description={content.rightDescription} />
        </div>
      </div>
    </section>
  );
}

function StoryBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="animate-fadeIn max-w-xl">
      <h2 className="font-jost-bold text-lg tracking-[0.12em] text-white uppercase sm:text-xl lg:text-2xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-pretty text-white/86 sm:text-base lg:text-lg">
        {description}
      </p>
    </div>
  );
}

export function SplitStorySectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[620px] animate-pulse overflow-hidden bg-[#070b08] lg:min-h-[720px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/35 to-black/70" />
      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-end px-4 py-20 sm:px-6 lg:min-h-[720px] lg:px-8 lg:py-28 2xl:max-w-screen-2xl 2xl:px-20">
        <div className="grid w-full gap-10 md:grid-cols-2 md:gap-16">
          {[0, 1].map((item) => (
            <div key={item} className="max-w-xl">
              <div className="h-6 w-52 rounded bg-white/25" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded bg-white/15" />
                <div className="h-4 w-5/6 rounded bg-white/15" />
                <div className="h-4 w-3/4 rounded bg-white/15" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
