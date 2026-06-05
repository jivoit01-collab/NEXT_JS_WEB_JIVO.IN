'use client';

import Image, { type ImageProps } from 'next/image';
import { useRef, useState } from 'react';
import {
  isPlaceholderValue,
  resolveSafeImageSrc,
  SAFE_IMAGE_PLACEHOLDER,
} from './safe-image';

interface SafeImageFallbackClientProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  /** Called once after the image has definitively failed to load after retry. */
  onMissing?: (failedUrl: string) => void;
}

/**
 * Client-only SafeImage variant for the small number of cases that need browser
 * error detection, one retry, and then placeholder switching.
 */
export function SafeImageFallbackClient({
  src,
  alt,
  onMissing,
  ...rest
}: SafeImageFallbackClientProps) {
  const initial = resolveSafeImageSrc(src);

  return (
    <SafeImageFallbackClientInner
      key={initial}
      {...rest}
      src={src}
      initial={initial}
      alt={alt}
      onMissing={onMissing}
    />
  );
}

interface SafeImageFallbackClientInnerProps
  extends Omit<SafeImageFallbackClientProps, 'src'> {
  src: string;
  initial: string;
}

function SafeImageFallbackClientInner({
  src,
  initial,
  alt,
  onMissing,
  ...rest
}: SafeImageFallbackClientInnerProps) {
  const isRealImage = !isPlaceholderValue(src);

  type Phase = 'initial' | 'retry' | 'fallback';
  const [phase, setPhase] = useState<Phase>('initial');
  const [currentSrc, setCurrentSrc] = useState(initial);
  const reportedRef = useRef(false);

  const isFallback = phase === 'fallback';

  return (
    <span className="relative inline-block" style={{ display: 'contents' }}>
      <Image
        {...rest}
        key={`${initial}-${phase}`}
        src={currentSrc}
        alt={alt}
        onError={() => {
          if (phase === 'initial') {
            console.warn(`[SafeImage] Load failed for "${src}" (resolved: ${initial}) - retrying...`);
            setPhase('retry');
            setCurrentSrc(`${initial}${initial.includes('?') ? '&' : '?'}_r=${Date.now()}`);
            return;
          }

          if (phase === 'retry') {
            if (!reportedRef.current) {
              reportedRef.current = true;
              console.warn(
                `[SafeImage] IMAGE MISSING: "${src}" - the file does not exist on disk ` +
                  `or the API cannot serve it. The DB still references this filename. ` +
                  `Re-upload via the admin dashboard to fix. Falling back to placeholder.`,
              );
              onMissing?.(initial);
            }
            setPhase('fallback');
            setCurrentSrc(SAFE_IMAGE_PLACEHOLDER);
          }
        }}
      />
      {process.env.NODE_ENV !== 'production' && isRealImage && isFallback && (
        <span
          className="absolute top-1 left-1 z-50 rounded bg-red-600 px-1.5 py-0.5 text-[10px] leading-tight font-bold text-white uppercase shadow"
          title={`Missing: ${src}`}
        >
          MISSING
        </span>
      )}
    </span>
  );
}
