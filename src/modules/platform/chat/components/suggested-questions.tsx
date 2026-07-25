'use client';

// Suggested Questions — tappable chips. The Experience Planner chooses these; the
// widget only renders and reports clicks.
import { platformEvents } from '@/modules/core/events';
import { CHAT_EVENTS } from '../types';

export function SuggestedQuestions({
  questions,
  disabled,
  onPick,
}: {
  questions: string[];
  disabled?: boolean;
  onPick: (q: string) => void;
}) {
  if (!questions.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 px-3 pb-2">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => {
            platformEvents.emit(CHAT_EVENTS.SUGGESTED_CLICKED, { question: q });
            onPick(q);
          }}
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
