'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FeedbackForm } from './feedback-form';
import { isFeedbackFeatureEnabled } from '../config';

/**
 * The reusable "Was this page helpful?" block — the SAME FeedbackForm engine,
 * preset for PAGE feedback and auto-scoped to the current page (entityId =
 * pathname). Mount once in the public layout → every page gets it. Anchor id
 * `feedback` so links (e.g. footer "Send feedback") can jump here.
 */
export function PageFeedback({ className }: { className?: string }) {
  const pathname = usePathname();
  if (!isFeedbackFeatureEnabled('forms')) return null;

  return (
    <section id="feedback" className={cn('mx-auto w-full max-w-2xl px-4 py-10 2xl:py-14', className)}>
      <FeedbackForm
        type="PAGE"
        source="PAGE"
        entityType="PAGE"
        entityId={pathname}
        showRating
        heading="Was this page helpful?"
        description="Your feedback helps us improve."
        messagePlaceholder="Anything we can do better? (optional)"
        submitLabel="Send feedback"
      />
    </section>
  );
}
