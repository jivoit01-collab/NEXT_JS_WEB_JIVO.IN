'use client';

// ==========================================================================
// SiteChat — the WEBSITE INTEGRATION mount for the reusable AI Chat Widget.
//
// This is the only glue this phase adds: it reads the anonymous visitor id (set
// by the Cookie Consent / tracking layer) and renders <ChatWidget> on the 'web'
// channel. All gating (master AI flag, supported channel, consent) lives inside
// the widget, so this component stays a thin, logic-free mount.
//
// The widget talks ONLY to the AI Gateway — no platform is called directly here.
// ==========================================================================

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { VISITOR_STORAGE_KEY, SESSION_STORAGE_KEY } from '@/modules/core/cookie-consent/constants';

// Lazy-load the Chat Widget: its code (and everything it renders) is split into a
// separate chunk fetched only on the client, after the page is interactive — it
// never blocks first paint. No AI provider code runs until the first message.
const ChatWidget = dynamic(() => import('@/modules/platform/chat/components/chat-widget').then((m) => m.ChatWidget), {
  ssr: false,
});

/** Read visitor/session ids once at initial render (client-only, SSR-safe). */
function readIds(): { visitorId?: string; sessionId?: string } {
  if (typeof window === 'undefined') return {};
  try {
    return {
      visitorId: localStorage.getItem(VISITOR_STORAGE_KEY) ?? undefined,
      sessionId: sessionStorage.getItem(SESSION_STORAGE_KEY) ?? undefined,
    };
  } catch {
    return {};
  }
}

export function SiteChat() {
  const [ids] = useState(readIds);
  return <ChatWidget channel="web" visitorId={ids.visitorId} sessionId={ids.sessionId} />;
}
