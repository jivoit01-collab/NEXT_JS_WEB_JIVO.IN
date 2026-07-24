import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ANALYTICS_ROOT } from '../services';

/**
 * Analytics ▸ [Module ▸] Page breadcrumb. Pass `parent` for a page nested under
 * a module (e.g. Analytics ▸ Our Essence ▸ The Story).
 */
export function AnalyticsBreadcrumb({
  current,
  parent,
}: {
  current: string;
  parent?: { name: string; href: string };
}) {
  const isRoot = current.toLowerCase() === 'overview' && !parent;

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground flex items-center gap-1 text-xs 2xl:text-sm"
    >
      <Link href={ANALYTICS_ROOT} className="hover:text-foreground transition-colors">
        Analytics
      </Link>
      {parent && (
        <>
          <ChevronRight size={13} className="opacity-60" />
          <Link href={parent.href} className="hover:text-foreground transition-colors">
            {parent.name}
          </Link>
        </>
      )}
      {!isRoot && (
        <>
          <ChevronRight size={13} className="opacity-60" />
          <span className="text-foreground font-jost-medium">{current}</span>
        </>
      )}
    </nav>
  );
}
