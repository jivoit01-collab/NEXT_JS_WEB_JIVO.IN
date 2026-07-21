'use client';

import { useEffect, useRef } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { platformEvents } from '@/modules/core/events';
import { getOrCreateVisitorId } from '@/modules/core/cookie-consent/data';
import { AUTH_EVENTS } from '../types';
import { AUTH_CONFIG } from '../config';
import { linkVisitorAction } from '../actions';

/**
 * Bridges NextAuth session lifecycle → the platform event bus + visitor merge.
 * On login it: emits `auth:login` (+ rich auth events), links the anonymous
 * Core visitor to the user (so analytics/sessions/events are never lost), and
 * emits `account_linked`. On logout it emits the logout events.
 *
 * All decoupled — no module is imported that shouldn't be; subscribers (AI,
 * analytics, business) react without auth knowing about them.
 */
function AuthBridge({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  const prevStatus = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && prevStatus.current !== 'authenticated' && data?.user?.id) {
      const userId = data.user.id;
      platformEvents.emit('auth:login', { userId });
      platformEvents.emit(AUTH_EVENTS.USER_LOGIN, { userId, role: data.user.role });

      // Visitor merge — link this browser's anonymous visitor to the user.
      // Runs at most ONCE per session (idempotent server-side too) so reloads
      // don't re-fire the link write.
      const visitorId = getOrCreateVisitorId();
      const mergeKey = `${AUTH_CONFIG.storageKeys.merged}.${userId}`;
      let alreadyMerged = false;
      try {
        alreadyMerged = window.sessionStorage.getItem(mergeKey) === '1';
      } catch {
        /* private mode — fall through and merge (server upsert is idempotent) */
      }
      if (visitorId && !alreadyMerged) {
        void linkVisitorAction(visitorId).then((r) => {
          if (r.success) {
            try {
              window.sessionStorage.setItem(mergeKey, '1');
            } catch {
              /* ignore */
            }
            platformEvents.emit(AUTH_EVENTS.ACCOUNT_LINKED, { userId, visitorId });
          }
        });
      }
    }

    if (status === 'unauthenticated' && prevStatus.current === 'authenticated') {
      platformEvents.emit('auth:logout', {});
      platformEvents.emit(AUTH_EVENTS.USER_LOGOUT, {});
    }

    prevStatus.current = status;
  }, [status, data]);

  return <>{children}</>;
}

/**
 * Mount ONCE high in the tree (the public layout does). Provides the NextAuth
 * session to the whole app and wires auth ↔ platform. Reuses the existing
 * NextAuth setup — it does NOT create a new session system.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthBridge>{children}</AuthBridge>
    </SessionProvider>
  );
}
