'use client';

// Chat panel — responsive, theme-aware, accessible container (simplified,
// Phase 8.2). Header (avatar, title, online, close) + body (welcome
// screen or messages) + suggested questions + composer. No history / new-chat /
// reactions. Focus-trapped; ESC closes.
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ExperienceCard } from '@/modules/platform/experience';
import { CHAT_CONFIG, CHAT_FEATURES } from '../config';
import type { ChatMessage } from '../types';
import { MessageList } from './message-list';
import { Composer } from './composer';
import { SuggestedQuestions } from './suggested-questions';
import { WelcomeScreen } from './welcome-screen';
import { AiAvatar } from './ai-avatar';

export function ChatPanel({
  messages,
  questions,
  busy,
  onSend,
  onClose,
  onCardAction,
}: {
  messages: ChatMessage[];
  questions: string[];
  busy: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
  onCardAction: (card: ExperienceCard, action: string, target?: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Accessibility: ESC closes, and focus moves into the panel on open.
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
        sm:inset-auto sm:right-10 sm:bottom-10 sm:w-[400px] sm:rounded-2xl sm:border sm:border-black/10 sm:dark:border-white/10
        sm:h-[min(600px,calc(100dvh-5rem))]
        motion-safe:animate-[panelIn_0.18s_ease]
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-white">
        <div className="flex items-center gap-2">
          {/* No "Online" status line or presence dot — the assistant's
              availability isn't something we track, so claiming it was noise. */}
          <AiAvatar size={34} />
          <div className="text-sm font-semibold leading-tight">{CHAT_CONFIG.brand.title}</div>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Close only — the minimize control was removed; closing already keeps
              the conversation (it is restored from the DB on reopen). */}
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
          <MessageList messages={messages} busy={busy} onCardAction={onCardAction} />
        )}
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
