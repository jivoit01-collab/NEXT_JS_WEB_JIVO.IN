'use client';

import { useState } from 'react';
import { Check, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarRating } from './star-rating';
import { useFeedback } from '../hooks';
import type { FeedbackEntityType, FeedbackSource, FeedbackType } from '../types';

export interface FeedbackFormProps {
  type?: FeedbackType;
  source?: FeedbackSource;
  entityType?: FeedbackEntityType;
  entityId?: string;
  showRating?: boolean;
  showTitle?: boolean;
  heading?: string;
  description?: string;
  titlePlaceholder?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  onSuccess?: () => void;
  className?: string;
}

/**
 * The ONE feedback form engine — every specific form (simple, detailed, bug,
 * feature, contact) is a thin preset of this. All hit the same backend.
 */
export function FeedbackForm({
  type = 'GENERAL',
  source = 'WEBSITE',
  entityType,
  entityId,
  showRating = false,
  showTitle = false,
  heading = 'Share your feedback',
  description,
  titlePlaceholder = 'Subject',
  messagePlaceholder = 'Tell us more…',
  submitLabel = 'Send feedback',
  onSuccess,
  className,
}: FeedbackFormProps) {
  const { submit, error, isSubmitting, isSuccess } = useFeedback();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  if (isSuccess) {
    return (
      <div
        className={cn(
          'bg-card flex flex-col items-center gap-2 rounded-2xl border p-6 text-center',
          className,
        )}
      >
        <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-full">
          <Check size={20} />
        </span>
        <p className="font-jost-medium text-sm">Thank you!</p>
        <p className="text-muted-foreground text-xs">Your feedback was received.</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit({
      type,
      source,
      entityType,
      entityId,
      rating: showRating && rating ? rating : undefined,
      title: showTitle && title.trim() ? title.trim() : undefined,
      message: message.trim() || undefined,
    });
    if (ok) onSuccess?.();
  };

  const inputCls =
    'w-full rounded-xl border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';

  return (
    <form onSubmit={onSubmit} className={cn('bg-card space-y-3 rounded-2xl border p-5', className)}>
      <div>
        <h3 className="font-jost-bold text-base">{heading}</h3>
        {description && <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>}
      </div>

      {showRating && (
        <div>
          <span className="text-muted-foreground mb-1.5 block text-xs font-jost-medium">Rating</span>
          <StarRating value={rating} onChange={setRating} />
        </div>
      )}

      {showTitle && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titlePlaceholder}
          maxLength={200}
          className={inputCls}
          aria-label="Subject"
        />
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={messagePlaceholder}
        rows={4}
        maxLength={5000}
        className={cn(inputCls, 'resize-y')}
        aria-label="Message"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-primary-foreground inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-jost-medium transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
        {submitLabel}
      </button>
    </form>
  );
}

type Preset = Partial<FeedbackFormProps>;

export function SimpleFeedbackForm(p: Preset) {
  return <FeedbackForm showRating heading="How was your experience?" submitLabel="Send" {...p} />;
}
export function DetailedFeedbackForm(p: Preset) {
  return <FeedbackForm showRating showTitle heading="Share your feedback" {...p} />;
}
export function BugReportForm(p: Preset) {
  return (
    <FeedbackForm
      type="BUG"
      showTitle
      heading="Report a bug"
      titlePlaceholder="What broke?"
      messagePlaceholder="Steps to reproduce, what you expected, what happened…"
      submitLabel="Submit bug report"
      {...p}
    />
  );
}
export function FeatureRequestForm(p: Preset) {
  return (
    <FeedbackForm
      type="FEATURE"
      showTitle
      heading="Request a feature"
      titlePlaceholder="Feature idea"
      messagePlaceholder="What would you like to see and why?"
      submitLabel="Submit request"
      {...p}
    />
  );
}
export function ContactFeedbackForm(p: Preset) {
  return (
    <FeedbackForm
      type="CONTACT"
      source="CONTACT_FORM"
      showTitle
      heading="Get in touch"
      titlePlaceholder="Subject"
      messagePlaceholder="How can we help?"
      submitLabel="Send message"
      {...p}
    />
  );
}
