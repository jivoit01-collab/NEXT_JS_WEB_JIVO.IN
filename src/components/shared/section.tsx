import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SafeImage } from './safe-image';

interface SectionProps {
  /** Bare filename, absolute path, or external URL — rendered via SafeImage. */
  background?: string;
  /** Dark overlay opacity 0–100. Set to 0 or omit for no overlay. */
  overlay?: number;
  /** Vertical rhythm. `default` = `py-16 md:py-24`. */
  padding?: 'sm' | 'default' | 'lg' | 'none';
  /** Inner container max-width. */
  container?: '5xl' | '6xl' | '7xl' | 'full';
  /** Minimum section height. */
  minHeight?: 'auto' | 'screen' | 'half' | 'two-thirds';
  /** Additional classes on the outer `<section>`. */
  className?: string;
  /** Additional classes on the inner container. */
  innerClassName?: string;
  /** Optional label override for the background SafeImage. Accessible default: "". */
  backgroundAlt?: string;
  children: ReactNode;
}

const PADDING: Record<NonNullable<SectionProps['padding']>, string> = {
  sm: 'py-10 md:py-14',
  default: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
  none: '',
};

const CONTAINER: Record<NonNullable<SectionProps['container']>, string> = {
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-none',
};

const MIN_HEIGHT: Record<NonNullable<SectionProps['minHeight']>, string> = {
  auto: '',
  screen: 'min-h-screen',
  half: 'min-h-[50vh]',
  'two-thirds': 'min-h-[66vh]',
};

/**
 * Unified section wrapper — see prompt1.md §36.
 *
 * Composes: `<section>` → optional background image (SafeImage fill) →
 * optional dark overlay → inner container with padding + max-width.
 *
 * Use for ALL new section components. Existing sections can migrate
 * incrementally — do not mass-refactor.
 */
export function Section({
  background,
  overlay = 0,
  padding = 'default',
  container = '7xl',
  minHeight = 'auto',
  className,
  innerClassName,
  backgroundAlt = '',
  children,
}: SectionProps) {
  const hasOverlay = overlay > 0;
  const overlayStyle = hasOverlay ? { backgroundColor: `rgba(0,0,0,${overlay / 100})` } : undefined;

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        PADDING[padding],
        MIN_HEIGHT[minHeight],
        className,
      )}
    >
      {background && (
        <SafeImage
          src={background}
          alt={backgroundAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      )}
      {hasOverlay && <div className="absolute inset-0" style={overlayStyle} />}

      <div
        className={cn(
          'relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8',
          CONTAINER[container],
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
