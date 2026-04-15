'use client';

import { Search } from 'lucide-react';
import { SeoListTable } from '@/modules/seo';

export default function AdminSeoPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Search className="h-3.5 w-3.5" /> SEO Manager
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Search & Social Metadata
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage how every public page appears in Google, social previews, and rich-result
          search features. Each page falls back to module defaults when no entry exists here.
        </p>
      </div>

      <SeoListTable />
    </div>
  );
}
