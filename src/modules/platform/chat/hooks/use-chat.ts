'use client';

// ==========================================================================
// useChat — client session state + the bridge to the server orchestration
// action. It holds NO business logic (that lives in the server action); it only
// manages optimistic UI, panel state, persistence and analytics emission.
// ==========================================================================

import { useCallback, useRef, useState } from 'react';
import { platformEvents } from '@/modules/core/events';
import {
  startChatAction,
  sendMessageAction,
  restoreChatAction,
} from '../actions';
import { CHAT_CONFIG, CHAT_FEATURES } from '../config';
import { CHAT_EVENTS } from '../types';
import { optimisticId, questionsFromPlan } from '../utils';
import type { ChatMessage, PanelState } from '../types';

interface UseChatOptions {
  visitorId?: string;
  userId?: string;
  sessionId?: string;
}

/** Read a saved conversation id once, at initial render (client only, SSR-safe). */
function initialConversationId(): string | null {
  if (typeof window === 'undefined' || !CHAT_FEATURES.restoreConversation) return null;
  try {
    return localStorage.getItem(CHAT_CONFIG.storage.conversationId);
  } catch {
    return null;
  }
}

export function useChat(options: UseChatOptions = {}) {
  const [panel, setPanel] = useState<PanelState>('closed');
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questions, setQuestions] = useState<string[]>([...CHAT_CONFIG.defaultQuestions]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  const persist = useCallback((id: string | null, p: PanelState) => {
    try {
      if (id) localStorage.setItem(CHAT_CONFIG.storage.conversationId, id);
      localStorage.setItem(CHAT_CONFIG.storage.panelState, p);
    } catch {
      /* ignore */
    }
  }, []);

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (conversationId) {
      // Restore its messages if we haven't loaded them yet.
      if (messages.length === 0) {
        const res = await restoreChatAction(conversationId);
        if (res.success && 'data' in res) {
          setMessages(res.data.messages);
          setQuestions(res.data.suggestedQuestions);
        }
      }
      return conversationId;
    }
    const res = await startChatAction(options);
    if (res.success && 'data' in res) {
      setConversationId(res.data.conversationId);
      setQuestions(res.data.suggestedQuestions);
      persist(res.data.conversationId, 'open');
      return res.data.conversationId;
    }
    return null;
  }, [conversationId, messages.length, options, persist]);

  const open = useCallback(async () => {
    setPanel('open');
    persist(conversationId, 'open');
    platformEvents.emit(CHAT_EVENTS.OPENED, {});
    await ensureConversation();
  }, [conversationId, ensureConversation, persist]);

  const close = useCallback(() => {
    setPanel('closed');
    persist(conversationId, 'closed');
    platformEvents.emit(CHAT_EVENTS.CLOSED, {});
  }, [conversationId, persist]);

  const minimize = useCallback(() => {
    setPanel('minimized');
    persist(conversationId, 'minimized');
    platformEvents.emit(CHAT_EVENTS.MINIMIZED, {});
  }, [conversationId, persist]);

  /** Start a fresh conversation (frontend reset — a new one is created on next send). */
  const newChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setQuestions([...CHAT_CONFIG.defaultQuestions]);
    setError(null);
    try {
      localStorage.removeItem(CHAT_CONFIG.storage.conversationId);
    } catch {
      /* ignore */
    }
  }, []);

  /** Load a specific past conversation into the panel (history restore). */
  const openConversation = useCallback(
    async (id: string) => {
      setBusy(true);
      const res = await restoreChatAction(id);
      if (res.success && 'data' in res) {
        setConversationId(id);
        setMessages(res.data.messages);
        setQuestions(res.data.suggestedQuestions);
        persist(id, 'open');
        platformEvents.emit(CHAT_EVENTS.CONVERSATION_RESTORED, { conversationId: id });
      }
      setBusy(false);
    },
    [persist],
  );

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || busy) return;
      setError(null);
      setBusy(true);

      const id = await ensureConversation();
      if (!id) {
        setBusy(false);
        setError('Could not start a conversation.');
        return;
      }

      // Optimistic user message + a streaming placeholder.
      const userMsg: ChatMessage = {
        id: optimisticId(seq.current++),
        role: 'user',
        content: text,
        status: 'sent',
        createdAt: new Date().toISOString(),
      };
      const pending: ChatMessage = {
        id: optimisticId(seq.current++),
        role: 'assistant',
        content: '',
        status: 'streaming',
        createdAt: null,
      };
      setMessages((m) => [...m, userMsg, pending]);
      platformEvents.emit(CHAT_EVENTS.MESSAGE_SENT, {});

      const res = await sendMessageAction({ conversationId: id, content: text });
      if (res.success && 'data' in res) {
        const { message, plan } = res.data;
        setMessages((m) => m.map((x) => (x.id === pending.id ? { ...message, plan } : x)));
        setQuestions(questionsFromPlan(plan, [...CHAT_CONFIG.defaultQuestions]));
        platformEvents.emit(CHAT_EVENTS.MESSAGE_RECEIVED, {});
      } else {
        const errMsg = 'error' in res ? res.error : 'Something went wrong.';
        setMessages((m) =>
          m.map((x) => (x.id === pending.id ? { ...x, status: 'error', content: 'Sorry, something went wrong.', error: errMsg } : x)),
        );
        setError(errMsg);
        platformEvents.emit(CHAT_EVENTS.ERROR, { error: errMsg });
      }
      setBusy(false);
    },
    [busy, ensureConversation],
  );

  /** Regenerate the last assistant answer by re-sending the last user message. */
  const regenerate = useCallback(async () => {
    if (busy) return;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    // Drop the trailing assistant message so the new answer replaces it.
    setMessages((m) => {
      const lastAssistantIdx = m.map((x) => x.role).lastIndexOf('assistant');
      return lastAssistantIdx >= 0 ? m.slice(0, lastAssistantIdx) : m;
    });
    await send(lastUser.content);
  }, [busy, messages, send]);

  return {
    panel,
    conversationId,
    messages,
    questions,
    busy,
    error,
    open,
    close,
    minimize,
    newChat,
    openConversation,
    send,
    regenerate,
  };
}

export type UseChatReturn = ReturnType<typeof useChat>;
