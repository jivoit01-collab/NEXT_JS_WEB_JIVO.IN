import { SafeImage } from '@/components/shared';
import { productsFoundationContent as defaults } from '../data/home-content';
import type { ProductsFoundationContent } from '../types';

interface ProductsFoundationProps {
  data?: ProductsFoundationContent;
}

export function ProductsFoundation({ data }: ProductsFoundationProps) {
  const content = data ?? defaults;

  return (
    <section className="bg-[#134b4c] py-16 text-white md:py-24">
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-20">
        {/* Product image — no gradient, no tint, no filters. Shown as uploaded. */}
        <div className="flex items-center justify-center">
          <div className="relative aspect-3/4 w-full max-w-md overflow-hidden rounded-2xl">
            <SafeImage
              src={content.productImage || defaults.productImage}
              alt="Jivo Product"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-12">
          <div>
            <h2 className="font-sans text-2xl font-jost-bold tracking-tight text-white md:text-3xl">
              {content.section1.heading}
            </h2>
            <div className="mt-6 space-y-4">
              {content.section1.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-white/80 md:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-sans text-2xl font-jost-bold tracking-tight text-white md:text-3xl">
              {content.section2.heading}
            </h2>
            <div className="mt-6 space-y-4">
              {content.section2.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-white/80 md:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
