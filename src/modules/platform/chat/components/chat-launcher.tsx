'use client';

// Floating launcher — professional circular FAB, bottom-right, brand gradient,
// optional animated pulse and a notification badge. Mobile responsive.
import { MessageCircle, ChevronUp } from 'lucide-react';
import { CHAT_CONFIG, CHAT_FEATURES } from '../config';
import type { PanelState } from '../types';

export function ChatLauncher({
  panel,
  onClick,
  unread = 0,
}: {
  panel: PanelState;
  onClick: () => void;
  unread?: number;
}) {
  const minimized = panel === 'minimized';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={minimized ? 'Resume chat' : `Open ${CHAT_CONFIG.brand.title}`}
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}
      className="
        group flex h-14 w-14 items-center justify-center rounded-full
        bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg transition-transform
        hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
        focus-visible:ring-offset-2
      "
    >
      {/* Animated pulse ring. */}
      {CHAT_FEATURES.launcherPulse && !minimized ? (
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-400/60" />
      ) : null}

      {minimized ? <ChevronUp className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}

      {/* Notification badge. */}
      {CHAT_FEATURES.notificationBadge && unread > 0 ? (
        <span
          className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white shadow"
          aria-label={`${unread} unread messages`}
        >
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </button>
  );
}
