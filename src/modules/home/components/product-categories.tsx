'use client';

import Link from 'next/link';
import { SafeImage, SplitWords } from '@/components/shared';
import { productCategories as defaults } from '../data/home-content';
import type { CategoriesContent } from '../types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { container, scaleIn, defaultViewport } from '@/lib/animation-variants';

interface ProductCategoriesProps {
  data?: CategoriesContent;
}

export function ProductCategories({ data }: ProductCategoriesProps) {
  const heading = data?.heading ?? 'MADE FOR EVERYDAY LOVE';
  const categories = data?.items ?? defaults;

  return (
    <section className="bg-jivo-olive px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8 lg:py-28">
      <div className="container mx-auto max-w-7xl">

        {/* Heading */}
        <h2 className="mb-10 text-center font-sans text-2xl font-jost-extrabold uppercase tracking-[0.2em] text-white sm:mb-12 sm:text-3xl md:mb-14 md:text-4xl lg:text-5xl">
          <SplitWords text={heading} />
        </h2>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <motion.div key={category.name} variants={scaleIn}>
              <TiltCard>
                <Link href={category.href} className="group block h-full">
                  <div
                    className={`
                      ${category.bgColor}
                      relative flex aspect-3/4 flex-col overflow-hidden rounded-xl p-3
                      shadow-md transition-all duration-500 sm:p-4
                      group-hover:shadow-2xl group-hover:shadow-black/30
                    `}
                  >
                    {/* Gradient Glow */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                      <div className="absolute inset-0 animate-gradient bg-[linear-gradient(120deg,rgba(255,255,255,0.08),rgba(255,255,255,0.18),rgba(255,255,255,0.08))]" />
                    </div>

                    {/* Image */}
                    <div className="flex flex-1 items-center justify-center rounded-md overflow-hidden">
                      <SafeImage
                        src={category.image}
                        alt={category.name}
                        width={400}
                        height={400}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Title */}
                    <p className="mt-3 text-center font-sans text-xs font-jost-bold uppercase tracking-[0.2em] text-white transition-all duration-300 sm:text-sm md:text-base group-hover:tracking-[0.25em]">
                      {category.name}
                    </p>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Gradient Animation */}
      <style jsx>{`
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 5s ease infinite;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
}


// 🔥 Tilt + Ripple (Optimized)
function TiltCard({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [ripples, setRipples] = useState<any[]>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = -(y - rect.height / 2) / 12;
    const rotateY = (x - rect.width / 2) / 12;

    setStyle({
      transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)',
    });
  };

  // Ripple
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = 80;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, ripple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 500);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={style}
      className="relative transition-transform duration-300"
    >
      {/* Ripple */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/25 animate-ping pointer-events-none"
          style={{
            width: 80,
            height: 80,
            top: r.y,
            left: r.x,
          }}
        />
      ))}

      {children}
    </motion.div>
  );
}