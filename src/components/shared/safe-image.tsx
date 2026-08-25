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

/**
 * True when the value is an external image URL (http/https/data) rather than a
 * local upload. next/image only optimizes whitelisted hosts, so external URLs
 * must be rendered with a plain <img> instead — the caller uses this to decide.
 */
export function isExternalImageSrc(raw: string | undefined | null): boolean {
  if (!raw) return false;
  return (
    raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')
  );
}

/**
 * Returns true if the value is empty or the seed placeholder.
 *
 * Module defaults store the placeholder as a full path
 * (`/api/uploads/placeholder.png`), while older seeds use the bare filename —
 * both must count as "no image set", otherwise optional art (e.g. the hero's
 * second bottle) renders a grey placeholder instead of being hidden.
 */
export function isPlaceholderValue(raw: string | undefined | null): boolean {
  if (!raw) return true;
  const filename = raw.split('/').pop()?.split('?')[0];
  return filename === 'placeholder.png';
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
  const resolved = resolveSafeImageSrc(src);

  // External URLs (pasted by an admin) aren't from a whitelisted host, so
  // next/image would throw "hostname not configured". Render them with a plain
  // <img> instead — it has no host restriction. Local uploads keep next/image
  // optimization. We forward the layout-relevant props (className/sizes/style)
  // and translate `fill` into absolute-cover styles so callers behave the same.
  if (isExternalImageSrc(resolved)) {
    // Only forward props a plain <img> understands; next/image-only props
    // (sizes/priority/quality/loader/placeholder/…) are dropped intentionally.
    const r = rest as ImageProps & { fill?: boolean };
    const fill = r.fill === true;
    const fillStyle = fill
      ? ({ position: 'absolute', inset: 0, width: '100%', height: '100%' } as const)
      : undefined;
    return (
      <span className="relative inline-block" style={{ display: 'contents' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolved}
          alt={alt}
          width={fill ? undefined : (r.width as number | undefined)}
          height={fill ? undefined : (r.height as number | undefined)}
          className={r.className}
          style={{ ...(r.style as React.CSSProperties), ...fillStyle }}
        />
      </span>
    );
  }

  return (
    <span className="relative inline-block" style={{ display: 'contents' }}>
      <Image {...rest} src={resolved} alt={alt} />
    </span>
  );
}

export const SafeImage = SafeImageServer;
