'use client';

import { useTransition } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportAnalyticsCsvAction } from '../actions';
import type { AnalyticsExportContext } from '../widgets/types';

/**
 * Toolbar export controls (Phase 6.1). "Export CSV" re-reads the current page's
 * data through the analytics data source (via a server action) and downloads it;
 * "Export PDF" prints the page (browser → Save as PDF). Real data only — the CSV
 * carries exactly the KPIs/breakdowns rendered on the page.
 */
export function ToolbarExport({ context }: { context: AnalyticsExportContext }) {
  const [pending, start] = useTransition();

  const onCsv = () =>
    start(async () => {
      const res = await exportAnalyticsCsvAction(context);
      if (!res || !res.success) return;
      const blob = new Blob([res.data.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.data.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={onCsv}
        disabled={pending}
        aria-label="Export CSV"
      >
        <FileSpreadsheet size={15} />
        <span className="hidden sm:inline">Export CSV</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={() => window.print()}
        aria-label="Export PDF"
      >
        <FileText size={15} />
        <span className="hidden sm:inline">Export PDF</span>
      </Button>
    </>
  );
}
