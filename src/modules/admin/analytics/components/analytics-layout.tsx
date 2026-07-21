import { AnalyticsBreadcrumb } from './analytics-breadcrumb';
import { DateFilter } from './date-filter';
import { PageSearch } from './page-search';
import { ExportButton, RefreshButton } from './toolbar-actions';

/**
 * The ONE reusable shell every analytics page uses — breadcrumb, title,
 * description, a toolbar (date filter · export · refresh) and a content area.
 * Guarantees a consistent layout so no page re-implements chrome.
 *
 * It's a server component that embeds the interactive controls (which are
 * client components), so pages can stay server-rendered.
 */
export function AnalyticsLayout({
  title,
  description,
  icon: Icon,
  breadcrumb,
  breadcrumbParent,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  /** Current breadcrumb leaf; defaults to the title. */
  breadcrumb?: string;
  /** Parent crumb for nested pages (e.g. the module a page belongs to). */
  breadcrumbParent?: { name: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <AnalyticsBreadcrumb current={breadcrumb ?? title} parent={breadcrumbParent} />

      {/* Header row */}
      <div className="mt-3 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between 2xl:pb-6">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="bg-primary/10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl 2xl:h-12 2xl:w-12">
              <Icon size={20} className="text-primary" />
            </div>
          )}
          <div>
            <h1 className="font-jost-bold text-xl 2xl:text-2xl">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1 max-w-2xl text-sm 2xl:text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar — search sits before the date filter */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <PageSearch />
          <DateFilter />
          <ExportButton />
          <RefreshButton />
        </div>
      </div>

      {/* Content */}
      <div className="py-6 2xl:py-8">{children}</div>
    </div>
  );
}
