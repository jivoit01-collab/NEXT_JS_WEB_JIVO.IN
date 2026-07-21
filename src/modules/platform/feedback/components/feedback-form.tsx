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
  /** Collect one "Email or Mobile Number" field (stored in metadata.contact). */
  showContact?: boolean;
  /** Heading text; pass an empty string to hide the form's own header (e.g. in a dialog). */
  heading?: string;
  description?: string;
  titlePlaceholder?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  /** When set, a Cancel button is shown beside Submit (used by the dialog). */
  onCancel?: () => void;
  /** Drop the card chrome (border/bg/padding) — for embedding inside a dialog. */
  bare?: boolean;
  onSuccess?: () => void;
  className?: string;
}

/**
 * Validate the single contact field: an "@" means email, otherwise a mobile
 * number. Empty is allowed (the field is optional); non-empty must be valid.
 */
function validateContact(raw: string): { ok: boolean; type?: 'email' | 'phone'; error?: string } {
  const v = raw.trim();
  if (!v) return { ok: true };
  if (v.includes('@')) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return ok ? { ok: true, type: 'email' } : { ok: false, error: 'Enter a valid email address.' };
  }
  const digits = v.replace(/[\s\-().]/g, '');
  const ok = /^\+?\d{7,15}$/.test(digits);
  return ok ? { ok: true, type: 'phone' } : { ok: false, error: 'Enter a valid mobile number.' };
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
  showContact = false,
  heading = 'Share your feedback',
  description,
  titlePlaceholder = 'Subject',
  messagePlaceholder = 'Tell us more…',
  submitLabel = 'Send feedback',
  onCancel,
  bare = false,
  onSuccess,
  className,
}: FeedbackFormProps) {
  const { submit, error, isSubmitting, isSuccess } = useFeedback();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [contactError, setContactError] = useState<string | null>(null);

  if (isSuccess) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-2 p-6 text-center',
          !bare && 'bg-card rounded-2xl border',
          className,
        )}
        role="status"
        aria-live="polite"
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

    // Contact is optional, but if provided it must be a valid email or mobile.
    let metadata: Record<string, unknown> | undefined;
    if (showContact) {
      const check = validateContact(contact);
      if (!check.ok) {
        setContactError(check.error ?? 'Enter a valid email or mobile number.');
        return;
      }
      setContactError(null);
      if (contact.trim()) metadata = { contact: contact.trim(), contactType: check.type };
    }

    const ok = await submit({
      type,
      source,
      entityType,
      entityId,
      rating: showRating && rating ? rating : undefined,
      title: showTitle && title.trim() ? title.trim() : undefined,
      message: message.trim() || undefined,
      metadata,
    });
    if (ok) onSuccess?.();
  };

  const inputCls =
    'w-full rounded-xl border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';

  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-3', !bare && 'bg-card rounded-2xl border p-5', className)}
    >
      {heading && (
        <div>
          <h3 className="font-jost-bold text-base">{heading}</h3>
          {description && <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>}
        </div>
      )}

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

      {showContact && (
        <div>
          <input
            type="text"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              if (contactError) setContactError(null);
            }}
            onBlur={() => {
              const check = validateContact(contact);
              setContactError(check.ok ? null : (check.error ?? null));
            }}
            placeholder="Email or Mobile Number"
            className={cn(inputCls, contactError && 'border-red-500 focus:ring-red-500/20')}
            aria-label="Email or Mobile Number"
            aria-invalid={!!contactError}
            aria-describedby={contactError ? 'feedback-contact-error' : undefined}
            inputMode="text"
            autoComplete="off"
          />
          {contactError && (
            <p id="feedback-contact-error" className="mt-1 text-xs text-red-500">
              {contactError}
            </p>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className={cn('flex gap-2', onCancel ? 'flex-col-reverse sm:flex-row sm:justify-end' : '')}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-input hover:bg-accent inline-flex min-h-10 items-center justify-center rounded-xl border px-4 py-2 text-sm font-jost-medium transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'bg-primary text-primary-foreground inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-jost-medium transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60',
            onCancel ? 'sm:min-w-40' : 'w-full',
          )}
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
          {submitLabel}
        </button>
      </div>
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
