'use client';

import { useEffect, useState, type ComponentType } from 'react';

export function PublicRuntime() {
  const [OfflineIndicator, setOfflineIndicator] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadOfflineIndicator = async () => {
      const offlineModule = await import('./offline-indicator');
      if (!cancelled) setOfflineIndicator(() => offlineModule.OfflineIndicator);
    };

    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(loadOfflineIndicator, { timeout: 4000 });
    } else {
      timeoutHandle = setTimeout(loadOfflineIndicator, 2500);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    };
  }, []);

  return <>{OfflineIndicator ? <OfflineIndicator /> : null}</>;
}
