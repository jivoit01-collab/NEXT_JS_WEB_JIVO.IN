'use client';

import { useEffect, useState, type ComponentType } from 'react';

type ToasterComponent = ComponentType<{
  richColors?: boolean;
  position?: 'top-right';
  theme?: 'dark' | 'light' | 'system';
}>;

export function PublicRuntime() {
  const [OfflineIndicator, setOfflineIndicator] = useState<ComponentType | null>(null);
  const [BlockedToast, setBlockedToast] = useState<ComponentType | null>(null);
  const [Toaster, setToaster] = useState<ToasterComponent | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBlockedToast = async () => {
      const [{ Toaster: SonnerToaster }, blockedModule] = await Promise.all([
        import('sonner'),
        import('./blocked-toast'),
      ]);
      if (cancelled) return;
      setToaster(() => SonnerToaster as ToasterComponent);
      setBlockedToast(() => blockedModule.BlockedToast);
    };

    const loadOfflineIndicator = async () => {
      const offlineModule = await import('./offline-indicator');
      if (!cancelled) setOfflineIndicator(() => offlineModule.OfflineIndicator);
    };

    const hasBlockedCookie = document.cookie
      .split(';')
      .some((item) => item.trim() === 'admin_blocked=1');
    const hasBlockedParam = new URLSearchParams(window.location.search).get('error') === 'blocked';

    if (hasBlockedCookie || hasBlockedParam) {
      loadBlockedToast();
    }

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

  return (
    <>
      {OfflineIndicator ? <OfflineIndicator /> : null}
      {Toaster ? <Toaster richColors position="top-right" theme="dark" /> : null}
      {BlockedToast ? <BlockedToast /> : null}
    </>
  );
}
