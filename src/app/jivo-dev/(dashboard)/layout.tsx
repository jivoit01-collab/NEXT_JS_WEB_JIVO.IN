import { getAnalyticsSidebarModules, ANALYTICS_ROOT } from '@/modules/admin/analytics/services';
import { DashboardShell, type AnalyticsNavLink } from './dashboard-shell';

/**
 * SERVER layout. It reads the analytics module registry HERE (server-side, where
 * the registration side effects safely run) and pre-renders each module's icon to
 * a node, handing the sidebar plain, serializable data to the client shell.
 *
 * Why: the sidebar/toolbar used to import the analytics service barrel from client
 * components, dragging its eager, lucide-laden registrations into the CLIENT bundle.
 * On analytics pages the same modules also load in the server graph, so Turbopack
 * served the client a server-compiled React — "more than one copy of React" — which
 * crashed every lucide icon. Feeding the client server-computed data removes that
 * dual-graph entirely.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const analyticsNav: AnalyticsNavLink[] = getAnalyticsSidebarModules().map((m) => {
    const Icon = m.icon;
    return {
      id: m.id,
      title: m.name,
      href: m.route,
      icon: <Icon size={14} />,
    };
  });

  return (
    <DashboardShell analyticsNav={analyticsNav} analyticsRoot={ANALYTICS_ROOT}>
      {children}
    </DashboardShell>
  );
}
