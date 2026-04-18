import { SafeImage } from '@/components/shared';
import type { CoreValuesFoundationContent } from '../types';
import { defaultFoundationContent } from '../data/defaults';

interface Props {
  data?: CoreValuesFoundationContent;
}

/** TRUTH AS FOUNDATION — heading + 2-column value blocks over hands bg. */
export function FoundationSection({ data }: Props) {
  const { heading, backgroundImage, blocks } = data ?? defaultFoundationContent;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
      {/* Background */}
      {backgroundImage ? (
        <SafeImage
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d1810] via-[#3a1f15] to-[#1a0d08]" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6 lg:px-12">
        <h2 className="mb-10 text-center font-jost-bold text-2xl uppercase tracking-[0.12em] text-white sm:mb-14 sm:text-3xl md:text-4xl lg:mb-20 lg:text-5xl">
          {heading}
        </h2>

        <div className="grid gap-10 sm:gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
          {blocks.map((block, i) => (
            <div key={`${block.label}-${i}`}>
              <h3 className="mb-3 font-jost-bold text-sm uppercase tracking-[0.2em] text-white sm:mb-4 sm:text-base">
                {block.label}
              </h3>
              <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">
                {block.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
