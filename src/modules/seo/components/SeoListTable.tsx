'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Pencil,
  Loader2,
  Globe,
  ShieldOff,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Inbox,
  X,
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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui';
import { SeoTabPanel } from './SeoTabPanel';

interface SeoRow {
  id: string;
  page: string;
  metaTitle: string;
  metaDescription: string | null;
  robots: string;
  updatedAt: string;
}

/** Resolve a page key to its public URL (best-effort). */
function publicHref(pageKey: string): string {
  if (pageKey === 'home') return '/';
  // Detail SEOs use `prefix:slug` syntax, e.g., `product:cold-press-canola-oil`
  if (pageKey.includes(':')) {
    const [prefix, slug] = pageKey.split(':');
    return `/${prefix}/${slug}`;
  }
  return `/${pageKey}`;
}

export function SeoListTable() {
  const [rows, setRows] = useState<SeoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Edit drawer
  const [editingPage, setEditingPage] = useState<string | null>(null);

  // Add-new dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newPageKey, setNewPageKey] = useState('');
  const [newPageError, setNewPageError] = useState<string | null>(null);

  // Delete confirm
  const [deletingPage, setDeletingPage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setRows(data.data);
      else toast.error(data.error ?? 'Failed to load SEO list');
    } catch (err) {
      console.error('[SeoListTable.load]', err);
      toast.error('Network error — could not load SEO list');
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
      setNewPageError(
        'Lowercase letters, numbers, hyphens and / : _ only (e.g. about, product:slug)',
      );
      return;
    }
    if (rows.some((r) => r.page === key)) {
      setNewPageError(`SEO already exists for "${key}" — open it from the table below`);
      return;
    }
    setAddOpen(false);
    setEditingPage(key); // open the editor drawer; first save will create the row
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
      toast.success(`SEO removed for "${deletingPage}"`, {
        description: 'Page falls back to module defaults.',
      });
      setDeletingPage(null);
      await load();
    } catch (err) {
      console.error('[SeoListTable.delete]', err);
      toast.error('Network error — delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Toolbar: search + add ─────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by page key or title…"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Page SEO
        </Button>
      </div>

      {/* ── Table ─────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-44">Page</TableHead>
              <TableHead>Meta Title & Description</TableHead>
              <TableHead className="w-32">Robots</TableHead>
              <TableHead className="w-36">Updated</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-muted-foreground">
                    <Inbox className="h-8 w-8 opacity-60" />
                    {rows.length === 0 ? (
                      <>
                        <p className="text-sm font-jost-medium">
                          No pages have SEO entries yet.
                        </p>
                        <p className="text-xs">
                          Click <span className="font-jost-bold">Add Page SEO</span> above
                          to create your first one. Pages also appear here automatically
                          after you save SEO from any page&apos;s admin editor.
                        </p>
                      </>
                    ) : (
                      <p className="text-sm">
                        No pages match &quot;<span className="font-mono">{query}</span>
                        &quot;.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const isNoIndex = row.robots.includes('noindex');
                const href = publicHref(row.page);
                return (
                  <TableRow
                    key={row.id}
                    className="group cursor-pointer"
                    onClick={() => setEditingPage(row.page)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-jost-medium text-primary">
                          {row.page}
                        </span>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                          title={`Open ${href} in new tab`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="line-clamp-1 font-jost-medium">{row.metaTitle}</div>
                      {row.metaDescription && (
                        <div className="line-clamp-1 text-xs text-muted-foreground">
                          {row.metaDescription}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isNoIndex ? 'secondary' : 'default'}
                        className={
                          isNoIndex
                            ? ''
                            : 'bg-primary/15 text-primary hover:bg-primary/25'
                        }
                      >
                        {isNoIndex ? (
                          <>
                            <ShieldOff className="mr-1 h-3 w-3" /> {row.robots}
                          </>
                        ) : (
                          <>
                            <Globe className="mr-1 h-3 w-3" /> {row.robots}
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(row.updatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPage(row.page);
                          }}
                          title="Edit SEO"
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingPage(row.page);
                          }}
                          title="Delete SEO"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Footer hint ───────────────────────── */}
      {rows.length > 0 && (
        <p className="px-1 text-xs text-muted-foreground">
          Showing {filtered.length} of {rows.length} page
          {rows.length === 1 ? '' : 's'}. Pages appear here when you build them and save
          SEO from their admin editor (e.g. <span className="font-mono">/admin/home</span>
          &nbsp;→ SEO tab) or via the &quot;Add Page SEO&quot; button above.
        </p>
      )}

      {/* ── Edit drawer ───────────────────────── */}
      <Sheet
        open={!!editingPage}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPage(null);
            void load();
          }
        }}
      >
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

      {/* ── Add-new dialog ────────────────────── */}
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
                onChange={(e) => {
                  setNewPageKey(e.target.value);
                  setNewPageError(null);
                }}
                placeholder="e.g. about, products, blog"
              />
              <p className="text-xs text-muted-foreground">
                The slug of the public route. Use <span className="font-mono">home</span>{' '}
                for the homepage, <span className="font-mono">product:slug</span> for
                detail pages.
              </p>
              {newPageError && (
                <p className="text-xs text-destructive">{newPageError}</p>
              )}
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

      {/* ── Delete confirmation ───────────────── */}
      <Dialog
        open={!!deletingPage}
        onOpenChange={(open) => !open && setDeletingPage(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete SEO for &quot;{deletingPage}&quot;?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            The page will fall back to its module default SEO, then to the site default.
            This cannot be undone.
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
