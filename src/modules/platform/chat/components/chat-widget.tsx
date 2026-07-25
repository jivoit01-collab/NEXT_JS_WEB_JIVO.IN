'use client';

// ==========================================================================
// ChatWidget — the top-level, drop-anywhere AI chat. Composes the launcher +
// panel + a reused Feedback dialog. It owns only view wiring: message-action and
// card-action routing, reaction state, local conversation history and gating.
// ALL business logic remains in the server action (via useChat). No platform is
// called directly. Consent-gated + master-AI-flag gated + channel gated.
// ==========================================================================

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CookieConsentContext } from '@/modules/core/cookie-consent/context';
import { platformEvents } from '@/modules/core/events';
import { isAiEnabled } from '@/modules/platform/gateway/feature';
import { useFeedback, FeedbackDialog } from '@/modules/platform/feedback';
import type { ExperienceCard } from '@/modules/platform/experience';
import { CHAT_CONFIG, CHAT_FEATURES } from '../config';
import { useChat } from '../hooks/use-chat';
import { CHAT_EVENTS } from '../types';
import type { ChatConversationSummary, ChatMessage } from '../types';
import { listConversations, rememberConversation } from '../utils/history';
import { ChatLauncher } from './chat-launcher';
import { ChatPanel } from './chat-panel';
import type { MessageActionKind } from './message-actions';

/** Channels on which the on-site widget renders. */
const SUPPORTED_CHANNELS = ['web'] as const;

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

  const [reactions, setReactions] = useState<Record<string, 'like' | 'dislike'>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const feedbackTriggerRef = useRef<HTMLButtonElement>(null);

  // Consent — read the context directly (unconditional hook), null-safe.
  // The FLOATING LAUNCHER shows whenever AI is enabled + the channel is supported;
  // consent gates only the CHAT PANEL (personalized AI needs PREFERENCES consent).
  // Requiring consent for the launcher hid it from every first-time visitor.
  const consent = useContext(CookieConsentContext);
  const consentOk = ignoreConsent || (consent ? consent.isAllowed(CHAT_CONFIG.requiredConsent) : false);
  const channelOk = (SUPPORTED_CHANNELS as readonly string[]).includes(channel);
  const aiOn = isAiEnabled();
  const canShowLauncher = CHAT_FEATURES.widget && aiOn && channelOk;

  // Dev diagnostic: log the exact reason the widget/launcher is hidden.
  if (process.env.NODE_ENV !== 'production' && !canShowLauncher) {
    const reasons = [
      !CHAT_FEATURES.widget && 'CHAT_FEATURES.widget is false',
      !aiOn && 'AI is disabled (isAiEnabled() === false: check NEXT_PUBLIC_AI_ENABLED / AI_ENABLED / PLATFORM_FEATURES.ai)',
      !channelOk && `channel "${channel}" not in supported channels [${SUPPORTED_CHANNELS.join(', ')}]`,
    ].filter(Boolean);
    console.warn('[ChatWidget] launcher hidden —', reasons.join('; '));
  }

  // Remember conversations locally for the history sidebar.
  useEffect(() => {
    if (chat.conversationId && chat.messages.length > 0) {
      const firstUser = chat.messages.find((m) => m.role === 'user');
      rememberConversation(
        chat.conversationId,
        firstUser?.content.slice(0, 48) ?? 'New conversation',
        chat.messages.length,
        chat.messages[chat.messages.length - 1]?.createdAt ?? new Date().toISOString(),
      );
    }
  }, [chat.conversationId, chat.messages]);

  const openHistory = useCallback(() => {
    setConversations(listConversations());
    setShowHistory((s) => !s);
  }, []);

  const onCardAction = useCallback(
    (_card: ExperienceCard, action: string, target?: string) => {
      if (action === 'open_link' && target) {
        if (target.startsWith('http')) window.open(target, '_blank', 'noopener');
        else router.push(target);
        return;
      }
      if (action === 'view_product') {
        router.push('/our-products');
        return;
      }
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
    [router, feedback],
  );

  const onMessageAction = useCallback(
    (m: ChatMessage, kind: MessageActionKind) => {
      switch (kind) {
        case 'like':
          setReactions((r) => ({ ...r, [m.id]: 'like' }));
          void feedback.submit({ type: 'GENERAL', entityType: 'AI_CHAT', entityId: chat.conversationId ?? undefined, rating: 5, message: 'Helpful AI answer' });
          break;
        case 'dislike':
          setReactions((r) => ({ ...r, [m.id]: 'dislike' }));
          // Open the reusable Feedback dialog for detail (no duplicate form).
          feedbackTriggerRef.current?.click();
          break;
        case 'feedback':
          feedbackTriggerRef.current?.click();
          break;
        case 'regenerate':
          void chat.regenerate();
          break;
        case 'share':
          shareMessage(m.content);
          break;
      }
    },
    [feedback, chat],
  );

  if (!canShowLauncher) return null;

  // Launcher click: if personalization consent is missing, guide the user to the
  // cookie preferences instead of silently doing nothing; otherwise open the chat.
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
          reactions={reactions}
          conversations={conversations}
          activeId={chat.conversationId}
          showHistory={showHistory}
          onToggleHistory={openHistory}
          onSelectConversation={(id) => {
            setShowHistory(false);
            void chat.openConversation(id);
          }}
          onNewChat={() => {
            setShowHistory(false);
            chat.newChat();
          }}
          onSend={chat.send}
          onMinimize={chat.minimize}
          onClose={chat.close}
          onCardAction={onCardAction}
          onMessageAction={onMessageAction}
        />
      ) : null}

      {!(consentOk && chat.panel === 'open') ? (
        <ChatLauncher panel={chat.panel} onClick={onLauncherClick} />
      ) : null}

      {/* Reused Feedback dialog — opened programmatically on dislike/feedback. */}
      <FeedbackDialog
        type="GENERAL"
        entityType="AI_CHAT"
        entityId={chat.conversationId ?? undefined}
        title="Help us improve"
        description="Tell us what went wrong with this answer."
        trigger={<button ref={feedbackTriggerRef} type="button" aria-hidden="true" className="hidden" />}
      />
    </>
  );
}

/** Share via the Web Share API when available (future-ready; graceful no-op). */
function shareMessage(text: string): void {
  platformEvents.emit(CHAT_EVENTS.CARD_CLICKED, { kind: 'share' });
  try {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      void (navigator as Navigator & { share: (d: { text: string }) => Promise<void> }).share({ text });
    }
  } catch {
    /* ignore */
  }
}
