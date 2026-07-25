'use client';

// Chat panel — responsive, theme-aware, accessible container. Header (avatar,
// title, online, new chat, history, minimize, close) + body (welcome screen or
// message list) + suggested questions + composer. Focus-trapped; ESC closes.
import { useEffect, useRef } from 'react';
import { Minus, X, Plus, History } from 'lucide-react';
import type { ExperienceCard } from '@/modules/platform/experience';
import { CHAT_CONFIG, CHAT_FEATURES } from '../config';
import type { ChatConversationSummary, ChatMessage } from '../types';
import { MessageList } from './message-list';
import { Composer } from './composer';
import { SuggestedQuestions } from './suggested-questions';
import { WelcomeScreen } from './welcome-screen';
import { ChatHistory } from './chat-history';
import { AiAvatar } from './ai-avatar';
import type { MessageActionKind } from './message-actions';

export function ChatPanel({
  messages,
  questions,
  busy,
  reactions,
  conversations,
  activeId,
  showHistory,
  onToggleHistory,
  onSelectConversation,
  onNewChat,
  onSend,
  onMinimize,
  onClose,
  onCardAction,
  onMessageAction,
}: {
  messages: ChatMessage[];
  questions: string[];
  busy: boolean;
  reactions: Record<string, 'like' | 'dislike'>;
  conversations: ChatConversationSummary[];
  activeId?: string | null;
  showHistory: boolean;
  onToggleHistory: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onSend: (text: string) => void;
  onMinimize: () => void;
  onClose: () => void;
  onCardAction: (card: ExperienceCard, action: string, target?: string) => void;
  onMessageAction: (m: ChatMessage, kind: MessageActionKind) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Accessibility: ESC closes, and focus is moved into the panel on open.
  useEffect(() => {
    const el = panelRef.current;
    el?.querySelector<HTMLElement>('textarea, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Simple focus trap within the panel.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const empty = messages.length === 0;

  return (
    <div
      ref={panelRef}
      onKeyDown={onKeyDown}
      role="dialog"
      aria-modal="false"
      aria-label={CHAT_CONFIG.brand.title}
      style={{ zIndex: 9999 }}
      className="
        fixed flex flex-col overflow-hidden bg-white text-black shadow-2xl dark:bg-neutral-900 dark:text-white
        inset-0 rounded-none
        sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[85vh] sm:w-[400px] sm:rounded-2xl sm:border sm:border-black/10 sm:dark:border-white/10
        motion-safe:animate-[panelIn_0.18s_ease]
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <AiAvatar size={34} online />
          <div className="leading-tight">
            <div className="text-sm font-semibold">{CHAT_CONFIG.brand.title}</div>
            <div className="flex items-center gap-1 text-[11px] opacity-90">
              <span className="h-1.5 w-1.5 rounded-full bg-green-300" /> Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" aria-label="New chat" onClick={onNewChat} className="rounded p-1.5 hover:bg-white/15">
            <Plus className="h-4 w-4" />
          </button>
          {CHAT_FEATURES.conversationHistory ? (
            <button type="button" aria-label="Conversation history" onClick={onToggleHistory} className="rounded p-1.5 hover:bg-white/15">
              <History className="h-4 w-4" />
            </button>
          ) : null}
          {CHAT_FEATURES.minimize ? (
            <button type="button" aria-label="Minimize" onClick={onMinimize} className="rounded p-1.5 hover:bg-white/15">
              <Minus className="h-4 w-4" />
            </button>
          ) : null}
          <button type="button" aria-label="Close chat" onClick={onClose} className="rounded p-1.5 hover:bg-white/15">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {empty && CHAT_FEATURES.welcomeScreen ? (
          <WelcomeScreen disabled={busy} onAsk={onSend} />
        ) : (
          <MessageList
            messages={messages}
            busy={busy}
            reactions={reactions}
            onCardAction={onCardAction}
            onMessageAction={onMessageAction}
          />
        )}

        {/* History overlay. */}
        {showHistory ? (
          <ChatHistory
            conversations={conversations}
            activeId={activeId}
            onSelect={onSelectConversation}
            onNewChat={onNewChat}
            onClose={onToggleHistory}
          />
        ) : null}
      </div>

      {/* Suggested questions (hidden on the welcome screen — it has its own). */}
      {!empty && CHAT_FEATURES.suggestedQuestions ? (
        <SuggestedQuestions questions={questions} disabled={busy} onPick={onSend} />
      ) : null}
      <Composer disabled={busy} onSend={onSend} />

      <style>{`@keyframes panelIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
