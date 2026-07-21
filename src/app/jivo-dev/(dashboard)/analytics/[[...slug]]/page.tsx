import { notFound } from 'next/navigation';
import {
  ANALYTICS_ROOT,
  getAnalyticsEntry,
  OverviewPage,
  ModuleDashboardPage,
  ModuleAnalyticsPage,
} from '@/modules/admin/analytics';

/**
 * ONE route file serves the ENTIRE hierarchical analytics dashboard. It resolves
 * the path against the module/page registry:
 *   • /analytics                     → Overview
 *   • /analytics/<module>            → module dashboard (or a standalone leaf)
 *   • /analytics/<module>/<page>     → a CMS page's analytics
 * New CMS pages appear here automatically (registry-driven) — no route changes.
 */
export default async function AnalyticsCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const route = slug && slug.length ? `${ANALYTICS_ROOT}/${slug.join('/')}` : ANALYTICS_ROOT;

  const entry = getAnalyticsEntry(route);

  switch (entry.type) {
    case 'overview':
      return <OverviewPage />;

    case 'module':
      // Standalone leaves (Authentication, Visitors, Traffic, Reports) render as
      // a widget-driven leaf page (named sections when provided); CMS modules
      // render a dashboard hub (also widget-driven) listing their child pages.
      return entry.module.standalone ? (
        <ModuleAnalyticsPage
          title={entry.module.name}
          icon={entry.module.icon}
          description={entry.module.description}
          sections={entry.module.sections}
          widgets={entry.module.widgets}
          context={{ scope: 'page', title: entry.module.name, moduleId: entry.module.id }}
        />
      ) : (
        <ModuleDashboardPage module={entry.module} />
      );

    case 'page': {
      const siblingPages = entry.module.pages ?? [];
      return (
        <ModuleAnalyticsPage
          title={entry.page.name}
          icon={entry.page.icon ?? entry.module.icon}
          description={`Analytics for ${entry.page.name}.`}
          widgets={entry.page.widgets}
          breadcrumbParent={{ name: entry.module.name, href: entry.module.route }}
          pageSelector={
            siblingPages.length > 0
              ? {
                  moduleName: entry.module.name,
                  moduleRoute: entry.module.route,
                  pages: siblingPages.map((p) => ({ name: p.name, route: p.route })),
                  currentRoute: entry.page.route,
                }
              : undefined
          }
          context={{
            scope: 'page',
            title: entry.page.name,
            moduleId: entry.module.id,
            moduleName: entry.module.name,
            moduleRoute: entry.module.route,
            pageId: entry.page.id,
          }}
        />
      );
    }

    default:
      notFound();
  }
}
