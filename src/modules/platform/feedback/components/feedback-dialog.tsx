'use client';

import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FeedbackForm, type FeedbackFormProps } from './feedback-form';

export interface FeedbackDialogProps
  extends Pick<FeedbackFormProps, 'type' | 'source' | 'entityType' | 'entityId' | 'messagePlaceholder'> {
  /** The element that opens the dialog. Defaults to a "Share Feedback" button. */
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * THE one reusable feedback dialog (Phase 6.2). A centered modal that embeds the
 * shared {@link FeedbackForm} — rating, message and a single "Email or Mobile
 * Number" field. Radix handles focus trap, ESC, click-outside and ARIA; the form
 * handles loading/success/error. Configurable per context (`type`/`source`/
 * `entity…`) so Home, Products, the AI chatbot, Community and Contact reuse this
 * exact component — no page-specific feedback dialogs.
 */
export function FeedbackDialog({
  trigger,
  title = 'Share your feedback',
  description = 'Tell us what you think — it helps us improve.',
  ...formProps
}: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  // Bump on each open so the embedded form remounts fresh (clears prior success/error).
  const [instance, setInstance] = useState(0);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setInstance((n) => n + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="bg-primary text-primary-foreground inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-jost-medium transition-all hover:-translate-y-0.5"
          >
            <MessageSquarePlus size={16} />
            Share Feedback
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <FeedbackForm
          key={instance}
          bare
          heading=""
          showRating
          showContact
          submitLabel="Submit Feedback"
          messagePlaceholder="Tell us what's on your mind…"
          onCancel={() => setOpen(false)}
          onSuccess={() => window.setTimeout(() => setOpen(false), 1600)}
          {...formProps}
        />
      </DialogContent>
    </Dialog>
  );
}
