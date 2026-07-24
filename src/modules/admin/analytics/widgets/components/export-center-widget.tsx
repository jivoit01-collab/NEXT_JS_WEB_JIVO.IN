'use client';

import { toast } from 'sonner';
import { FileSpreadsheet, FileText, FileDown, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FORMATS = [
  { id: 'csv', label: 'Export CSV', icon: FileText },
  { id: 'excel', label: 'Export Excel', icon: FileSpreadsheet },
  { id: 'pdf', label: 'Export PDF', icon: FileDown },
];

/**
 * Export Center — CSV / Excel / PDF. Production-safe today: the buttons render
 * as "Ready" but clicking shows a friendly "coming soon" toast instead of an
 * error. A future phase replaces `onExport` with real generation — no layout
 * change.
 */
export function ExportCenterWidget() {
  const onExport = () => toast('Export module will be implemented in a future phase.');

  return (
    <Card className="h-full gap-0 py-0">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3 2xl:px-5">
        <p className="font-jost-medium text-sm 2xl:text-base">Export Center</p>
        <span className="flex items-center gap-1 text-emerald-600 text-xs 2xl:text-sm">
          <CheckCircle2 size={13} /> Ready
        </span>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-3 2xl:p-5">
        {FORMATS.map((f) => {
          const Icon = f.icon;
          return (
            <Button key={f.id} variant="outline" onClick={onExport} className="h-10 justify-center gap-2">
              <Icon size={15} />
              {f.label}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
