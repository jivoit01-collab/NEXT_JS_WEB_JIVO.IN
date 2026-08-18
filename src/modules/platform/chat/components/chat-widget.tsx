'use client';

// ==========================================================================
// ChatWidget — the top-level, drop-anywhere AI chat (simplified, Phase 8.2).
// One visitor = one conversation (no history / new-chat / reactions). It owns
// only view wiring: card-action routing + gating. ALL business logic stays in
// the server action (via useChat). Consent- + master-flag- + channel-gated.
// ==========================================================================

import { useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { CookieConsentContext } from '@/modules/core/cookie-consent/context';
import { SHOP_URL, PUBLIC_SITE_URL } from '@/lib/constants';
import { isAiEnabled } from '@/modules/platform/gateway/feature';
import { useFeedback } from '@/modules/platform/feedback';
import type { ExperienceCard } from '@/modules/platform/experience';
import { CHAT_CONFIG, CHAT_FEATURES } from '../config';
import { useChat } from '../hooks/use-chat';
import { ChatLauncher } from './chat-launcher';
import { ChatPanel } from './chat-panel';

/** Channels on which the on-site widget renders. */
const SUPPORTED_CHANNELS = ['web'] as const;

// The storefront URL comes from the shared, environment-aware config in
// lib/constants — never hardcoded here.

export interface ChatWidgetProps {
  visitorId?: string;
  userId?: string;
  sessionId?: string;
  channel?: 'web' | 'mobile' | 'admin' | 'whatsapp' | 'api';
  ignoreConsent?: boolean;
}

export function ChatWidget({
  visitorId,
  userId,
  sessionId,
  channel = 'web',
  ignoreConsent = false,
}: ChatWidgetProps) {
  const router = useRouter();
  const chat = useChat({ visitorId, userId, sessionId });
  const feedback = useFeedback(); // reuses the Feedback Platform (no new form)

  // Consent — read the context directly (unconditional hook), null-safe. The
  // launcher shows whenever AI is enabled + channel supported; consent gates only
  // the chat PANEL (personalized AI needs PREFERENCES consent).
  const consent = useContext(CookieConsentContext);
  const consentOk = ignoreConsent || (consent ? consent.isAllowed(CHAT_CONFIG.requiredConsent) : false);
  const channelOk = (SUPPORTED_CHANNELS as readonly string[]).includes(channel);
  const aiOn = isAiEnabled();
  const canShowLauncher = CHAT_FEATURES.widget && aiOn && channelOk;

  if (process.env.NODE_ENV !== 'production' && !canShowLauncher) {
    const reasons = [
      !CHAT_FEATURES.widget && 'CHAT_FEATURES.widget is false',
      !aiOn && 'AI is disabled (isAiEnabled() === false: check NEXT_PUBLIC_AI_ENABLED / AI_ENABLED / PLATFORM_FEATURES.ai)',
      !channelOk && `channel "${channel}" not in supported channels [${SUPPORTED_CHANNELS.join(', ')}]`,
    ].filter(Boolean);
    console.warn('[ChatWidget] launcher hidden —', reasons.join('; '));
  }

  /**
   * Open a destination the right way.
   *
   * SAME ORIGIN as the page the visitor is on → navigate IN PLACE, so they keep
   * their tab (and their conversation). ANY other origin → new tab.
   *
   * The comparison is on the resolved ORIGIN, not the URL's shape: preview cards
   * carry absolute URLs built from the environment's public origin
   * ("http://localhost:3000/products/canola-oils" in dev, "https://jivo.in/…" in
   * production), so a naive "starts with http → external" test wrongly sent
   * same-site pages to a new tab.
   */
  const openTarget = useCallback(
    (target: string) => {
      let url: URL;
      try {
        // A relative path resolves against the current page, so it is same-origin
        // by construction.
        url = new URL(target, window.location.href);
      } catch {
        return;
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

      // Cards advertise the PUBLIC origin (never "localhost"), so a link to our
      // own site can carry a different origin than the one being browsed. Treat
      // the public site as "this site" and navigate to its PATH in place.
      const isOwnSite =
        url.origin === window.location.origin ||
        url.origin === PUBLIC_SITE_URL.replace(/\/$/, '');

      if (isOwnSite) {
        router.push(url.pathname + url.search + url.hash);
        chat.close();
      } else {
        window.open(url.href, '_blank', 'noopener,noreferrer');
      }
    },
    [router, chat],
  );

  const onCardAction = useCallback(
    (_card: ExperienceCard, action: string, target?: string) => {
      // The storefront is a separate property, so it follows the same rule and
      // ends up in a new tab — unless the site is ever served from that origin.
      if (action === 'view_product' || action === 'buy_product') {
        openTarget(target ?? SHOP_URL);
        return;
      }
      if (action === 'open_link' && target) {
        openTarget(target);
        return;
      }
      // Feedback CTA (👍/👎 on a Feedback card) → Feedback Platform (AI_CHAT).
      if (action === 'feedback_yes' || action === 'feedback_no') {
        void feedback.submit({
          type: 'GENERAL',
          entityType: 'AI_CHAT',
          entityId: target ?? undefined,
          rating: action === 'feedback_yes' ? 5 : 1,
          message: action === 'feedback_yes' ? 'Helpful AI answer' : 'Unhelpful AI answer',
        });
      }
    },
    [feedback, openTarget],
  );

  if (!canShowLauncher) return null;

  const onLauncherClick = () => {
    if (!consentOk && consent?.openPreferences) {
      consent.openPreferences();
      return;
    }
    void chat.open();
  };

  return (
    <>
      {consentOk && chat.panel === 'open' ? (
        <ChatPanel
          messages={chat.messages}
          questions={chat.questions}
          busy={chat.busy}
          onSend={chat.send}
          onClose={chat.close}
          onCardAction={onCardAction}
        />
      ) : null}

      {!(consentOk && chat.panel === 'open') ? (
        <ChatLauncher panel={chat.panel} onClick={onLauncherClick} />
      ) : null}
    </>
  );
}
