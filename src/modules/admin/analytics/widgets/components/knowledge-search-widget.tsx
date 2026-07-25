'use client';

// Knowledge Search widget (Phase 7.0) — embeds the reusable KnowledgeSearchBox
// from the Knowledge Platform inside the analytics Search page. Interactive
// (client), receives no data from the source.

import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { KnowledgeSearchBox } from '@/modules/platform/knowledge/components';

export function KnowledgeSearchWidget() {
  return (
    <Card className="h-full gap-0 py-0">
      <div className="flex items-center gap-2 border-b px-4 py-3 2xl:px-5">
        <Search size={16} className="text-primary shrink-0" />
        <p className="font-jost-medium text-sm 2xl:text-base">Knowledge Search</p>
      </div>
      <div className="p-4 2xl:p-5">
        <KnowledgeSearchBox />
      </div>
    </Card>
  );
}
