import { LayoutDashboard } from 'lucide-react';
import { AnalyticsLayout } from '../components/analytics-layout';
import { WidgetRenderer, DEFAULT_OVERVIEW_WIDGETS } from '../widgets';

/**
 * The Overview dashboard — now fully widget-driven. It composes nothing itself;
 * the WidgetRenderer builds the page from the widget config.
 */
export function OverviewPage() {
  return (
    <AnalyticsLayout
      title="Overview"
      breadcrumb="Overview"
      icon={LayoutDashboard}
      description="Powered by the Core Analytics Platform."
    >
      <WidgetRenderer widgets={DEFAULT_OVERVIEW_WIDGETS} context={{ scope: 'overview', title: 'Overview' }} />
    </AnalyticsLayout>
  );
}
