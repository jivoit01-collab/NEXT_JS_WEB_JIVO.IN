import 'server-only';

// Conversation (AI) analytics data source (Phase 7.1) — consumes the Conversation
// Platform's query functions (never Prisma directly) and maps them to WidgetData.
// Registered for the `ai` module. Dependency: admin/analytics → platform/conversation.

import { MessagesSquare, Activity, Hash, Brain } from 'lucide-react';
import {
  getConversationStats,
  conversationsByStatus,
  messagesByRole,
  memoriesByType,
  recentConversations,
} from '@/modules/platform/conversation/data';
import { CONVERSATION_FEATURES } from '@/modules/platform/conversation/config';
import { humanizeEnum } from '@/modules/platform/conversation/utils';
import { registerAnalyticsDataSource } from './registry';
import type { AnalyticsDataSource, AnalyticsPageData } from './types';
import type { WidgetContext, WidgetData, WidgetDatum } from '../widgets/types';
import type { AnalyticsMetric } from '../types';

function breakdown(rows: WidgetDatum[]): WidgetData {
  return { status: rows.length ? 'ready' : 'empty', breakdown: rows };
}
function emptyPage(scope: WidgetContext['scope'], title: string): AnalyticsPageData {
  return { scope, title, widgets: {} };
}

export const conversationDataSource: AnalyticsDataSource = {
  async getOverview(ctx) {
    return emptyPage('overview', ctx.title);
  },
  async getModule(_id, ctx) {
    return emptyPage('module', ctx.title);
  },
  async getPage(_m, _p, ctx) {
    return emptyPage('page', ctx.title);
  },

  async getWidget(widgetId): Promise<WidgetData> {
    if (widgetId === 'overview') {
      const s = await getConversationStats();
      const metrics: AnalyticsMetric[] = [
        { id: 'conversations', label: 'Conversations', value: s.totalConversations, icon: MessagesSquare, hint: 'All time' },
        { id: 'active', label: 'Active', value: s.activeConversations, icon: Activity, hint: 'Live' },
        { id: 'messages', label: 'Messages', value: s.totalMessages, icon: Hash, hint: `~${s.avgMessagesPerConversation}/conv` },
        { id: 'memories', label: 'Memories', value: s.totalMemories, icon: Brain, hint: 'Stored' },
      ];
      return { status: s.totalConversations > 0 ? 'ready' : 'empty', metrics };
    }

    if (widgetId === 'ai-conversations-by-status') {
      const rows = await conversationsByStatus();
      return breakdown(rows.map((r) => ({ label: humanizeEnum(r.label), value: r.value })));
    }
    if (widgetId === 'ai-messages-by-role') {
      const rows = await messagesByRole();
      return breakdown(rows.map((r) => ({ label: humanizeEnum(r.label), value: r.value })));
    }
    if (widgetId === 'ai-memory-by-type') {
      const rows = await memoriesByType();
      return breakdown(rows.map((r) => ({ label: humanizeEnum(r.label), value: r.value })));
    }

    if (widgetId === 'ai-recent-conversations') {
      const rows = await recentConversations(8);
      const facts = rows.map((c) => ({
        label: (c.title ?? `Conversation ${c.id.slice(0, 6)}`).slice(0, 40),
        value: `${c.messageCount} msg · ${humanizeEnum(c.status)}`,
      }));
      return { status: facts.length ? 'ready' : 'empty', facts };
    }

    if (widgetId === 'ai-settings') {
      const facts = Object.entries(CONVERSATION_FEATURES).map(([k, v]) => ({
        label: humanizeEnum(k.replace(/([A-Z])/g, '_$1')),
        value: v ? 'Enabled' : 'Prepared',
      }));
      return { status: 'ready', facts };
    }

    // Performance placeholders + anything else → placeholder.
    return { status: 'placeholder' };
  },
};

registerAnalyticsDataSource({
  id: 'ai',
  source: conversationDataSource,
  modules: ['ai'],
  enabled: true,
  priority: 10,
});
