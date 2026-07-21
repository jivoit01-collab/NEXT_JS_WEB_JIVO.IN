import 'server-only';

// Feedback analytics data source — consumes the Feedback Platform's query
// functions (never Prisma directly) and maps them to the analytics WidgetData
// contract. Registered for the `feedback` module; overrides the default.
// Dependency is one-way: admin/analytics → platform/feedback.

import {
  MessagesSquare,
  Inbox,
  Clock,
  CheckCircle2,
  Star,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import {
  getFeedbackStats,
  feedbackByType,
  feedbackBySentiment,
  feedbackBySource,
  feedbackTopPages,
  feedbackTrend,
  recentFeedback,
} from '@/modules/platform/feedback/data';
import { humanizeEnum } from '@/modules/platform/feedback/utils';
import type { FeedbackFilter } from '@/modules/platform/feedback/types';
import { registerAnalyticsDataSource } from './registry';
import type { AnalyticsDataSource, AnalyticsPageData } from './types';
import type { WidgetContext, WidgetData, WidgetDatum } from '../widgets/types';
import type { AnalyticsMetric } from '../types';

/** Map a feedback analytics page id → a Feedback filter. */
function filterFor(ctx: WidgetContext): FeedbackFilter {
  switch (ctx.pageId) {
    case 'general':
      return { type: 'GENERAL' };
    case 'page-feedback':
      return { type: 'PAGE' };
    case 'product-reviews':
      return { type: 'PRODUCT' };
    case 'ai-feedback':
      return { type: 'AI' };
    case 'bug-reports':
      return { type: 'BUG' };
    case 'feature-requests':
      return { type: 'FEATURE' };
    case 'support':
      return { type: 'SUPPORT' };
    case 'resolved':
      return { status: 'RESOLVED' };
    default:
      return {}; // module dashboard → all feedback
  }
}

function breakdown(rows: WidgetDatum[]): WidgetData {
  return { status: rows.length ? 'ready' : 'empty', breakdown: rows };
}

function emptyPage(scope: WidgetContext['scope'], title: string): AnalyticsPageData {
  return { scope, title, widgets: {} };
}

export const feedbackDataSource: AnalyticsDataSource = {
  async getOverview(ctx) {
    return emptyPage('overview', ctx.title);
  },
  async getModule(_id, ctx) {
    return emptyPage('module', ctx.title);
  },
  async getPage(_m, _p, ctx) {
    return emptyPage('page', ctx.title);
  },

  async getWidget(widgetId, ctx): Promise<WidgetData> {
    const filter = filterFor(ctx);

    if (widgetId === 'overview') {
      const s = await getFeedbackStats(filter);
      const metrics: AnalyticsMetric[] = [
        { id: 'total', label: 'Total Feedback', value: s.total, icon: MessagesSquare, hint: 'All time' },
        { id: 'open', label: 'Open', value: s.open, icon: Inbox, hint: 'Unactioned' },
        { id: 'pending', label: 'Pending', value: s.pending, icon: Clock, hint: 'In progress' },
        { id: 'resolved', label: 'Resolved', value: s.resolved, icon: CheckCircle2, hint: 'Closed out' },
        { id: 'avg-rating', label: 'Average Rating', value: s.avgRating != null ? Number(s.avgRating.toFixed(1)) : null, icon: Star, hint: 'Out of 5' },
        { id: 'positive', label: 'Positive', value: s.positive, icon: Smile, hint: 'Sentiment' },
        { id: 'neutral', label: 'Neutral', value: s.neutral, icon: Meh, hint: 'Sentiment' },
        { id: 'negative', label: 'Negative', value: s.negative, icon: Frown, hint: 'Sentiment' },
      ];
      return { status: s.total > 0 ? 'ready' : 'empty', metrics };
    }

    if (widgetId === 'feedback-trend') {
      const points = await feedbackTrend(filter);
      const hasData = points.some((p) => p.value > 0);
      return { status: hasData ? 'ready' : 'empty', trend: points };
    }
    if (widgetId === 'feedback-by-type') {
      const rows = await feedbackByType(filter);
      return breakdown(rows.map((r) => ({ label: humanizeEnum(r.label), value: r.value })));
    }
    if (widgetId === 'feedback-sentiment') {
      const rows = await feedbackBySentiment(filter);
      return breakdown(rows.map((r) => ({ label: humanizeEnum(r.label), value: r.value })));
    }
    if (widgetId === 'feedback-sources') {
      const rows = await feedbackBySource(filter);
      return breakdown(rows.map((r) => ({ label: humanizeEnum(r.label), value: r.value })));
    }
    if (widgetId === 'feedback-top-pages') {
      const rows = await feedbackTopPages(filter);
      return breakdown(rows);
    }
    if (widgetId === 'feedback-recent') {
      const rows = await recentFeedback(filter, 6);
      const facts = rows.map((f) => ({
        label: `${humanizeEnum(f.type)}${f.rating ? ` · ${f.rating}★` : ''}`,
        value: (f.message ?? f.title ?? '—').slice(0, 60),
      }));
      return { status: facts.length ? 'ready' : 'empty', facts };
    }

    // KPI is handled above; other generic widgets fall back to placeholder.
    return { status: 'placeholder' };
  },
};

registerAnalyticsDataSource({
  id: 'feedback',
  source: feedbackDataSource,
  modules: ['feedback'],
  enabled: true,
  priority: 10,
});
