// ==========================================================================
// Conversation's descriptor for the Analytics Dashboard (Phase 7.1) — a NEW
// "AI" admin module. Pure data (+ icons) so the dashboard registers it WITHOUT
// importing conversation runtime. One-way dependency (dashboard → conversation),
// mirroring auth/feedback/knowledge.
// ==========================================================================

import {
  Bot,
  MessagesSquare,
  Brain,
  Gauge,
  Settings,
  Clock,
  Activity,
  Hash,
  Users,
} from 'lucide-react';

const ROOT = '/jivo-dev/analytics/ai';

export const AI_ANALYTICS_PAGES = [
  { id: 'conversations', name: 'Conversations', icon: MessagesSquare },
  { id: 'messages', name: 'Messages', icon: Hash },
  { id: 'memory', name: 'Memory', icon: Brain },
  { id: 'performance', name: 'Performance', icon: Gauge },
  { id: 'settings', name: 'Settings', icon: Settings },
] as const;

export const AI_ANALYTICS_WIDGETS = [
  { id: 'ai-conversations-by-status', title: 'Conversations by Status', description: 'Active / idle / ended.', icon: MessagesSquare, size: 'medium', category: 'summary', kind: 'doughnut' },
  { id: 'ai-messages-by-role', title: 'Messages by Role', description: 'User vs assistant vs system.', icon: Hash, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'ai-memory-by-type', title: 'Memory by Type', description: 'Preference / profile / shopping / …', icon: Brain, size: 'medium', category: 'summary', kind: 'doughnut' },
  { id: 'ai-recent-conversations', title: 'Recent Conversations', description: 'Latest activity.', icon: MessagesSquare, size: 'full', category: 'custom', kind: 'facts' },
  { id: 'ai-settings', title: 'AI Settings', description: 'Conversation platform flags.', icon: Settings, size: 'full', category: 'custom', kind: 'facts' },

  // Performance placeholders (Phase 7.1 — no real metrics yet).
  { id: 'ai-avg-response-time', title: 'Avg Response Time', description: 'Mean assistant latency.', icon: Clock, size: 'medium', category: 'summary', kind: 'placeholder' },
  { id: 'ai-tokens-per-conversation', title: 'Tokens / Conversation', description: 'Mean tokens per conversation.', icon: Hash, size: 'medium', category: 'summary', kind: 'placeholder' },
  { id: 'ai-active-now', title: 'Active Now', description: 'Live conversations.', icon: Activity, size: 'medium', category: 'summary', kind: 'placeholder' },
  { id: 'ai-concurrent-users', title: 'Concurrent Users', description: 'Distinct visitors chatting.', icon: Users, size: 'medium', category: 'summary', kind: 'placeholder' },
] as const;

export const AI_ANALYTICS_MODULE = {
  id: 'ai',
  name: 'AI',
  icon: Bot,
  route: ROOT,
  category: 'business' as const,
  description: 'AI conversation platform — lifecycle, state, messages and memory.',
  order: 96,
  widgets: ['overview', 'ai-conversations-by-status', 'ai-messages-by-role', 'ai-recent-conversations'],
  pages: AI_ANALYTICS_PAGES.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    route: `${ROOT}/${p.id}`,
    widgets:
      p.id === 'conversations'
        ? ['overview', 'ai-conversations-by-status', 'ai-recent-conversations']
        : p.id === 'messages'
          ? ['overview', 'ai-messages-by-role']
          : p.id === 'memory'
            ? ['ai-memory-by-type']
            : p.id === 'performance'
              ? ['ai-avg-response-time', 'ai-tokens-per-conversation', 'ai-active-now', 'ai-concurrent-users']
              : ['ai-settings'], // settings
  })),
};
