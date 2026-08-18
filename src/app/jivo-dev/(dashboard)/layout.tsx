// Imported from the services barrel (not the module's top-level barrel) as its
// header instructs — the registry is the client-safe entry point, and this is
// the only place its icon components are read.
import { ANALYTICS_ROOT, getAnalyticsSidebarModules } from '@/modules/admin/analytics/services';
import { DashboardShell, type AnalyticsNavLink } from './dashboard-shell';

// ── Layout ───────────────────────────────────────────────────

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
 *
 * This file must therefore stay a Server Component: do NOT add `'use client'`.
 *
 * The sidebar nav itself lives in `dashboard-shell.tsx` and is derived from the
 * CMS registry (`@/modules/admin/cms`) — add a page there, not here.
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
