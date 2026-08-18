'use client';

// Welcome screen — shown for an empty conversation (no empty chat). Welcome
// message + description + 6 suggested questions + popular topics.
import { Sparkles } from 'lucide-react';
import { platformEvents } from '@/modules/core/events';
import { CHAT_CONFIG } from '../config';
import { CHAT_EVENTS } from '../types';
import { AiAvatar } from './ai-avatar';

export function WelcomeScreen({ disabled, onAsk }: { disabled?: boolean; onAsk: (q: string) => void }) {
  const ask = (q: string) => {
    platformEvents.emit(CHAT_EVENTS.SUGGESTED_CLICKED, { question: q });
    onAsk(q);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
      <div className="mb-5 flex flex-col items-center text-center">
        <AiAvatar size={56} />
        <h2 className="mt-3 text-lg font-semibold">{CHAT_CONFIG.brand.welcomeTitle}</h2>
        <p className="mt-1 max-w-xs text-sm opacity-70">{CHAT_CONFIG.brand.welcomeSubtitle}</p>
      </div>

      {/* No search box here — the composer at the bottom of the panel is the
          single input, so a second field would just duplicate it. */}

      {/* 6 suggested questions. */}
      <p className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wide opacity-60">
        <Sparkles className="h-3.5 w-3.5" /> Suggested
      </p>
      <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CHAT_CONFIG.welcomeQuestions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => ask(q)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-left text-sm transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-emerald-900/20"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Popular topics. */}
      <p className="mb-2 text-xs font-medium uppercase tracking-wide opacity-60">Popular topics</p>
      <div className="flex flex-wrap gap-1.5">
        {CHAT_CONFIG.popularTopics.map((t) => (
          <button
            key={t}
            type="button"
            disabled={disabled}
            onClick={() => ask(`Tell me about ${t}`)}
            className="rounded-full bg-black/5 px-3 py-1 text-xs transition hover:bg-black/10 disabled:opacity-50 dark:bg-white/10 dark:hover:bg-white/15"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
