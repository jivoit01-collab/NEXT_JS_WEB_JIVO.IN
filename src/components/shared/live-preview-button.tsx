'use client';

import { ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getPublicPreviewUrl } from '@/lib/preview-utils';

interface LivePreviewButtonProps {
  className?: string;
  label?: string;
  iconOnly?: boolean;
}

export function LivePreviewButton({
  className,
  label = 'Live Preview',
  iconOnly = false,
}: LivePreviewButtonProps) {
  const pathname = usePathname();
  const previewUrl = getPublicPreviewUrl(pathname);
  const accessibleLabel = label || 'Live Preview';

  return (
    <a
      href={previewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        iconOnly ? 'h-9 w-9 px-0' : 'h-10 px-4',
        className,
      )}
      aria-label={`Open ${accessibleLabel}`}
      title={previewUrl}
    >
      <ExternalLink className="h-4 w-4" />
      {!iconOnly && <span>{label}</span>}
    </a>
  );
}
