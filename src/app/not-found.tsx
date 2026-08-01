'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Clock, Hammer, Home, Leaf, ShieldCheck, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { container, fadeUp, scaleIn, reducedMotion } from '@/lib/animation-variants';

/**
 * Global not-found / "under development" page.
 *
 * Many nav links point to pages that aren't built yet, so instead of a bare 404
 * this shows a friendly, on-brand "under development" screen with feature cards
 * plus a way home and a way back. Client component so Back uses router history.
 */

const CARDS = [
  {
    icon: Hammer,
    title: 'Work in Progress',
    description: "We're building something awesome for you.",
  },
  {
    icon: Leaf,
    title: 'Better Experience',
    description: 'This feature will improve your experience.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality First',
    description: 'We ensure the best quality experience for you.',
  },
  {
    icon: Clock,
    title: 'Coming Soon',
    description: 'Stay tuned, it will be available shortly!',
  },
] as const;

export default function NotFound() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const containerVariant = prefersReducedMotion ? reducedMotion : container;
  const itemVariant = prefersReducedMotion ? reducedMotion : fadeUp;
  const cardVariant = prefersReducedMotion ? reducedMotion : scaleIn;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-16 text-center sm:px-6">
      {/* Decorative brand-green glows (purely visual). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      </div>

      <LazyMotion features={domAnimation}>
        <m.div
          variants={containerVariant}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full max-w-4xl flex-col items-center"
        >
          {/* Under Development pill */}
          <m.span
            variants={itemVariant}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 font-jost-medium text-xs tracking-[0.18em] text-primary uppercase sm:text-sm"
          >
            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            Under Development
          </m.span>

          {/* Heading with green brush-underlined phrase */}
          <m.h1
            variants={itemVariant}
            className="mt-6 text-balance font-jost-bold text-3xl text-foreground sm:text-4xl md:text-5xl"
          >
            This page is{' '}
            <span className="relative inline-block text-primary">
              under development
              <svg
                aria-hidden="true"
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                className="absolute -bottom-1.5 left-0 h-2.5 w-full text-primary"
              >
                <path
                  d="M3 8 Q 80 2 150 7 T 297 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </m.h1>

          {/* Subtitle */}
          <m.p
            variants={itemVariant}
            className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            We&apos;re working hard to bring you something amazing. It&apos;ll be ready soon —
            thank you for your patience!
          </m.p>

          {/* Feature cards */}
          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map(({ icon: Icon, title, description }) => (
              <m.div
                key={title}
                variants={cardVariant}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-5 text-left shadow-sm ring-1 ring-black/[0.02] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-jost-bold text-sm text-foreground sm:text-base">{title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {description}
                  </p>
                </div>
              </m.div>
            ))}
          </div>

          {/* Actions */}
          <m.div
            variants={itemVariant}
            className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go to Home
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </m.div>
        </m.div>
      </LazyMotion>
    </main>
  );
}
