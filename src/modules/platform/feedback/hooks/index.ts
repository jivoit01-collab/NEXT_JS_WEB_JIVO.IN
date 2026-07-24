'use client';

import { useCallback, useState } from 'react';
import { getOrCreateVisitorId, getOrCreateSessionId } from '@/modules/core/cookie-consent/data';
import { platformEvents } from '@/modules/core/events';
import { FEEDBACK_EVENTS, type CreateFeedbackInput } from '../types';
import { createFeedbackAction } from '../actions';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * The single client hook for submitting feedback. Reuses the Core identity
 * (visitor/session ids) and auto-fills page context. Publishes FEEDBACK_CREATED
 * on the client bus after success. Every feedback component uses this.
 */
export function useFeedback() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (input: CreateFeedbackInput): Promise<boolean> => {
    setStatus('submitting');
    setError(null);

    const payload: CreateFeedbackInput = {
      ...input,
      visitorId: input.visitorId ?? getOrCreateVisitorId(),
      sessionId: input.sessionId ?? getOrCreateSessionId(),
      pageUrl: input.pageUrl ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
      pageTitle: input.pageTitle ?? (typeof document !== 'undefined' ? document.title : undefined),
      language: input.language ?? (typeof navigator !== 'undefined' ? navigator.language : undefined),
    };

    const res = await createFeedbackAction(payload);
    if (res.success) {
      setStatus('success');
      platformEvents.emit(FEEDBACK_EVENTS.CREATED, { id: res.data?.id, type: input.type ?? 'GENERAL' });
      return true;
    }
    setStatus('error');
    setError(res.error);
    return false;
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    submit,
    reset,
    status,
    error,
    isSubmitting: status === 'submitting',
    isSuccess: status === 'success',
  };
}
