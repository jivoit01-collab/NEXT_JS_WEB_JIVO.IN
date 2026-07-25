'use client';

// Message list — modern chat transcript: avatars, markdown, Experience Cards,
// per-message actions, timestamps, status, entry animation and auto-scroll.
// Long conversations are windowed (only the most recent N are mounted) to keep
// rendering cheap. Rows are memoized to avoid unnecessary re-renders.
import { memo, useEffect, useMemo, useRef } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { platformEvents } from '@/modules/core/events';
import type { ExperienceCard } from '@/modules/platform/experience';
import type { ChatMessage } from '../types';
import { CHAT_EVENTS } from '../types';
import { CHAT_FEATURES } from '../config';
import { formatTime } from '../utils';
import { TypingIndicator } from './typing-indicator';
import { ExperienceCards, type CardActionContext } from './cards/card-renderer';
import { AiAvatar } from './ai-avatar';
import { MessageActions, type MessageActionKind } from './message-actions';
import { Markdown } from './markdown';

const WINDOW = 60; // mount at most this many recent messages

function StatusIcon({ status }: { status: ChatMessage['status'] }) {
  if (!CHAT_FEATURES.messageStatus) return null;
  if (status === 'sent') return <Check className="h-3 w-3 opacity-50" />;
  if (status === 'error') return <AlertCircle className="h-3 w-3 text-red-500" />;
  return null;
}

interface RowProps {
  m: ChatMessage;
  busy: boolean;
  reaction: 'like' | 'dislike' | null;
  cardCtx: CardActionContext;
  onMessageAction: (m: ChatMessage, kind: MessageActionKind) => void;
}

const MessageRow = memo(function MessageRow({ m, busy, reaction, cardCtx, onMessageAction }: RowProps) {
  const isUser = m.role === 'user';
  const streaming = m.status === 'streaming';

  return (
    <div className={`flex animate-[fadeIn_0.2s_ease] gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? <AiAvatar size={28} /> : null}
      <div className={`group max-w-[82%] ${isUser ? 'order-2' : ''}`}>
        <div
          className={`rounded-2xl px-3 py-2 ${
            isUser
              ? 'rounded-br-sm bg-emerald-600 text-white'
              : 'rounded-bl-sm bg-black/5 text-black dark:bg-white/10 dark:text-white'
          }`}
        >
          {streaming ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
          ) : (
            <Markdown text={m.content} />
          )}
        </div>

        {/* Experience cards on assistant messages. */}
        {!isUser && m.plan && CHAT_FEATURES.experienceCards ? <ExperienceCards cards={m.plan.cards} ctx={cardCtx} /> : null}

        <div className={`mt-0.5 flex items-center gap-1 px-1 text-[10px] opacity-60 ${isUser ? 'justify-end' : ''}`}>
          {formatTime(m.createdAt)}
          <StatusIcon status={m.status} />
        </div>

        {/* Per-assistant-message actions. */}
        {!isUser && !streaming ? (
          <MessageActions
            content={m.content}
            disabled={busy}
            reaction={reaction}
            onAction={(kind) => onMessageAction(m, kind)}
          />
        ) : null}
      </div>
    </div>
  );
});

export function MessageList({
  messages,
  busy,
  reactions,
  onCardAction,
  onMessageAction,
}: {
  messages: ChatMessage[];
  busy: boolean;
  reactions: Record<string, 'like' | 'dislike'>;
  onCardAction: (card: ExperienceCard, action: string, target?: string) => void;
  onMessageAction: (m: ChatMessage, kind: MessageActionKind) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (CHAT_FEATURES.autoScroll) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const cardCtx: CardActionContext = useMemo(
    () => ({
      onCardAction: (card, action, target) => {
        platformEvents.emit(CHAT_EVENTS.CARD_CLICKED, { kind: card.kind, action });
        onCardAction(card, action, target);
      },
    }),
    [onCardAction],
  );

  // Windowing: only mount the most recent WINDOW messages when virtualizing.
  const visible =
    CHAT_FEATURES.virtualizeMessages && messages.length > WINDOW ? messages.slice(messages.length - WINDOW) : messages;
  const hidden = messages.length - visible.length;

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3" aria-live="polite" aria-label="Conversation">
      {hidden > 0 ? (
        <p className="py-1 text-center text-[11px] opacity-50">{hidden} earlier messages hidden</p>
      ) : null}
      {visible.map((m) => (
        <MessageRow
          key={m.id}
          m={m}
          busy={busy}
          reaction={reactions[m.id] ?? null}
          cardCtx={cardCtx}
          onMessageAction={onMessageAction}
        />
      ))}
      <div ref={endRef} />
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
