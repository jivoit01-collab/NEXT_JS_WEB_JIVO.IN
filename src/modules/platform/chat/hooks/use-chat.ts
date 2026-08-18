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
  // Guards against re-fetching the message history on every open/send. Using a
  // ref (not messages.length) means a genuinely EMPTY restored conversation
  // isn't re-fetched forever.
  const restored = useRef(false);

  const persist = useCallback((id: string | null, p: PanelState) => {
    try {
      if (id) localStorage.setItem(CHAT_CONFIG.storage.conversationId, id);
      localStorage.setItem(CHAT_CONFIG.storage.panelState, p);
    } catch {
      /* ignore */
    }
  }, []);

  /** Start a brand-new conversation and persist ONLY its id. */
  const startFresh = useCallback(async (): Promise<string | null> => {
    const res = await startChatAction(options);
    if (res.success && 'data' in res) {
      setConversationId(res.data.conversationId);
      setMessages(res.data.messages);
      setQuestions(res.data.suggestedQuestions);
      persist(res.data.conversationId, 'open');
      return res.data.conversationId;
    }
    return null;
  }, [options, persist]);

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (conversationId) {
      if (restored.current) return conversationId;
      restored.current = true;

      // Rehydrate from the DB — the source of truth. Only the id lives in
      // localStorage, never the messages themselves.
      const res = await restoreChatAction(conversationId);
      if (res.success && 'data' in res) {
        setMessages(res.data.messages);
        setQuestions(res.data.suggestedQuestions);
        return conversationId;
      }

      // Restore failed — the conversation was deleted, the id is invalid, or the
      // visitor identity expired. Drop the dead id and start over so the widget
      // is never stuck pointing at a conversation that no longer exists.
      try {
        localStorage.removeItem(CHAT_CONFIG.storage.conversationId);
      } catch {
        /* ignore */
      }
      setConversationId(null);
      return startFresh();
    }
    return startFresh();
  }, [conversationId, startFresh]);

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

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || busy) return;
      setError(null);
      setBusy(true);

      // A null id is EXPECTED on the visitor's first message: the Gateway
      // creates the conversation and returns its id with the reply below.
      const id = await ensureConversation();

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

      const res = await sendMessageAction({ conversationId: id, content: text, visitorId: options.visitorId });
      if (res.success && 'data' in res) {
        const { message, plan } = res.data;
        // Adopt (and persist) the conversation the Gateway created for this
        // first message, so refresh/reopen restores the same thread.
        if (res.data.conversationId && res.data.conversationId !== id) {
          setConversationId(res.data.conversationId);
          restored.current = true; // already in sync — no restore needed
          persist(res.data.conversationId, 'open');
        }
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
    [busy, ensureConversation, options.visitorId, persist],
  );

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
    send,
  };
}

export type UseChatReturn = ReturnType<typeof useChat>;
