'use client';

// Conversation list — presentational history switcher. Prop-fed summaries (server
// computes them via the Conversation Platform); reports the chosen conversation.
// Lets a user restore a previous conversation.
import { MessagesSquare } from 'lucide-react';
import type { ChatConversationSummary } from '../types';
import { formatTime } from '../utils';

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: ChatConversationSummary[];
  activeId?: string | null;
  onSelect: (id: string) => void;
}) {
  if (!conversations.length) {
    return <p className="px-3 py-4 text-center text-xs opacity-60">No previous conversations.</p>;
  }
  return (
    <ul className="divide-y divide-black/5 dark:divide-white/10">
      {conversations.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onSelect(c.id)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10 ${
              c.id === activeId ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
            }`}
          >
            <MessagesSquare className="h-4 w-4 shrink-0 opacity-60" />
            <span className="min-w-0 flex-1 truncate">{c.title || 'Conversation'}</span>
            <span className="shrink-0 text-[10px] opacity-50">{formatTime(c.lastMessageAt)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
