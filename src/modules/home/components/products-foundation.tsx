'use client';

import { SafeImage, SplitWords } from '@/components/shared';
import { productsFoundationContent as defaults } from '../data/home-content';
import type { ProductsFoundationContent } from '../types';
import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import { container, fadeUp, defaultViewport } from '@/lib/animation-variants';

interface ProductsFoundationProps {
  data?: ProductsFoundationContent;
  isLoading?: boolean;
}

type BubbleState = 'rising' | 'popping';

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  wobblePhase: number;
  wobbleAmp: number;
  alpha: number;
  state: BubbleState;
  popProgress: number;
}

const MAX_BUBBLES = 14;
const SPAWN_INTERVAL_MS = 650;

export function ProductsFoundation({ data, isLoading }: ProductsFoundationProps) {
  if (isLoading) return <ProductsFoundationSkeleton />;

  const content = data ?? defaults;
  const prefersReduced = useReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const rafRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const lastTimeRef = useRef(0);
  const visibleRef = useRef(true);
  const dprRef = useRef(1);
  const sizeRef = useRef({ w: 0, h: 0 });

  const spawnBubble = useCallback(() => {
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;
    if (bubblesRef.current.length >= MAX_BUBBLES) return;

    const r = 6 + Math.random() * 14;
    bubblesRef.current.push({
      x: w * (0.15 + Math.random() * 0.7),
      y: h + r + 2,
      r,
      vy: 18 + Math.random() * 22,
      vx: (Math.random() - 0.5) * 6,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleAmp: 4 + Math.random() * 8,
      alpha: 0,
      state: 'rising',
      popProgress: 0,
    });
  }, []);

  const drawBubble = useCallback(
    (ctx: CanvasRenderingContext2D, b: Bubble) => {
      const { x, y, r, alpha } = b;

      if (b.state === 'popping') {
        const p = b.popProgress;
        const ringR = r * (1 + p * 1.8);
        ctx.save();
        ctx.globalAlpha = alpha * (1 - p);
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = Math.max(0.5, 2 * (1 - p));
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.stroke();

        const drops = 6;
        for (let i = 0; i < drops; i++) {
          const a = (i / drops) * Math.PI * 2;
          const dist = r * (0.5 + p * 1.4);
          const dr = Math.max(0.5, r * 0.18 * (1 - p));
          ctx.globalAlpha = alpha * (1 - p) * 0.9;
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.beginPath();
          ctx.arc(x + Math.cos(a) * dist, y + Math.sin(a) * dist, dr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return;
      }

      // Rising glass bubble
      ctx.save();
      ctx.globalAlpha = alpha;

      // Outer soft glow
      const glow = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 1.3);
      glow.addColorStop(0, 'rgba(255,255,255,0.18)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Bubble body — glass refraction
      const body = ctx.createRadialGradient(
        x - r * 0.35,
        y - r * 0.45,
        r * 0.1,
        x,
        y,
        r,
      );
      body.addColorStop(0, 'rgba(255,255,255,0.55)');
      body.addColorStop(0.35, 'rgba(255,255,255,0.18)');
      body.addColorStop(0.75, 'rgba(220,240,240,0.08)');
      body.addColorStop(1, 'rgba(255,255,255,0.18)');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Rim
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Primary highlight (top-left)
      const hx = x - r * 0.4;
      const hy = y - r * 0.45;
      const hr = r * 0.32;
      const hi = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
      hi.addColorStop(0, 'rgba(255,255,255,0.95)');
      hi.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hi;
      ctx.beginPath();
      ctx.arc(hx, hy, hr, 0, Math.PI * 2);
      ctx.fill();

      // Small secondary highlight (bottom-right)
      const sx = x + r * 0.45;
      const sy = y + r * 0.4;
      const sr = r * 0.14;
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
    [],
  );

  const loop = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000);
      lastTimeRef.current = t;

      if (visibleRef.current) {
        if (t - lastSpawnRef.current > SPAWN_INTERVAL_MS) {
          spawnBubble();
          lastSpawnRef.current = t;
        }

        const { w, h } = sizeRef.current;
        const pointer = pointerRef.current;
        const bubbles = bubblesRef.current;

        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];

          if (b.state === 'rising') {
            b.wobblePhase += dt * 2.2;
            b.y -= b.vy * dt;
            b.x += (b.vx + Math.sin(b.wobblePhase) * b.wobbleAmp * 0.12) * dt;
            b.alpha = Math.min(1, b.alpha + dt * 2);

            // Fade near top
            const fadeZone = h * 0.18;
            if (b.y < fadeZone) {
              b.alpha = Math.max(0, b.y / fadeZone);
            }

            // Pointer proximity → pop
            if (pointer.active) {
              const dx = b.x - pointer.x;
              const dy = b.y - pointer.y;
              if (dx * dx + dy * dy < (b.r + 6) * (b.r + 6)) {
                b.state = 'popping';
                b.popProgress = 0;
              }
            }

            if (b.y + b.r < 0 || b.x < -b.r || b.x > w + b.r) {
              bubbles.splice(i, 1);
            }
          } else {
            b.popProgress += dt * 4;
            if (b.popProgress >= 1) bubbles.splice(i, 1);
          }
        }

        ctx.clearRect(0, 0, w, h);
        for (const b of bubbles) drawBubble(ctx, b);
      }

      rafRef.current = requestAnimationFrame(loop);
    },
    [drawBubble, spawnBubble],
  );

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 },
    );
    io.observe(wrap);

    const onVisibility = () => {
      if (document.hidden) visibleRef.current = false;
      else visibleRef.current = true;
    };
    document.addEventListener('visibilitychange', onVisibility);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      bubblesRef.current = [];
      lastSpawnRef.current = 0;
      lastTimeRef.current = 0;
    };
  }, [loop, prefersReduced]);

  const setPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };
  const clearPointer = () => {
    pointerRef.current = { x: -9999, y: -9999, active: false };
  };

  return (
    <section className="flex items-center bg-[#134b4c] py-16 text-white sm:py-20 md:min-h-[75vh] md:py-24 lg:py-28 2xl:py-36">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="container mx-auto grid grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-[2fr_3fr] md:gap-12 lg:gap-16 lg:px-8 2xl:max-w-7xl 2xl:gap-20"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-center">
          <div
            ref={wrapRef}
            className="group relative aspect-3/4 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg 2xl:max-w-xl"
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-out will-change-transform group-hover:-translate-y-1 group-hover:scale-[1.02]">
              <SafeImage
                src={content.productImage || defaults.productImage}
                alt="Jivo Product"
                fill
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#134b4c]/35 via-transparent to-transparent" />
            </div>

            {!prefersReduced && (
              <canvas
                ref={canvasRef}
                onPointerMove={setPointer}
                onPointerDown={setPointer}
                onPointerLeave={clearPointer}
                onPointerCancel={clearPointer}
                className="absolute inset-0 z-20 h-full w-full rounded-2xl"
                aria-hidden="true"
              />
            )}
          </div>
        </motion.div>

        <div className="flex flex-col justify-center space-y-6 md:space-y-8 lg:space-y-10 2xl:space-y-12">
          <motion.div variants={fadeUp}>
            <h2 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl">
              <SplitWords text={content.section1.heading} inheritParent />
            </h2>
            <div className="mt-4 space-y-2 2xl:mt-5 2xl:space-y-3">
              {content.section1.paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp}
                  className="text-sm leading-relaxed text-white/75 md:text-base 2xl:text-lg"
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h2 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl">
              <SplitWords text={content.section2.heading} inheritParent />
            </h2>
            <div className="mt-4 space-y-2 2xl:mt-5 2xl:space-y-3">
              {content.section2.paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp}
                  className="text-sm leading-relaxed text-white/75 md:text-base 2xl:text-lg"
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ---- Skeleton ----

export function ProductsFoundationSkeleton() {
  return (
    <section className="flex animate-pulse items-center bg-[#134b4c] py-16 sm:py-20 md:min-h-[75vh] md:py-24 lg:py-28 2xl:py-36">
      <div className="container mx-auto grid grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-[2fr_3fr] md:gap-12 lg:gap-16 lg:px-8 2xl:max-w-7xl 2xl:gap-20">
        {/* Product image placeholder */}
        <div className="flex items-center justify-center">
          <div className="aspect-3/4 w-full max-w-xs rounded-2xl bg-white/10 sm:max-w-sm md:max-w-md lg:max-w-lg 2xl:max-w-xl" />
        </div>
        {/* Two text sections */}
        <div className="flex flex-col justify-center space-y-6 md:space-y-8 lg:space-y-10 2xl:space-y-12">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-7 w-72 rounded-md bg-white/20 sm:h-8 md:h-9 lg:w-80 2xl:h-12 2xl:w-96" />
              <div className="space-y-2 2xl:space-y-3">
                <div className="h-4 w-full rounded bg-white/10 2xl:h-5" />
                <div className="h-4 w-5/6 rounded bg-white/10 2xl:h-5" />
                <div className="h-4 w-4/6 rounded bg-white/10 2xl:h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
