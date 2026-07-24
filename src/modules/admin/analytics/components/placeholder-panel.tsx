import { cn } from '@/lib/utils';

/**
 * A titled, interactive "coming soon" widget body — the single placeholder UI
 * used across every module page. Solid card with a hover lift + primary-tinted
 * icon so the dashboard feels alive even before real data lands.
 */
export function PlaceholderPanel({
  title,
  description,
  icon: Icon,
  className,
  minHeight = 'min-h-44',
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  className?: string;
  minHeight?: string;
}) {
  return (
    <div
      className={cn(
        'group bg-card relative flex h-full flex-col items-center justify-center overflow-hidden rounded-xl border p-6 text-center shadow-sm transition-all duration-300',
        'hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md',
        minHeight,
        className,
      )}
    >
      {/* Subtle hover wash */}
      <div className="from-primary/[0.05] pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {Icon && (
        <div className="bg-primary/10 relative mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 2xl:h-12 2xl:w-12">
          <Icon size={20} className="text-primary" />
        </div>
      )}
      <p className="relative font-jost-medium text-sm 2xl:text-base">{title}</p>
      {description && (
        <p className="text-muted-foreground relative mt-1 max-w-md text-xs 2xl:text-sm">
          {description}
        </p>
      )}
      <span className="bg-muted/70 text-muted-foreground relative mt-3 rounded-full px-2.5 py-0.5 text-[10px] font-jost-medium uppercase tracking-wider 2xl:text-[11px]">
        Coming soon
      </span>
    </div>
  );
}
