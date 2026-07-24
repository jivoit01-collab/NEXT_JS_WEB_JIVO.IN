'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { WidgetProps, WidgetFeedbackRecord } from '../types';

type SentFilter = 'all' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

const FILTERS: { id: SentFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'POSITIVE', label: 'Positive' },
  { id: 'NEUTRAL', label: 'Average' },
  { id: 'NEGATIVE', label: 'Negative' },
];

const SENT_BADGE: Record<string, string> = {
  POSITIVE: 'bg-emerald-500/15 text-emerald-600',
  NEUTRAL: 'bg-amber-500/15 text-amber-600',
  NEGATIVE: 'bg-red-500/15 text-red-600',
};

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-muted-foreground text-xs">No rating</span>;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}
        />
      ))}
    </span>
  );
}

function SentimentBadge({ s }: { s: WidgetFeedbackRecord['sentiment'] }) {
  if (!s) return null;
  return (
    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-jost-medium', SENT_BADGE[s])}>
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Recent Feedback table (client). Filter by sentiment (All / Positive / Average /
 * Negative) and click any row to open a dialog with the full message, rating,
 * contact, source, page and date. Reads `data.records` from the feedback source.
 */
export function RecentFeedbackWidget({ data }: WidgetProps) {
  const records = useMemo(() => data?.records ?? [], [data?.records]);
  const [filter, setFilter] = useState<SentFilter>('all');
  const [selected, setSelected] = useState<WidgetFeedbackRecord | null>(null);

  const filtered = useMemo(
    () => (filter === 'all' ? records : records.filter((r) => r.sentiment === filter)),
    [filter, records],
  );

  if (records.length === 0) {
    return (
      <Card className="text-muted-foreground flex min-h-44 flex-col items-center justify-center gap-2 border-dashed p-6 text-center">
        <MessageSquare size={18} className="opacity-50" />
        <p className="text-xs 2xl:text-sm">No feedback yet.</p>
      </Card>
    );
  }

  return (
    <Card className="h-full gap-0 py-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 2xl:px-5">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary shrink-0" />
          <p className="font-jost-medium text-sm 2xl:text-base">Recent Feedback</p>
        </div>
        {/* Sentiment filter */}
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter feedback by sentiment">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-jost-medium transition-colors',
                filter === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground px-4 py-6 text-center text-xs">
          No {filter.toLowerCase()} feedback in this view.
        </p>
      ) : (
        <ul className="divide-border/60 divide-y">
          {filtered.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelected(r)}
                className="hover:bg-accent/50 flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors 2xl:px-5"
                aria-label={`Open ${r.type} feedback`}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-xs 2xl:text-sm">
                    <span className="font-jost-medium">{r.type}</span>
                    <Stars rating={r.rating} />
                  </span>
                  <span className="text-muted-foreground truncate text-xs">{r.message ?? '—'}</span>
                </span>
                <SentimentBadge s={r.sentiment} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Detail dialog — full feedback + who left it */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.type} feedback
                  <SentimentBadge s={selected.sentiment} />
                </DialogTitle>
                <DialogDescription>{fmtDate(selected.createdAt)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Rating</span>
                  <div className="mt-1">
                    <Stars rating={selected.rating} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Message</span>
                  <p className="bg-muted/50 mt-1 rounded-lg p-3 text-sm whitespace-pre-wrap">
                    {selected.message ?? '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <span className="text-muted-foreground text-xs">Contact</span>
                    <p className="mt-0.5 break-all">{selected.contact ?? '—'}</p>
                  </div>
                  <div className="min-w-0">
                    <span className="text-muted-foreground text-xs">Source</span>
                    <p className="mt-0.5">{selected.source}</p>
                  </div>
                </div>
                {selected.page && (
                  <div className="min-w-0">
                    <span className="text-muted-foreground text-xs">Page</span>
                    <p className="mt-0.5 break-all">{selected.page}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
