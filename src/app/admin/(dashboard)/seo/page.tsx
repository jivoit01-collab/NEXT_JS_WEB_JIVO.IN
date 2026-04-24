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
  X,
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
  if (pageKey.includes(':')) {
    const [prefix, slug] = pageKey.split(':');
    return `/${prefix}/${slug}`;
  }
  return `/${pageKey.replace(/-/g, '/')}`;
}

function pageLabel(pageKey: string): string {
  return pageKey
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

  useEffect(() => { void load(); }, [load]);

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

  const openAdd = () => { setNewPageKey(''); setNewPageError(null); setAddOpen(true); };

  const handleAddNext = () => {
    const key = newPageKey.trim().toLowerCase();
    if (!key) { setNewPageError('Page key is required'); return; }
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
      const res = await fetch(`/api/admin/seo/${encodeURIComponent(deletingPage)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) { toast.error(data.error ?? 'Delete failed'); return; }
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8">
      {/* ── Header ──────────────────────────── */}
      <div className="mb-8 text-center sm:mb-10">
        <p className="mb-3 text-xs font-jost-bold uppercase tracking-widest sm:text-sm" style={{ color: ACCENT }}>
          SEO Manager
        </p>
        <h1 className="text-2xl font-jost-bold sm:text-3xl md:text-4xl">
          Search &amp; Social Metadata
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Manage how every page appears in Google, social previews, and rich-result search features.
        </p>
      </div>

      {/* ── Stats row ───────────────────────── */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-jost-medium uppercase tracking-wide text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Total Pages
          </div>
          <div className="mt-1 text-2xl font-jost-bold">{rows.length}</div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-jost-medium uppercase tracking-wide text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Indexed
          </div>
          <div className="mt-1 text-2xl font-jost-bold text-primary">{indexedCount}</div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-jost-medium uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" /> No-Index
          </div>
          <div className="mt-1 text-2xl font-jost-bold">{noIndexCount}</div>
        </div>
      </div>

      {/* ── Search + Add ────────────────────── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
          )}
        </div>
        <Button onClick={openAdd} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Page SEO
        </Button>
      </div>

      {/* ── Section heading ──────────────────── */}
      <div className="mb-5 flex items-center gap-2">
        <Globe className="h-4 w-4" style={{ color: ACCENT }} />
        <h2 className="text-xs font-jost-bold uppercase tracking-widest text-muted-foreground">
          Pages
        </h2>
      </div>

      {/* ── Card grid ───────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 py-16 text-center">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          {rows.length === 0 ? (
            <>
              <p className="font-semibold text-muted-foreground">No SEO entries yet</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Click "Add Page SEO" or save SEO from any page's admin editor.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No pages match "{query}"</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
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
                className={`group relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border bg-card p-3 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg sm:gap-3 sm:p-5 ${isCardActive ? '-translate-y-1.5 border-primary/30 shadow-lg' : ''}`}
              >
                {/* Gradient hover/active bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity duration-300 group-hover:opacity-100 ${isCardActive ? 'opacity-100' : 'opacity-0'}`} />

                {/* Icon */}
                <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 sm:h-12 sm:w-12">
                  {isNoIndex ? (
                    <ShieldOff className="h-4 w-4 text-muted-foreground sm:h-[22px] sm:w-[22px]" />
                  ) : (
                    <Globe className="h-4 w-4 text-primary sm:h-[22px] sm:w-[22px]" />
                  )}
                </div>

                {/* Title + description */}
                <div className="relative z-10">
                  <span className="text-xs font-semibold text-foreground transition-colors duration-200 group-hover:text-primary sm:text-sm">
                    {pageLabel(row.page)}
                  </span>
                  <p className="mt-0.5 line-clamp-1 text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
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

                {/* Action buttons — visible on hover (desktop) or tap (mobile) */}
                <div className={`relative z-10 flex items-center gap-1 transition-opacity duration-200 group-hover:opacity-100 ${isCardActive ? 'opacity-100' : 'opacity-0'}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardId(null);
                      setEditingPage(row.page);
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    title="Edit SEO"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
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
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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

      {/* ── Footer hint ──────────────────────── */}
      {rows.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Showing {filtered.length} of {rows.length} page{rows.length !== 1 ? 's' : ''}.
          Hover or tap a card to edit, visit, or delete.
        </p>
      )}

      {/* ── SEO Guide ────────────────────────── */}
      <SeoGuide />

      {/* ── Edit drawer ──────────────────────── */}
      <Sheet open={!!editingPage} onOpenChange={(open) => { if (!open) { setEditingPage(null); void load(); } }}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              SEO — <span className="font-mono text-sm">{editingPage}</span>
            </SheetTitle>
          </SheetHeader>
          {editingPage && (
            <div className="mt-6">
              <SeoTabPanel page={editingPage} pageLabel={editingPage} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Add-new dialog ───────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Add SEO for a page
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-page">Page key</Label>
              <Input
                id="new-page"
                autoFocus
                value={newPageKey}
                onChange={(e) => { setNewPageKey(e.target.value); setNewPageError(null); }}
                placeholder="e.g. about, products, blog"
              />
              <p className="text-xs text-muted-foreground">
                The slug of the public route. Use <span className="font-mono">home</span> for the homepage.
              </p>
              {newPageError && <p className="text-xs text-destructive">{newPageError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNext}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ──────────────── */}
      <Dialog open={!!deletingPage} onOpenChange={(open) => !open && setDeletingPage(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete SEO for &quot;{deletingPage}&quot;?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            The page will fall back to its module default SEO. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPage(null)}>Cancel</Button>
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
