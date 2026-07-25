'use client';

// Composer — the input row. Auto-growing textarea, send on Enter, and future-ready
// affordances (attachments, voice) rendered as disabled placeholders behind flags
// so the layout never shifts when they are enabled later. No files are processed.
import { useRef, useState } from 'react';
import { Send, Paperclip, Mic, Image as ImageIcon, FileText } from 'lucide-react';
import { CHAT_CONFIG, CHAT_FEATURES } from '../config';

export function Composer({ disabled, onSend }: { disabled?: boolean; onSend: (text: string) => void }) {
  const [value, setValue] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  return (
    <div className="border-t border-black/10 p-2 dark:border-white/10">
      {/* Attachment menu (UI only — nothing is uploaded). */}
      {CHAT_FEATURES.fileUpload && showAttach ? (
        <div className="mb-2 flex gap-2" role="menu" aria-label="Attachment types">
          {CHAT_CONFIG.attachmentTypes.map((t) => (
            <button
              key={t}
              type="button"
              disabled
              className="flex items-center gap-1 rounded-lg border border-black/10 px-2 py-1 text-xs opacity-60 dark:border-white/15"
              title={`${t} (coming soon)`}
            >
              {t === 'Image' ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              {t}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-1.5">
        {CHAT_FEATURES.fileUpload ? (
          <button
            type="button"
            aria-label="Add attachment"
            aria-expanded={showAttach}
            onClick={() => setShowAttach((s) => !s)}
            className="rounded-lg p-2 text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
          >
            <Paperclip className="h-4 w-4" />
          </button>
        ) : null}

        <textarea
          ref={ref}
          value={value}
          onChange={(e) => {
            setValue(e.target.value.slice(0, CHAT_CONFIG.maxInputLength));
            grow(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Message Jivo AI…"
          aria-label="Message"
          className="max-h-32 flex-1 resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
        />

        {CHAT_FEATURES.voiceInput ? (
          <button type="button" aria-label="Voice input (coming soon)" disabled className="rounded-lg p-2 opacity-40">
            <Mic className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="rounded-xl bg-emerald-600 p-2 text-white transition hover:bg-emerald-700 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
