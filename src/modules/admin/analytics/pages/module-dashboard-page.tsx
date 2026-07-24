import { AnalyticsLayout } from '../components/analytics-layout';
import { WidgetRenderer, DEFAULT_MODULE_WIDGETS, type WidgetContext } from '../widgets';
import type { AnalyticsModuleDefinition } from '../types';

/**
 * A module's dashboard (hub) — e.g. /analytics/our-essence. Fully widget-driven:
 * the renderer builds it from the module's widget config (defaults include the
 * page-navigation widget, so drilling into pages happens here).
 */
export function ModuleDashboardPage({ module: moduleDef }: { module: AnalyticsModuleDefinition }) {
  const pages = moduleDef.pages ?? [];
  const context: WidgetContext = {
    scope: 'module',
    title: moduleDef.name,
    moduleId: moduleDef.id,
    moduleName: moduleDef.name,
    moduleRoute: moduleDef.route,
    pages: moduleDef.pages,
  };
  return (
    <AnalyticsLayout
      title={moduleDef.name}
      breadcrumb={moduleDef.name}
      icon={moduleDef.icon}
      description={moduleDef.description ?? `Analytics across ${moduleDef.name}.`}
      exportContext={{
        scope: context.scope,
        title: context.title,
        moduleId: context.moduleId,
        moduleName: context.moduleName,
        moduleRoute: context.moduleRoute,
      }}
      pageSelector={
        pages.length > 0
          ? {
              moduleName: moduleDef.name,
              moduleRoute: moduleDef.route,
              pages: pages.map((p) => ({ name: p.name, route: p.route })),
              currentRoute: moduleDef.route,
            }
          : undefined
      }
    >
      <WidgetRenderer widgets={moduleDef.widgets ?? DEFAULT_MODULE_WIDGETS} context={context} />
    </AnalyticsLayout>
  );
}
