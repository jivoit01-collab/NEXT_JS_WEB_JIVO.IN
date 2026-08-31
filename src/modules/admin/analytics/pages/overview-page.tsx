import { LayoutDashboard } from 'lucide-react';
import { AnalyticsLayout } from '../components/analytics-layout';
import { WidgetRenderer, DEFAULT_OVERVIEW_WIDGETS, type WidgetContext } from '../widgets';

/**
 * The Overview dashboard — now fully widget-driven. It composes nothing itself;
 * the WidgetRenderer builds the page from the widget config.
 */
export function OverviewPage({ dateRange }: { dateRange?: WidgetContext['dateRange'] }) {
  const context: WidgetContext = { scope: 'overview', title: 'Overview', dateRange };
  return (
    <AnalyticsLayout
      title="Overview"
      breadcrumb="Overview"
      icon={LayoutDashboard}
      description="Powered by the Core Analytics Platform."
    >
      <WidgetRenderer widgets={DEFAULT_OVERVIEW_WIDGETS} context={context} />
    </AnalyticsLayout>
  );
}
