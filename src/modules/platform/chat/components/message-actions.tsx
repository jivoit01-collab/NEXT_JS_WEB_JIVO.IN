'use client';

// Message actions — per assistant message: Copy · Like · Dislike · Regenerate ·
// Feedback · Share (future-ready). Pure presentational; the widget wires the
// callbacks (Feedback reuses the Feedback Platform — no duplicate form here).
import { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, MessageSquarePlus, Share2 } from 'lucide-react';
import { CHAT_FEATURES } from '../config';

export type MessageActionKind = 'like' | 'dislike' | 'regenerate' | 'feedback' | 'share';

interface Props {
  content: string;
  onAction: (kind: MessageActionKind) => void;
  disabled?: boolean;
  reaction?: 'like' | 'dislike' | null;
}

function IconBtn({
  label,
  active,
  onClick,
  disabled,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded p-1 text-black/50 transition hover:bg-black/5 hover:text-black/80 disabled:opacity-40 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white/80 ${
        active ? 'text-emerald-600 dark:text-emerald-400' : ''
      }`}
    >
      {children}
    </button>
  );
}

export function MessageActions({ content, onAction, disabled, reaction }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (!CHAT_FEATURES.messageActions) return null;

  return (
    <div className="mt-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      <IconBtn label={copied ? 'Copied' : 'Copy'} onClick={copy}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </IconBtn>
      <IconBtn label="Good response" active={reaction === 'like'} onClick={() => onAction('like')} disabled={disabled}>
        <ThumbsUp className="h-3.5 w-3.5" />
      </IconBtn>
      <IconBtn label="Bad response" active={reaction === 'dislike'} onClick={() => onAction('dislike')} disabled={disabled}>
        <ThumbsDown className="h-3.5 w-3.5" />
      </IconBtn>
      <IconBtn label="Regenerate" onClick={() => onAction('regenerate')} disabled={disabled}>
        <RotateCcw className="h-3.5 w-3.5" />
      </IconBtn>
      <IconBtn label="Give feedback" onClick={() => onAction('feedback')} disabled={disabled}>
        <MessageSquarePlus className="h-3.5 w-3.5" />
      </IconBtn>
      {/* Share — future-ready (disabled affordance keeps layout stable). */}
      <IconBtn label="Share (coming soon)" onClick={() => onAction('share')} disabled>
        <Share2 className="h-3.5 w-3.5" />
      </IconBtn>
    </div>
  );
}
