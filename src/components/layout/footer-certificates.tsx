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
      {certificates.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {certificates.map((cert) => (
            <button
              key={cert.id}
              type="button"
              onClick={() => setPreview(cert)}
              aria-label={`Preview ${cert.alt}`}
              className="rounded-md ring-1 ring-black/5 transition duration-300 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:ring-[#0a7d3f]/40 focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none"
            >
              <SafeImage
                src={cert.src}
                alt={cert.alt}
                width={140}
                height={64}
                className="h-11 w-auto rounded-md bg-white object-contain p-1 2xl:h-12"
              />
            </button>
          ))}
        </div>
      )}

      {caption && (
        <p className="max-w-[15ch] text-xs leading-snug text-[#586055] sm:text-[13px] 2xl:text-sm">
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
