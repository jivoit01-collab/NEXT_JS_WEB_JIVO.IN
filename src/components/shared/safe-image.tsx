import Image, { type ImageProps } from 'next/image';

export const SAFE_IMAGE_PLACEHOLDER = '/api/uploads/placeholder.png';

/**
 * Resolves a stored image value to a serveable URL:
 *   - Empty/falsy/placeholder -> placeholder
 *   - External (http/data)    -> pass through
 *   - Absolute path (/...)    -> URL-encode segments
 *   - Bare filename           -> /api/uploads/<filename>
 */
export function resolveSafeImageSrc(raw: string): string {
  if (!raw || raw === 'placeholder.png') return SAFE_IMAGE_PLACEHOLDER;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }

  // Bare filename (no leading slash) -> serve through uploads API.
  if (!raw.startsWith('/')) {
    return `/api/uploads/${encodeURIComponent(raw)}`;
  }

  // Absolute path -> URL-encode each segment.
  const [pathPart, queryPart] = raw.split('?');
  const encoded = pathPart
    .split('/')
    .map((segment, i) => (i === 0 && segment === '' ? '' : encodeURIComponent(segment)))
    .join('/');
  return queryPart ? `${encoded}?${queryPart}` : encoded;
}

/** Returns true if the value is empty or the seed placeholder. */
export function isPlaceholderValue(raw: string | undefined | null): boolean {
  return !raw || raw === 'placeholder.png';
}

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
}

/**
 * Server-compatible drop-in for next/image.
 *
 * This component intentionally contains no hooks and no event handlers, so
 * server-rendered image instances do not create a React hydration island.
 * Missing uploaded files still fall back through `/api/uploads/[filename]`.
 *
 * If a rare consumer needs browser-side retry/error switching for an external
 * URL, use `SafeImageFallbackClient` from `./safe-image-fallback-client`.
 */
export function SafeImageServer({ src, alt, ...rest }: SafeImageProps) {
  return (
    <span className="relative inline-block" style={{ display: 'contents' }}>
      <Image {...rest} src={resolveSafeImageSrc(src)} alt={alt} />
    </span>
  );
}

export const SafeImage = SafeImageServer;
