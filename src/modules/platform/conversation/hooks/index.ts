'use client';

// ==========================================================================
// useConversation — client STATE management for a conversation (NOT a chat UI).
// Holds the current conversation id + message list + status, and calls the
// (admin-guarded) actions. A future Chat UI composes this hook; this phase ships
// no chat rendering.
// ==========================================================================

import { useCallback, useState } from 'react';
import {
  startConversationAction,
  continueConversationAction,
  getMessagesAction,
} from '../actions';
import type { ConversationDTO, ConversationMessageDTO, ConversationRole } from '../types';

export function useConversation() {
  const [conversation, setConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<ConversationMessageDTO[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (opts?: { title?: string; language?: string }) => {
    setBusy(true);
    setError(null);
    const res = await startConversationAction(opts ?? {});
    setBusy(false);
    if (res.success) {
      setConversation(res.data);
      setMessages([]);
      return res.data;
    }
    setError(res.error);
    return null;
  }, []);

  const send = useCallback(
    async (content: string, role: ConversationRole = 'USER') => {
      if (!conversation) return null;
      setBusy(true);
      setError(null);
      const res = await continueConversationAction({ conversationId: conversation.id, role, content });
      setBusy(false);
      if (res.success && res.data) {
        setMessages((prev) => [res.data, ...prev]);
        return res.data;
      }
      if (!res.success) setError(res.error);
      return null;
    },
    [conversation],
  );

  const loadMore = useCallback(
    async (cursor?: string) => {
      if (!conversation) return null;
      const res = await getMessagesAction({ conversationId: conversation.id, cursor });
      if (res.success) {
        setMessages((prev) => (cursor ? [...prev, ...res.data.messages] : res.data.messages));
        return res.data;
      }
      return null;
    },
    [conversation],
  );

  return { conversation, messages, busy, error, start, send, loadMore };
}
