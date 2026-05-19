import { SafeImage } from '@/components/shared';
import { defaultCleanTreeContent, fallbackImage } from '../data/defaults';
import type { ForMotherEarthCleanTreeContent } from '../types';

interface CleanTreeSectionProps {
  data?: ForMotherEarthCleanTreeContent;
}

function imageWithFallback(image: string) {
  return image || fallbackImage;
}

export function CleanTreeSection({ data }: CleanTreeSectionProps) {
  const { image, cleanTitle, cleanDescription, treeTitle, treeDescription } =
    data ?? defaultCleanTreeContent;

  return (
    <section className="relative min-h-[560px] overflow-hidden bg-[#28311e] md:min-h-[620px] lg:min-h-[660px] 2xl:min-h-[760px]">
      <SafeImage
        src={imageWithFallback(image)}
        alt=""
        fill
        loading="lazy"
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/8 via-black/12 to-black/42" />
      <div className="absolute inset-0 bg-linear-to-b from-[#f5c46a]/12 via-transparent to-black/16" />

      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-start px-4 py-16 sm:px-6 md:min-h-[620px] lg:min-h-[660px] lg:px-8 lg:py-24 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-28">
        <div className="animate-fadeIn ml-auto w-full max-w-4xl text-left text-white lg:w-[68%] 2xl:max-w-5xl">
          <StoryBlock title={cleanTitle} description={cleanDescription} />
          <div className="mt-12 sm:mt-14 2xl:mt-18">
            <StoryBlock title={treeTitle} description={treeDescription} large />
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryBlock({
  title,
  description,
  large = false,
}: {
  title: string;
  description: string;
  large?: boolean;
}) {
  return (
    <div>
      <h2
        className={`font-jost-extrabold leading-[1.12] text-balance drop-shadow-[0_3px_14px_rgba(0,0,0,0.35)] ${
          large
            ? 'text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl'
            : 'text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl'
        }`}
      >
        {title}
      </h2>
      <p className="mt-3 max-w-4xl text-sm leading-relaxed text-pretty text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] sm:text-base 2xl:max-w-5xl 2xl:text-lg">
        {description}
      </p>
    </div>
  );
}

export function CleanTreeSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative min-h-[560px] animate-pulse overflow-hidden bg-[#28311e] md:min-h-[620px] lg:min-h-[660px] 2xl:min-h-[760px]"
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/8 via-black/12 to-black/42" />
      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-start px-4 py-16 sm:px-6 md:min-h-[620px] lg:min-h-[660px] lg:px-8 lg:py-24 2xl:max-w-screen-2xl 2xl:px-20 2xl:py-28">
        <div className="ml-auto w-full max-w-4xl lg:w-[68%] 2xl:max-w-5xl">
          {[0, 1].map((item) => (
            <div key={item} className={item === 1 ? 'mt-12 sm:mt-14 2xl:mt-18' : undefined}>
              <div className="h-10 w-full max-w-3xl rounded bg-white/24 sm:h-14 2xl:h-18" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded bg-white/14" />
                <div className="h-4 w-11/12 rounded bg-white/14" />
                <div className="h-4 w-4/5 rounded bg-white/14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
