// Feedback's descriptor for the Analytics Dashboard. Pure data (+ icons) so the
// dashboard registers it WITHOUT importing feedback runtime/analytics types.
// The dashboard reads this + feedback's query functions — feedback never imports
// the dashboard (one-way dependency).

import {
  MessagesSquare,
  MessageSquare,
  FileText,
  ShoppingBag,
  Bot,
  Bug,
  Lightbulb,
  LifeBuoy,
  CheckCircle2,
  Tags,
  SmilePlus,
} from 'lucide-react';

const ROOT = '/jivo-dev/analytics/feedback';

/** Child pages (each filters feedback by a type / status). */
export const FEEDBACK_ANALYTICS_PAGES = [
  { id: 'general', name: 'General', icon: MessageSquare },
  { id: 'page-feedback', name: 'Page Feedback', icon: FileText },
  { id: 'product-reviews', name: 'Product Reviews', icon: ShoppingBag },
  { id: 'ai-feedback', name: 'AI Feedback', icon: Bot },
  { id: 'bug-reports', name: 'Bug Reports', icon: Bug },
  { id: 'feature-requests', name: 'Feature Requests', icon: Lightbulb },
  { id: 'support', name: 'Support', icon: LifeBuoy },
  { id: 'resolved', name: 'Resolved', icon: CheckCircle2 },
] as const;

/** Feedback-specific analytics widgets (registered on the widget platform). */
export const FEEDBACK_ANALYTICS_WIDGETS = [
  { id: 'feedback-by-type', title: 'By Type', description: 'Feedback grouped by type.', icon: Tags, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'feedback-sentiment', title: 'Sentiment', description: 'Positive / neutral / negative.', icon: SmilePlus, size: 'medium', category: 'summary', kind: 'breakdown' },
  { id: 'feedback-top-pages', title: 'Top Pages', description: 'Pages with the most feedback.', icon: FileText, size: 'medium', category: 'tables', kind: 'breakdown' },
  { id: 'feedback-recent', title: 'Recent Feedback', description: 'Latest submissions.', icon: MessageSquare, size: 'full', category: 'custom', kind: 'facts' },
] as const;

/** The module descriptor + widget configs (module dashboard + per-page). */
export const FEEDBACK_ANALYTICS_MODULE = {
  id: 'feedback',
  name: 'Feedback',
  icon: MessagesSquare,
  route: ROOT,
  category: 'business' as const,
  description: 'Website, page, product, AI, bug, feature and support feedback.',
  order: 85,
  widgets: [
    'overview',
    'feedback-by-type',
    'feedback-sentiment',
    'feedback-recent',
    'feedback-top-pages',
    'module-pages',
  ],
  pages: FEEDBACK_ANALYTICS_PAGES.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    route: `${ROOT}/${p.id}`,
    widgets: ['overview', 'feedback-recent'],
  })),
};
