import { BarChart3 } from 'lucide-react';
import type { ElementType } from 'react';
import { AnalyticsLayout } from '../components/analytics-layout';
import { PlaceholderPanel } from '../components/placeholder-panel';
import { SectionHeading } from '../components/section-heading';
import { WidgetRenderer, DEFAULT_PAGE_WIDGETS, type WidgetContext } from '../widgets';
import type { PageSelectorData } from '../components/page-selector';

/**
 * The ONE reusable leaf page — a CMS page or a standalone module (Authentication,
 * Visitors, …). Fully widget-driven via the WidgetRenderer. `sections` is a
 * legacy shim (auth's named placeholders) rendered until a module registers its
 * own widgets; everything else uses widgets.
 */
export function ModuleAnalyticsPage({
  title,
  icon,
  description,
  sections,
  widgets,
  context,
  breadcrumbParent,
  pageSelector,
}: {
  title: string;
  icon?: ElementType;
  description?: string;
  sections?: string[];
  widgets?: string[];
  context: WidgetContext;
  breadcrumbParent?: { name: string; href: string };
  pageSelector?: PageSelectorData;
}) {
  return (
    <AnalyticsLayout
      title={title}
      breadcrumb={title}
      breadcrumbParent={breadcrumbParent}
      icon={icon}
      description={description}
      pageSelector={pageSelector}
      exportContext={context}
    >
      {sections && sections.length > 0 ? (
        // Legacy named-section placeholders (e.g. auth) until it registers widgets.
        <section>
          <SectionHeading>Sections</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((name) => (
              <PlaceholderPanel
                key={name}
                title={name}
                description="Layout ready — metrics land in a later phase."
                icon={BarChart3}
              />
            ))}
          </div>
        </section>
      ) : (
        <WidgetRenderer widgets={widgets ?? DEFAULT_PAGE_WIDGETS} context={context} />
      )}
    </AnalyticsLayout>
  );
}
