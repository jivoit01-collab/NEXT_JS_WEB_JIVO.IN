'use client';

import { useState } from 'react';
import { SafeImage } from '@/components/shared/public';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface FooterCertificate {
  id: string;
  src: string;
  alt: string;
}

interface FooterCertificatesProps {
  certificates: FooterCertificate[];
  caption?: string | null;
}

/** Footer certification badges — click a badge to preview it in a dialog. */
export function FooterCertificates({ certificates, caption }: FooterCertificatesProps) {
  const [preview, setPreview] = useState<FooterCertificate | null>(null);

  return (
    <>
      {/*
        Badges stay on ONE horizontal row (admin uploads 1–5). `flex-nowrap`
        keeps them in line. On mobile the row owns the full cell width (the
        caption drops below it), so badges keep their natural size.
      */}
      {certificates.length > 0 && (
        <div className="flex min-w-0 flex-nowrap items-center gap-2 lg:shrink">
          {certificates.map((cert) => (
            <button
              key={cert.id}
              type="button"
              onClick={() => setPreview(cert)}
              aria-label={`Preview ${cert.alt}`}
              className="min-w-0 shrink-0 rounded-md ring-1 ring-black/5 transition duration-300 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:ring-[#0a7d3f]/40 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none"
            >
              <SafeImage
                src={cert.src}
                alt={cert.alt}
                width={140}
                height={64}
                className="h-10 w-auto max-w-full rounded-md bg-white object-contain p-1 sm:h-11 lg:h-12 2xl:h-14"
              />
            </button>
          ))}
        </div>
      )}

      {/* Below the badge row on mobile (full width); to its RIGHT from lg, where
          the measure keeps it to ~2 lines. */}
      {caption && (
        <p className="min-w-0 text-[clamp(0.8rem,0.72rem+0.3vw,1rem)] leading-snug text-pretty text-[#586055] lg:max-w-[18ch]">
          {caption}
        </p>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-md border-[#e0dfd4] bg-white p-6">
          <DialogTitle className="text-center text-sm font-jost-medium tracking-wide text-[#1f3524]">
            {preview?.alt || 'Certification'}
          </DialogTitle>
          {preview && (
            <div className="flex items-center justify-center rounded-lg bg-white p-4">
              <SafeImage
                src={preview.src}
                alt={preview.alt}
                width={640}
                height={640}
                className="h-auto max-h-[60vh] w-auto object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
