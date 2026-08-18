'use client';

// ==========================================================================
// LinkPreviewCard — the ONE generic link unfurl used by every chat preview.
//
// WhatsApp-style: image, title, description, domain — and the WHOLE card is the
// click target. There is deliberately no inner button, no "Learn More →" and no
// arrow, because a nested control inside a clickable card is both a duplicate
// CTA and an accessibility problem.
//
// It is generic on purpose: any public Jivo page works by passing its metadata,
// so no per-product card component is ever needed.
// ==========================================================================

import { useState } from 'react';

export interface LinkPreview {
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  domain?: string | null;
}

export function LinkPreviewCard({
  preview,
  onOpen,
}: {
  preview: LinkPreview;
  onOpen: (url: string) => void;
}) {
  // A stored image can 404 or be an unreadable type. Track failures so a broken
  // <img> icon is never rendered — the card just loses its image band.
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(preview.image) && !imageFailed;

  return (
    <button
      type="button"
      onClick={() => onOpen(preview.url)}
      // The whole card is the control. `text-left` because a button centres by
      // default, which would otherwise centre the title and description.
      className="group mt-2 block w-full cursor-pointer overflow-hidden rounded-xl border border-black/10 bg-white/70 text-left transition-colors duration-300 hover:border-[#0a7d3f]/40 hover:bg-white focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      {showImage ? (
        // Fixed 16/9 band so the card never shifts layout while the image loads.
        <div className="relative aspect-video w-full overflow-hidden bg-[#f0efe9] dark:bg-white/5">
          {/* Plain <img>: the source is a CMS-managed upload URL on a domain that
              varies by environment, so next/image would need dynamic remote-host
              config for no visual gain at this size.
              eslint-disable-next-line @next/next/no-img-element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image ?? ''}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        </div>
      ) : null}

      <div className="p-3">
        <div className="text-sm font-medium transition-colors duration-300 group-hover:text-[#0a7d3f]">
          {preview.title}
        </div>
        {preview.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs opacity-70">{preview.description}</p>
        ) : null}
        {preview.domain ? (
          <div className="mt-1.5 text-[11px] uppercase tracking-wide opacity-50">{preview.domain}</div>
        ) : null}
      </div>
    </button>
  );
}
