'use client';

import { useMemo, useState, useEffect } from 'react';
import NextImage from 'next/image';
import { Image as ImageIcon, Search, MessageCircle } from 'lucide-react';

interface SeoPreviewProps {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

const PRODUCTION_URL = 'https://jivo.in';

// Must match next.config.ts remotePatterns hostnames
const ALLOWED_HOSTNAMES = new Set(['utfs.io', 'uploadthing.com', 'lh3.googleusercontent.com']);

function truncate(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/** Bare filename → /api/uploads/filename. Full URLs and /paths pass through. */
function resolveImageSrc(value: string): string {
  if (!value) return '';
  if (value.startsWith('http') || value.startsWith('/')) return value;
  return `/api/uploads/${value}`;
}

/**
 * Returns true when next/image can serve the URL without extra config:
 * external URLs on known hostnames only.
 * Local /api/uploads/* paths are served via a plain <img> tag — next/image
 * wraps them through /_next/image which can fail to self-fetch in production.
 */
function isNextImageCompatible(src: string): boolean {
  if (!src) return false;
  if (src.startsWith('/')) return false; // use plain <img> for all local API paths
  try {
    return ALLOWED_HOSTNAMES.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

/** Swap localhost/127.0.0.1 with production URL so the preview is meaningful. */
function sanitizeCanonical(url: string): string {
  if (!url) return PRODUCTION_URL;
  if (url.includes('localhost') || url.includes('127.0.0.1')) return PRODUCTION_URL;
  return url;
}

function extractDomain(url: string): string {
  const safe = sanitizeCanonical(url);
  try {
    return new URL(safe).hostname.replace(/^www\./, '');
  } catch {
    return safe.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'jivo.in';
  }
}

function resolveDisplayUrl(canonical: string): string {
  const safe = sanitizeCanonical(canonical);
  try {
    const u = new URL(safe);
    return u.origin + u.pathname;
  } catch {
    return safe;
  }
}

export function SeoPreview({
  metaTitle,
  metaDescription,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
}: SeoPreviewProps) {
  const resolvedSrc    = useMemo(() => resolveImageSrc(ogImage), [ogImage]);
  const useNextImage   = useMemo(() => isNextImageCompatible(resolvedSrc), [resolvedSrc]);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [resolvedSrc]);

  const googleTitle  = useMemo(() => truncate(metaTitle || 'Page Title', 60), [metaTitle]);
  const googleUrl    = useMemo(() => resolveDisplayUrl(canonicalUrl), [canonicalUrl]);
  const googleDesc   = useMemo(
    () => truncate(metaDescription || 'No description provided.', 160),
    [metaDescription],
  );
  const socialTitle  = useMemo(
    () => truncate(ogTitle || metaTitle || 'Page Title', 70),
    [ogTitle, metaTitle],
  );
  const socialDesc   = useMemo(
    () => truncate(ogDescription || metaDescription || '', 120),
    [ogDescription, metaDescription],
  );
  const socialDomain = useMemo(() => extractDomain(canonicalUrl), [canonicalUrl]);

  const showImage = Boolean(resolvedSrc) && !imgError;

  return (
    <div className="space-y-4  overflow-hidden rounded-xl border bg-muted/20 p-5">
      <p className="text-xs font-jost-bold uppercase tracking-widest text-muted-foreground">
        Live Preview
      </p>

      {/* ── Google SERP Preview ── */}
      <div className="space-y-2">
        <div className="flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <Search className="h-3 w-3" />
          <span>Google Search Result</span>
        </div>
        <div className="overflow-hidden  cursor-pointer rounded-xl border bg-card px-5 py-4 shadow-sm">
          <p className="truncate text-base font-medium leading-snug" style={{ color: '#1a0dab' }}>
            {googleTitle || <span className="italic text-muted-foreground">No title</span>}
          </p>
          <p className="mt-0.5 truncate text-[13px] leading-tight" style={{ color: '#006621' }}>
            {googleUrl}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {googleDesc || <span className="italic">No description</span>}
          </p>
        </div>
      </div>

      {/* ── WhatsApp / Social Card Preview ── */}
      <div className="space-y-2">
        <div className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
          <MessageCircle className="h-3 w-3" />
          <span>WhatsApp / Social Card</span>
        </div>

        {/* Mimic a WhatsApp chat bubble with an embedded link preview */}
        <div className="flex justify-start rounded-xl bg-muted/30 p-4">
          {/* Card — fixed width matches a real WhatsApp preview (~320px) */}
          <div className="w-full max-w-[320px]  cursor-pointer overflow-hidden rounded-lg border bg-card shadow-md">

            {/* Image — 16:9 aspect ratio, same as WhatsApp renders OG images */}
            <div className="relative aspect-video w-full">
              {showImage ? (
                useNextImage ? (
                  <NextImage
                    key={resolvedSrc}
                    src={resolvedSrc}
                    alt={socialTitle}
                    fill
                    sizes="320px"
                    className="object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={resolvedSrc}
                    src={resolvedSrc}
                    alt={socialTitle}
                    className="h-full w-full object-contain"
                    onError={() => setImgError(true)}
                  />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/60">
                  <div className="text-center text-muted-foreground/40">
                    <ImageIcon className="mx-auto mb-1.5 h-8 w-8" />
                    <p className="text-[11px]">
                      {resolvedSrc && imgError ? 'Image failed to load' : 'No OG image'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Text body — matches WhatsApp link preview layout */}
            <div className="border-t bg-muted/20 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {socialDomain}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">
                {socialTitle || <span className="italic text-muted-foreground">No title</span>}
              </p>
              {socialDesc && (
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {socialDesc}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
