'use client';

// ==========================================================================
// Knowledge client hook — thin wrapper over the search action. The admin Search
// page (and future AI UIs) use this. State-only; no data access on the client.
// ==========================================================================

import { useCallback, useState } from 'react';
import { searchKnowledgeAction } from '../actions';
import type { KnowledgeSearchResult, SearchMode, SearchFilters } from '../types';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useKnowledgeSearch() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<KnowledgeSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(
    async (query: string, opts?: { mode?: SearchMode; filters?: SearchFilters; limit?: number }) => {
      if (!query.trim()) return;
      setStatus('loading');
      setError(null);
      const res = await searchKnowledgeAction({ query, ...opts });
      if (res.success) {
        setResult(res.data);
        setStatus('success');
      } else {
        setError(res.error);
        setStatus('error');
      }
    },
    [],
  );

  return {
    runSearch,
    result,
    error,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
