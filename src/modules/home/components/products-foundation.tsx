'use client';

import { SafeImage } from '@/components/shared';
import { productsFoundationContent as defaults } from '../data/home-content';
import type { ProductsFoundationContent } from '../types';
import { useEffect, useRef, useState } from 'react';

interface ProductsFoundationProps {
  data?: ProductsFoundationContent;
}

interface Bubble {
  id: number;
  size: number;
  x: number;
  y: number;
  speed: number;
  drift: number;
  opacity: number;
}

export function ProductsFoundation({ data }: ProductsFoundationProps) {
  const content = data ?? defaults;

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const idRef = useRef(0);

  // ✅ SPAWN (MAX 5 ONLY)
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => {
        const newBubble: Bubble = {
          id: idRef.current++,
          size: Math.random() * 16 + 12,
          x: 48 + Math.random() * 4,
          y: 60 + Math.random() * 5,
          speed: Math.random() * 0.18 + 0.12,
          drift: Math.random() * 0.2 - 0.1,
          opacity: 1,
        };

        // 🔥 keep only last 5 bubbles
        const updated = [...prev, newBubble];
        return updated.length > 5 ? updated.slice(1) : updated;
      });
    }, 1000); // slower = better performance

    return () => clearInterval(interval);
  }, []);

  // ✅ SMOOTH LOOP
  useEffect(() => {
    let raf: number;

    const animate = () => {
      setBubbles((prev) =>
        prev
          .map((b) => ({
            ...b,
            y: b.y - b.speed,
            x: b.x + b.drift,
            size: b.size + 0.015, // slow growth
          }))
          .filter((b) => b.y > -10)
      );

      raf = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(raf);
  }, []);

  // ✅ POP
  const handlePop = (id: number) => {
    setBubbles((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, opacity: 0, size: b.size * 1.4 } : b
      )
    );

    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    }, 150);
  };

  return (
    <section className="flex min-h-[75vh] items-center bg-[#134b4c] py-10 text-white md:py-12">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 lg:grid-cols-[2fr_3fr] lg:gap-14">

        {/* IMAGE */}
        <div className="flex items-center justify-center">
          <div className="relative aspect-[3/4] w-full max-w-xs md:max-w-sm">

            {/* IMAGE */}
            <div className="relative h-full w-full rounded-2xl overflow-hidden">
              <SafeImage
                src={content.productImage || defaults.productImage}
                alt="Jivo Product"
                fill
                className="object-cover"
              />
            </div>

            {/* 🔥 BUBBLES */}
            <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
              {bubbles.map((b) => (
                <div
                  key={b.id}
                  onMouseEnter={() => handlePop(b.id)}
                  className="absolute rounded-full transition-all duration-150"
                  style={{
                    width: b.size,
                    height: b.size,
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    opacity: b.opacity,
                    pointerEvents: 'auto',

                    // ✅ glass bubble
                    background: `
                      radial-gradient(circle at 30% 30%,
                      rgba(255,255,255,0.85),
                      rgba(255,255,255,0.2) 40%,
                      rgba(255,255,255,0.05) 70%)
                    `,
                    boxShadow: `
                      inset -2px -3px 6px rgba(255,255,255,0.4),
                      inset 2px 3px 6px rgba(255,255,255,0.1),
                      0 0 6px rgba(255,255,255,0.2)
                    `,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>

          </div>
        </div>

        {/* TEXT */}
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">
              {content.section1.heading}
            </h2>
            <div className="mt-4 space-y-2">
              {content.section1.paragraphs.map((p, i) => (
                <p key={i} className="text-xs md:text-sm text-white/75">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold md:text-2xl">
              {content.section2.heading}
            </h2>
            <div className="mt-4 space-y-2">
              {content.section2.paragraphs.map((p, i) => (
                <p key={i} className="text-xs md:text-sm text-white/75">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}