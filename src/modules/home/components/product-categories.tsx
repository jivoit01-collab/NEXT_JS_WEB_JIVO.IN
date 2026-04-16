import Link from 'next/link';
import { SafeImage } from '@/components/shared';
import { productCategories as defaults } from '../data/home-content';
import type { CategoriesContent } from '../types';

interface ProductCategoriesProps {
  data?: CategoriesContent;
}

export function ProductCategories({ data }: ProductCategoriesProps) {
  const heading = data?.heading ?? 'MADE FOR EVERYDAY LOVE';
  const categories = data?.items ?? defaults;

  return (
    <section className="bg-jivo-olive px-4 py-16 md:py-20">
      <div className="container mx-auto max-w-7xl">
        <h2 className="mb-10 text-center font-sans text-2xl font-jost-extrabold uppercase tracking-[0.2em] text-white md:mb-14 md:text-4xl">
          {heading}
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.name} href={category.href} className="group block">
              <div
                className={`${category.bgColor} relative flex aspect-3/4 flex-col overflow-hidden rounded-lg p-4 shadow-md transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl`}
              >
                {/* Image area — no drop-shadow, no scale, no tint. Image is shown as-is. */}
                <div className="flex flex-1 items-center justify-center rounded-md">
                  <SafeImage
                    src={category.image}
                    alt={category.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="mt-3 text-center font-sans text-sm font-jost-bold uppercase tracking-[0.2em] text-white">
                  {category.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
