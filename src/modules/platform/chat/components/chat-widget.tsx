'use client';

// ==========================================================================
// ChatWidget — the top-level, drop-anywhere AI chat (simplified, Phase 8.2).
// One visitor = one conversation (no history / new-chat / reactions). It owns
// only view wiring: card-action routing + gating. ALL business logic stays in
// the server action (via useChat). Consent- + master-flag- + channel-gated.
// ==========================================================================

import { useCallback, useContext } from 'react';
import { CookieConsentContext } from '@/modules/core/cookie-consent/context';
import { isAiEnabled } from '@/modules/platform/gateway/feature';
import { useFeedback } from '@/modules/platform/feedback';
import type { ExperienceCard } from '@/modules/platform/experience';
import { CHAT_CONFIG, CHAT_FEATURES } from '../config';
import { useChat } from '../hooks/use-chat';
import { ChatLauncher } from './chat-launcher';
import { ChatPanel } from './chat-panel';

/** Channels on which the on-site widget renders. */
const SUPPORTED_CHANNELS = ['web'] as const;

/** External storefront — View Products always opens this in a new tab. */
const SHOP_URL = 'https://shop.jivo.in';

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

  const onCardAction = useCallback(
    (_card: ExperienceCard, action: string, target?: string) => {
      // View Products → the storefront, always a NEW TAB (never in-app nav).
      if (action === 'view_product' || action === 'buy_product') {
        window.open(SHOP_URL, '_blank', 'noopener,noreferrer');
        return;
      }
      if (action === 'open_link' && target) {
        if (target.startsWith('http')) window.open(target, '_blank', 'noopener,noreferrer');
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
    [feedback],
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
          onMinimize={chat.minimize}
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
