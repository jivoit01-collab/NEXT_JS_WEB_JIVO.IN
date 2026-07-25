'use client';

// AI avatar — brand gradient sphere with a sparkle. Reused in the header, welcome
// screen and every assistant message. `online` adds a presence dot.
import { Sparkles } from 'lucide-react';

export function AiAvatar({ size = 32, online = false }: { size?: number; online?: boolean }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <span
        className="flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
        style={{ width: size, height: size }}
      >
        <Sparkles style={{ width: size * 0.55, height: size * 0.55 }} />
      </span>
      {online ? (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-neutral-900" />
      ) : null}
    </span>
  );
}
