// ==========================================================================
// CMS → Analytics auto-registration.
//
// Every CMS module + page (the single source of truth in `@/modules/admin/cms`)
// is turned into an analytics module + child pages. Add a CMS page ONCE and its
// analytics page exists automatically — no analytics code changes, ever.
// ==========================================================================

import { getCmsModules } from '@/modules/admin/cms';
import { ANALYTICS_ROOT, registerAnalyticsModule } from './registry';
import type { AnalyticsPageDefinition } from '../types';

for (const cms of getCmsModules()) {
  const moduleRoute = `${ANALYTICS_ROOT}/${cms.id}`;

  const pages: AnalyticsPageDefinition[] = cms.pages.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    route: `${moduleRoute}/${p.id}`,
  }));

  registerAnalyticsModule({
    id: cms.id,
    name: cms.name,
    icon: cms.icon,
    route: moduleRoute,
    category: 'cms',
    order: cms.order,
    description: `Engagement across ${cms.name}.`,
    pages,
  });
}
