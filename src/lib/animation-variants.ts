/**
 * Centralized framer-motion variants — see prompt1.md §35.
 *
 * Usage:
 *   <motion.div variants={container} initial="hidden" whileInView="show"
 *     viewport={{ once: true, amount: 0.25 }}>
 *     <motion.h2 variants={fadeUp}>…</motion.h2>
 *     <motion.p  variants={fadeUp}>…</motion.p>
 *   </motion.div>
 *
 * Rules:
 *   - ❌ NEVER animate hero (LCP must not wait)
 *   - ✅ One motion parent per section; children just reference variants
 *   - ✅ Always `viewport={{ once: true }}` — never re-animate on scroll-up
 *   - ✅ Respect prefers-reduced-motion via useReducedMotion()
 */
import { cubicBezier, type Variants } from 'framer-motion';

// Typed easing curve — NOT a raw number[] (TS now rejects that).
const EASE_OUT_EXPO = cubicBezier(0.22, 1, 0.36, 1);

/** Parent container with staggered children. */
export const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

/** Slower stagger for headline-heavy sections (hero-like reveals). */
export const containerSlow: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

/** Fade + rise (body paragraphs, headings, cards). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

/** Slower variant — good for hero-adjacent headings. */
export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
  },
};

/** Plain fade, no Y translate (good for images — avoids repaint cost). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

/** Subtle scale-in for images / icon tiles. Uses opacity + scale only. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

/** Reduced-motion fallback — zero movement, instant show. */
export const reducedMotion: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { duration: 0 } },
};

/**
 * Default viewport settings for every whileInView animation.
 * 25% visible is a good compromise between "too eager" (5%) and "too late" (50%).
 */
export const defaultViewport = { once: true, amount: 0.25 } as const;
