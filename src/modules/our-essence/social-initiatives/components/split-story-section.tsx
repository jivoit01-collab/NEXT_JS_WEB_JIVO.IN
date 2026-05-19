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
    <section className="relative min-h-[520px] overflow-hidden bg-[#070b08] lg:h-[46vw] lg:max-h-[700px] lg:min-h-[560px]">
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
            ? 'absolute inset-0 bg-linear-to-b from-black/28 via-black/34 to-black/42'
            : 'absolute inset-0 bg-linear-to-b from-black/24 via-black/20 to-black/36'
        }
      />

      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-none items-center px-[7vw] py-20 sm:px-[7vw] lg:h-full lg:min-h-0 lg:py-0 2xl:px-[8vw]">
        <div className="grid w-full gap-12 md:grid-cols-2 md:gap-[9vw]">
          <StoryBlock title={content.leftTitle} description={content.leftDescription} />
          <StoryBlock title={content.rightTitle} description={content.rightDescription} />
        </div>
      </div>
    </section>
  );
}

function StoryBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="animate-fadeIn max-w-[430px]">
      <h2 className="font-jost-bold text-[clamp(0.95rem,1.45vw,1.35rem)] tracking-[0.08em] text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
        {title}
      </h2>
      <p className="mt-4 text-[clamp(0.82rem,1.05vw,1rem)] leading-snug text-pretty whitespace-pre-line text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.36)]">
        {description}
      </p>
    </div>
  );
}

export function SplitStorySectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[520px] animate-pulse overflow-hidden bg-[#070b08] lg:h-[46vw] lg:max-h-[700px] lg:min-h-[560px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-b from-black/28 via-black/34 to-black/42" />
      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-none items-center px-[7vw] py-20 sm:px-[7vw] lg:h-full lg:min-h-0 lg:py-0 2xl:px-[8vw]">
        <div className="grid w-full gap-12 md:grid-cols-2 md:gap-[9vw]">
          {[0, 1].map((item) => (
            <div key={item} className="max-w-[430px]">
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
