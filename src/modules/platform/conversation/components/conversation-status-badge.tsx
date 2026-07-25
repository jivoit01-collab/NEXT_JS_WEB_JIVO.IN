// ==========================================================================
// ConversationStatusBadge — a tiny status pill for admin lists/tables. NOT a
// chat UI. Reusable, presentation-only, server-safe.
// ==========================================================================

import { cn } from '@/lib/utils';
import type { ConversationStatus } from '../types';

const STYLES: Record<ConversationStatus, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-600',
  IDLE: 'bg-amber-500/15 text-amber-600',
  ENDED: 'bg-slate-500/15 text-slate-600',
  ARCHIVED: 'bg-slate-400/15 text-slate-500',
};

export function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  return (
    <span
      className={cn('rounded-full px-2 py-0.5 text-[10px] font-jost-medium', STYLES[status])}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
