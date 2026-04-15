'use client';

import { useState, useTransition } from 'react';
import type { ActionResponse } from '@/lib/action-response';

export function useAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionResponse<TOutput>>,
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const execute = async (input: TInput): Promise<TOutput | undefined> => {
    setError(null);
    setFieldErrors({});

    return new Promise<TOutput | undefined>((resolve) => {
      startTransition(async () => {
        const result = await action(input);
        if (result.success) {
          resolve(result.data);
        } else {
          setError(result.error ?? 'Something went wrong');
          setFieldErrors(result.fieldErrors ?? {});
          resolve(undefined);
        }
      });
    });
  };

  const reset = () => {
    setError(null);
    setFieldErrors({});
  };

  return { execute, isPending, error, fieldErrors, reset };
}
