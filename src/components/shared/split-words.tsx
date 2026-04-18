'use client';

import { motion, useReducedMotion, cubicBezier, type Variants } from 'framer-motion';
import { useMemo } from 'react';

const EASE = cubicBezier(0.22, 1, 0.36, 1);

const parent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const word: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

interface SplitWordsProps {
  text: string;
  className?: string;
  amount?: number;
  /** If true, the outer span inherits parent variants instead of triggering its own whileInView. */
  inheritParent?: boolean;
}

/**
 * Scroll-triggered word-by-word reveal. Transform + opacity only, so it
 * stays GPU-accelerated and avoids layout thrash. Respects prefers-reduced-motion.
 */
export function SplitWords({
  text,
  className,
  amount = 0.3,
  inheritParent = false,
}: SplitWordsProps) {
  const prefersReduced = useReducedMotion();
  const words = useMemo(() => text.split(' '), [text]);

  if (prefersReduced) return <span className={className}>{text}</span>;

  const parentProps = inheritParent
    ? { variants: parent }
    : {
        variants: parent,
        initial: 'hidden' as const,
        whileInView: 'show' as const,
        viewport: { once: true, amount },
      };

  return (
    <motion.span {...parentProps} className={className} style={{ display: 'inline-block' }}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden align-top"
          style={{ paddingBottom: '0.08em' }}
        >
          <motion.span variants={word} className="inline-block">
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
