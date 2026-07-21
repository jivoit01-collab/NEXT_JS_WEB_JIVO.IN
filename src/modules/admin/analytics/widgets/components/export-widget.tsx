import { Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ExportButton } from '../../components/toolbar-actions';
import type { WidgetProps } from '../types';

/** Export widget — reuses the (disabled placeholder) ExportButton. */
export function ExportWidget(_props: WidgetProps) {
  void _props;
  return (
    <Card className="h-full items-center justify-center gap-3 py-6 text-center">
      <div className="bg-muted/60 mx-auto flex h-10 w-10 items-center justify-center rounded-xl">
        <Download size={18} className="text-muted-foreground/70" />
      </div>
      <div>
        <p className="font-jost-medium text-sm">Export data</p>
        <p className="text-muted-foreground mt-0.5 text-xs">CSV / PDF exports</p>
      </div>
      <ExportButton />
    </Card>
  );
}
