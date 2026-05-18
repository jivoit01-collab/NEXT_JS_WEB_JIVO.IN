'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Globe,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ShieldOff,
  ExternalLink,
  Inbox,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui';
import { SeoTabPanel, SeoGuide } from '@/modules/seo';

interface SeoRow {
  id: string;
  page: string;
  metaTitle: string;
  metaDescription: string | null;
  robots: string;
  updatedAt: string;
}

function publicHref(pageKey: string): string {
  if (pageKey === 'home') return '/';
  if (pageKey === 'our-essence-the-story') return '/our-essence/the-story';
  if (pageKey === 'our-essence-core-values') return '/our-essence/core-values';
  if (pageKey === 'our-essence-baru-sahib-association') {
    return '/our-essence/baru-sahib-association';
  }
  if (pageKey === 'our-essence-social-initiatives') {
    return '/our-essence/social-initiatives';
  }
  if (pageKey === 'our-essence-our-fair-share') {
    return '/our-essence/our-fair-share';
  }
  if (pageKey.includes(':')) {
    const [prefix, slug] = pageKey.split(':');
    return `/${prefix}/${slug}`;
  }
  return `/${pageKey.replace(/-/g, '/')}`;
}

function pageLabel(pageKey: string): string {
  return pageKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Gradient colors for cards
const GRADIENTS = [
  'from-emerald-500/20 to-emerald-600/5',
  'from-teal-500/20 to-teal-600/5',
  'from-sky-500/20 to-sky-600/5',
  'from-violet-500/20 to-violet-600/5',
  'from-amber-500/20 to-amber-600/5',
  'from-rose-500/20 to-rose-600/5',
  'from-indigo-500/20 to-indigo-600/5',
  'from-cyan-500/20 to-cyan-600/5',
];

const ACCENT = '#7c3aed';

export default function AdminSeoPage() {
  const [rows, setRows] = useState<SeoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newPageKey, setNewPageKey] = useState('');
  const [newPageError, setNewPageError] = useState<string | null>(null);
  const [deletingPage, setDeletingPage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCardId) return;
    const handler = () => setActiveCardId(null);
    const id = window.setTimeout(() => window.addEventListener('click', handler), 0);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('click', handler);
    };
  }, [activeCardId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setRows(data.data);
      else toast.error(data.error ?? 'Failed to load SEO list');
    } catch (err) {
      console.error('[SeoPage.load]', err);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.page.toLowerCase().includes(q) ||
        r.metaTitle.toLowerCase().includes(q) ||
        (r.metaDescription ?? '').toLowerCase().includes(q),
    );
  }, [rows, query]);

  const indexedCount = rows.filter((r) => !r.robots.includes('noindex')).length;
  const noIndexCount = rows.length - indexedCount;

  const openAdd = () => {
    setNewPageKey('');
    setNewPageError(null);
    setAddOpen(true);
  };

  const handleAddNext = () => {
    const key = newPageKey.trim().toLowerCase();
    if (!key) {
      setNewPageError('Page key is required');
      return;
    }
    if (!/^[a-z0-9:_/\-]+$/.test(key)) {
      setNewPageError('Lowercase letters, numbers, hyphens and / : _ only');
      return;
    }
    if (rows.some((r) => r.page === key)) {
      setNewPageError(`SEO already exists for "${key}"`);
      return;
    }
    setAddOpen(false);
    setEditingPage(key);
  };

  const handleDelete = async () => {
    if (!deletingPage) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/seo/${encodeURIComponent(deletingPage)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error ?? 'Delete failed');
        return;
      }
      toast.success(`SEO removed for "${deletingPage}"`);
      setDeletingPage(null);
      await load();
    } catch (err) {
      console.error('[SeoPage.delete]', err);
      toast.error('Network error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8 2xl:max-w-7xl 2xl:py-10">
      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mb-8 text-center sm:mb-10">
        <p
          className="font-jost-bold mb-3 text-xs tracking-widest uppercase sm:text-sm 2xl:text-base"
          style={{ color: ACCENT }}
        >
          SEO Manager
        </p>
        <h1 className="font-jost-bold text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl">
          Search &amp; Social Metadata
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm 2xl:max-w-2xl 2xl:text-base">
          Manage how every page appears in Google, social previews, and rich-result search features.
        </p>
      </div>

      {/* â”€â”€ Stats row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4 2xl:gap-5">
        <div className="bg-card rounded-xl border px-4 py-3 2xl:px-6 2xl:py-4">
          <div className="font-jost-medium text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase 2xl:text-sm">
            <Globe className="h-3.5 w-3.5" /> Total Pages
          </div>
          <div className="font-jost-bold mt-1 text-2xl 2xl:text-3xl">{rows.length}</div>
        </div>
        <div className="bg-card rounded-xl border px-4 py-3 2xl:px-6 2xl:py-4">
          <div className="font-jost-medium text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase 2xl:text-sm">
            <CheckCircle2 className="text-primary h-3.5 w-3.5" /> Indexed
          </div>
          <div className="font-jost-bold text-primary mt-1 text-2xl 2xl:text-3xl">
            {indexedCount}
          </div>
        </div>
        <div className="bg-card rounded-xl border px-4 py-3 2xl:px-6 2xl:py-4">
          <div className="font-jost-medium text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase 2xl:text-sm">
            <AlertTriangle className="h-3.5 w-3.5" /> No-Index
          </div>
          <div className="font-jost-bold mt-1 text-2xl 2xl:text-3xl">{noIndexCount}</div>
        </div>
      </div>

      {/* â”€â”€ Search + Add â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="bg-card focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs"
            >
              Clear
            </button>
          )}
        </div>
        <Button onClick={openAdd} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" /> Add Page SEO
        </Button>
      </div>

      {/* â”€â”€ Section heading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mb-5 flex items-center gap-2">
        <Globe className="h-4 w-4" style={{ color: ACCENT }} />
        <h2 className="font-jost-bold text-muted-foreground text-xs tracking-widest uppercase">
          Pages
        </h2>
      </div>

      {/* â”€â”€ Card grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {filtered.length === 0 ? (
        <div className="bg-muted/20 rounded-2xl border border-dashed py-16 text-center">
          <Inbox className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
          {rows.length === 0 ? (
            <>
              <p className="text-muted-foreground font-semibold">No SEO entries yet</p>
              <p className="text-muted-foreground/70 mt-1 text-xs">
                Click &quot;Add Page SEO&quot; or save SEO from any page&apos;s admin editor.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No pages match &quot;{query}&quot;</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {filtered.map((row, i) => {
            const isNoIndex = row.robots.includes('noindex');
            const href = publicHref(row.page);
            const gradient = GRADIENTS[i % GRADIENTS.length];

            const isCardActive = activeCardId === row.id;
            return (
              <div
                key={row.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCardId((prev) => (prev === row.id ? null : row.id));
                }}
                className={`group bg-card hover:border-primary/30 relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border p-3 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg sm:gap-3 sm:p-5 ${isCardActive ? 'border-primary/30 -translate-y-1.5 shadow-lg' : ''}`}
              >
                {/* Gradient hover/active bg */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity duration-300 group-hover:opacity-100 ${isCardActive ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Icon */}
                <div className="bg-primary/10 group-hover:bg-primary/20 relative z-10 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 sm:h-12 sm:w-12">
                  {isNoIndex ? (
                    <ShieldOff className="text-muted-foreground h-4 w-4 sm:h-[22px] sm:w-[22px]" />
                  ) : (
                    <Globe className="text-primary h-4 w-4 sm:h-[22px] sm:w-[22px]" />
                  )}
                </div>

                {/* Title + description */}
                <div className="relative z-10">
                  <span className="text-foreground group-hover:text-primary text-xs font-semibold transition-colors duration-200 sm:text-sm">
                    {pageLabel(row.page)}
                  </span>
                  <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[10px] leading-tight sm:text-[11px]">
                    {row.metaTitle}
                  </p>
                </div>

                {/* Robot badge */}
                <div className="relative z-10">
                  <Badge
                    variant={isNoIndex ? 'secondary' : 'default'}
                    className={`px-1.5 py-0 text-[9px] sm:text-[10px] ${isNoIndex ? '' : 'bg-primary/15 text-primary hover:bg-primary/25'}`}
                  >
                    {row.robots}
                  </Badge>
                </div>

                {/* Action buttons  visible on hover (desktop) or tap (mobile) */}
                <div
                  className={`relative z-10 flex items-center gap-1 transition-opacity duration-200 group-hover:opacity-100 ${isCardActive ? 'opacity-100' : 'opacity-0'}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardId(null);
                      setEditingPage(row.page);
                    }}
                    className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg p-1.5 transition-colors"
                    title="Edit SEO"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg p-1.5 transition-colors"
                    title={`Visit ${href}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardId(null);
                      setDeletingPage(row.page);
                    }}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg p-1.5 transition-colors"
                    title="Delete SEO"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* â”€â”€ Footer hint â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {rows.length > 0 && (
        <p className="text-muted-foreground mt-4 text-xs">
          Showing {filtered.length} of {rows.length} page{rows.length !== 1 ? 's' : ''}. Hover or
          tap a card to edit, visit, or delete.
        </p>
      )}

      {/* â”€â”€ SEO Guide â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <SeoGuide />

      {/* â”€â”€ Edit drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Sheet
        open={!!editingPage}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPage(null);
            void load();
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-x-hidden overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>SEO - {editingPage}</SheetTitle>
          </SheetHeader>
          {editingPage && (
            <div className="mt-6">
              <SeoTabPanel page={editingPage} pageLabel={editingPage} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* â”€â”€ Add-new dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="text-primary h-4 w-4" /> Add SEO for a page
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-page">Page key</Label>
              <Input
                id="new-page"
                autoFocus
                value={newPageKey}
                onChange={(e) => {
                  setNewPageKey(e.target.value);
                  setNewPageError(null);
                }}
                placeholder="e.g. about, products, blog"
              />
              <p className="text-muted-foreground text-xs">
                The slug of the public route. Use <span className="font-mono">home</span> for the
                homepage.
              </p>
              {newPageError && <p className="text-destructive text-xs">{newPageError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNext}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Delete confirmation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={!!deletingPage} onOpenChange={(open) => !open && setDeletingPage(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete SEO for &quot;{deletingPage}&quot;?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            The page will fall back to its module default SEO. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPage(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
