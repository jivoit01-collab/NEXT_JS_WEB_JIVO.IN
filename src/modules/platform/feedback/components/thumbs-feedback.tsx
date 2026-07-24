'use client';

import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeedback } from '../hooks';
import type { FeedbackEntityType, FeedbackSource } from '../types';

/**
 * Quick 👍 / 👎 feedback — reuses the same backend as every other component.
 * Drop it under any content/answer/product.
 */
export function ThumbsFeedback({
  question = 'Was this helpful?',
  source = 'WEBSITE',
  entityType,
  entityId,
  className,
}: {
  question?: string;
  source?: FeedbackSource;
  entityType?: FeedbackEntityType;
  entityId?: string;
  className?: string;
}) {
  const { submit, isSuccess, isSubmitting } = useFeedback();

  if (isSuccess) {
    return (
      <p className={cn('text-muted-foreground flex items-center gap-1.5 text-sm', className)}>
        <Check size={15} className="text-primary" /> Thanks for your feedback!
      </p>
    );
  }

  const send = (rating: number, label: string) =>
    submit({ type: 'GENERAL', source, entityType, entityId, rating, message: label });

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-muted-foreground text-sm">{question}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => send(5, 'Helpful')}
          aria-label="Helpful"
          className="hover:border-primary/40 hover:text-primary flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
        >
          <ThumbsUp size={15} />
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => send(1, 'Not helpful')}
          aria-label="Not helpful"
          className="hover:border-primary/40 hover:text-primary flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
        >
          <ThumbsDown size={15} />
        </button>
      </div>
    </div>
  );
}
