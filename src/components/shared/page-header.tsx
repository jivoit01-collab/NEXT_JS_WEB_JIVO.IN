import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('pt-6 pb-8', className)}>
      <h1 className="font-jost-bold font-sans text-3xl tracking-tight md:text-4xl">{title}</h1>
      {description && <p className="text-muted-foreground mt-2 text-lg">{description}</p>}
    </div>
  );
}
