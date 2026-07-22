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
  /** Render the contact field ABOVE the rating (e.g. in the review dialog). */
  contactFirst?: boolean;
  /** Require a rating before submit. */
  requireRating?: boolean;
  /** Require a message before submit. */
  requireMessage?: boolean;
  /** Require the contact field before submit. */
  requireContact?: boolean;
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
 * number (exactly 10 digits, optional country code). Empty is treated as valid
 * here — required-ness is enforced separately by the caller.
 */
function validateContact(raw: string): { ok: boolean; type?: 'email' | 'phone'; error?: string } {
  const v = raw.trim();
  if (!v) return { ok: true };
  if (v.includes('@')) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return ok ? { ok: true, type: 'email' } : { ok: false, error: 'Enter a valid email address.' };
  }
  // Strip formatting; require a 10-digit mobile (with an optional 1–3 digit country code).
  const digits = v.replace(/\D/g, '');
  const ok = /^\d{1,3}?\d{10}$/.test(digits) && digits.length >= 10 && digits.length <= 13;
  return ok ? { ok: true, type: 'phone' } : { ok: false, error: 'Enter a valid 10-digit mobile number.' };
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
  contactFirst = false,
  requireRating = false,
  requireMessage = false,
  requireContact = false,
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
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

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

    let invalid = false;

    // Rating (required when asked).
    if (showRating && requireRating && !rating) {
      setRatingError('Please select a rating.');
      invalid = true;
    } else setRatingError(null);

    // Message (required when asked).
    if (requireMessage && !message.trim()) {
      setMessageError('Please write your feedback.');
      invalid = true;
    } else setMessageError(null);

    // Contact — required when asked; if present it must be a valid email/mobile.
    let metadata: Record<string, unknown> | undefined;
    if (showContact) {
      const check = validateContact(contact);
      if (requireContact && !contact.trim()) {
        setContactError('Email or mobile number is required.');
        invalid = true;
      } else if (!check.ok) {
        setContactError(check.error ?? 'Enter a valid email or mobile number.');
        invalid = true;
      } else {
        setContactError(null);
        if (contact.trim()) metadata = { contact: contact.trim(), contactType: check.type };
      }
    }

    if (invalid) return;

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

  // The contact field — placed above the rating (contactFirst) or after the message.
  const contactField = showContact ? (
    <div>
      <input
        type="text"
        value={contact}
        onChange={(e) => {
          setContact(e.target.value);
          if (contactError) setContactError(null);
        }}
        onBlur={() => {
          if (!contact.trim()) return;
          const check = validateContact(contact);
          setContactError(check.ok ? null : (check.error ?? null));
        }}
        placeholder="Email or Mobile Number"
        className={cn(inputCls, contactError && 'border-red-500 focus:ring-red-500/20')}
        aria-label="Email or Mobile Number"
        aria-required={requireContact}
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
  ) : null;

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

      {/* Contact first (e.g. the review dialog) — above the rating. */}
      {contactFirst && contactField}

      {showRating && (
        <div>
          <span className="text-muted-foreground mb-1.5 block text-xs font-jost-medium">
            Rating{requireRating ? ' *' : ''}
          </span>
          <StarRating value={rating} onChange={(v) => { setRating(v); if (ratingError) setRatingError(null); }} />
          {ratingError && <p className="mt-1 text-xs text-red-500">{ratingError}</p>}
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

      <div>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (messageError) setMessageError(null);
          }}
          placeholder={messagePlaceholder}
          rows={4}
          maxLength={5000}
          className={cn(inputCls, 'resize-y', messageError && 'border-red-500 focus:ring-red-500/20')}
          aria-label="Message"
          aria-required={requireMessage}
          aria-invalid={!!messageError}
        />
        {messageError && <p className="mt-1 text-xs text-red-500">{messageError}</p>}
      </div>

      {/* Contact after the message (default placement). */}
      {!contactFirst && contactField}

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
