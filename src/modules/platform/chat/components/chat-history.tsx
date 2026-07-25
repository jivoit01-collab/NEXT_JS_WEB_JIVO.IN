'use client';

// Conversation history — an in-panel sidebar. Groups conversations into Today /
// Yesterday / Last 7 Days / Older, supports search, and restores on select.
import { useMemo, useState } from 'react';
import { X, Search, MessageSquare, Plus } from 'lucide-react';
import type { ChatConversationSummary } from '../types';

function groupOf(iso: string | null): 'Today' | 'Yesterday' | 'Last 7 Days' | 'Older' {
  if (!iso) return 'Older';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const day = 86_400_000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (then >= startOfToday.getTime()) return 'Today';
  if (then >= startOfToday.getTime() - day) return 'Yesterday';
  if (then >= now - 7 * day) return 'Last 7 Days';
  return 'Older';
}

const ORDER = ['Today', 'Yesterday', 'Last 7 Days', 'Older'] as const;

export function ChatHistory({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onClose,
}: {
  conversations: ChatConversationSummary[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}) {
  const [term, setTerm] = useState('');

  const groups = useMemo(() => {
    const filtered = term.trim()
      ? conversations.filter((c) => c.title.toLowerCase().includes(term.trim().toLowerCase()))
      : conversations;
    const map = new Map<string, ChatConversationSummary[]>();
    for (const c of filtered) {
      const g = groupOf(c.lastMessageAt);
      (map.get(g) ?? map.set(g, []).get(g)!).push(c);
    }
    return map;
  }, [conversations, term]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-white dark:bg-neutral-900" role="dialog" aria-label="Conversation history">
      <div className="flex items-center justify-between border-b border-black/10 px-3 py-2.5 dark:border-white/10">
        <span className="text-sm font-semibold">Conversations</span>
        <button type="button" aria-label="Close history" onClick={onClose} className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>

      <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg border border-black/10 px-2.5 py-1.5 dark:border-white/15">
        <Search className="h-4 w-4 opacity-50" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search conversations…"
          aria-label="Search conversations"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs opacity-60">No conversations yet.</p>
        ) : (
          ORDER.filter((g) => groups.get(g)?.length).map((g) => (
            <div key={g} className="mb-2">
              <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide opacity-50">{g}</p>
              <ul>
                {groups.get(g)!.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(c.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10 ${
                        c.id === activeId ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0 opacity-50" />
                      <span className="min-w-0 flex-1 truncate">{c.title}</span>
                      <span className="shrink-0 text-[10px] opacity-40">{c.messageCount}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
