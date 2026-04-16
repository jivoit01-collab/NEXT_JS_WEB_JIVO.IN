'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Badge,
} from '@/components/ui';
import { ImageUpload, toSrc } from '@/components/shared';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Navigation,
  Link2,
  ExternalLink,
  X,
  CheckCircle2,
  Save,
  Image as ImageIcon,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

interface NavLinkRow {
  id: string;
  title: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NavbarSettingRow {
  id: string;
  logoUrl: string | null;
  logoAlt: string | null;
  updatedAt: string;
}

// ── Page ──────────────────────────────────────────────────────

export default function AdminNavbarManager() {
  const router = useRouter();
  const [links, setLinks] = useState<NavLinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NavLinkRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formHref, setFormHref] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [error, setError] = useState('');

  // Logo / branding state
  const [setting, setSetting] = useState<NavbarSettingRow | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoAlt, setLogoAlt] = useState<string>('');
  const [savingLogo, setSavingLogo] = useState(false);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/navbar?all=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setLinks(data.data);
      else toast.error(data.error ?? 'Failed to load nav links');
    } catch {
      toast.error('Failed to load navbar links');
    }
  }, []);

  const fetchSetting = useCallback(async () => {
    try {
      const res = await fetch('/api/navbar/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setSetting(data.data);
        setLogoUrl(data.data.logoUrl ?? '');
        setLogoAlt(data.data.logoAlt ?? '');
      } else {
        toast.error(data.error ?? 'Failed to load navbar settings');
      }
    } catch {
      toast.error('Failed to load navbar settings');
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchLinks(), fetchSetting()]).finally(() => setLoading(false));
  }, [fetchLinks, fetchSetting]);

  const saveLogo = async () => {
    setSavingLogo(true);
    try {
      const res = await fetch('/api/navbar/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl: logoUrl || null,
          logoAlt: logoAlt || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Navbar logo updated');
        setSetting(data.data);
        router.refresh();
      } else {
        toast.error(data.error ?? 'Failed to save logo');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSavingLogo(false);
    }
  };

  const logoDirty =
    (setting?.logoUrl ?? '') !== logoUrl ||
    (setting?.logoAlt ?? '') !== logoAlt;

  const visibleCount = links.filter((l) => l.isVisible).length;

  const openCreate = () => {
    setEditing(null);
    setFormTitle('');
    setFormHref('');
    setFormSortOrder(links.length);
    setFormIsVisible(true);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (link: NavLinkRow) => {
    setEditing(link);
    setFormTitle(link.title);
    setFormHref(link.href);
    setFormSortOrder(link.sortOrder);
    setFormIsVisible(link.isVisible);
    setError('');
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const isEdit = !!editing;
      const url = isEdit ? `/api/navbar/${editing.id}` : '/api/navbar';
      const method = isEdit ? 'PUT' : 'POST';

      const body = {
        title: formTitle.trim(),
        href: formHref.trim(),
        sortOrder: formSortOrder,
        isVisible: formIsVisible,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? 'Something went wrong');
        toast.error(data.error ?? 'Failed to save');
        return;
      }

      toast.success(`Link ${isEdit ? 'updated' : 'created'} successfully`);
      setDialogOpen(false);
      await fetchLinks();
      router.refresh();
    } catch {
      toast.error('Network error — please retry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/navbar/${deletingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Link deleted');
        setDeleteDialogOpen(false);
        setDeletingId(null);
        await fetchLinks();
        router.refresh();
      } else {
        toast.error(data.error ?? 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (link: NavLinkRow) => {
    try {
      const res = await fetch(`/api/navbar/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !link.isVisible }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `"${link.title}" ${link.isVisible ? 'hidden' : 'published'}`,
        );
        await fetchLinks();
        router.refresh();
      } else {
        toast.error(data.error ?? 'Update failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── Header ──────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Navigation className="h-3.5 w-3.5" /> Navbar
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Navbar Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the top navigation links shown across the public site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View Live Site
            </a>
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
      </div>

      {/* ── Stats row ──────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Link2 className="h-4 w-4" />}
          label="Total links"
          value={links.length}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
          label="Visible"
          value={visibleCount}
          tone="primary"
        />
        <StatCard
          icon={<EyeOff className="h-4 w-4" />}
          label="Hidden"
          value={links.length - visibleCount}
        />
      </div>

      {/* ── Brand / Logo card ──────────────── */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ImageIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Brand logo</h2>
            <p className="text-xs text-muted-foreground">
              Shown on the left of the public navbar. Recommended: transparent
              PNG/WebP, ~120×40 px.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-[auto,1fr]">
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
              Logo image
            </Label>
            <ImageUpload
              value={logoUrl || undefined}
              onChange={(url) => setLogoUrl(url)}
              onRemove={() => setLogoUrl('')}
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="logo-alt" className="text-xs uppercase tracking-wide text-muted-foreground">
                Alt text (accessibility)
              </Label>
              <Input
                id="logo-alt"
                placeholder="Jivo Wellness"
                value={logoAlt}
                onChange={(e) => setLogoAlt(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Defaults to the site name when left empty.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Live preview
              </Label>
              <div className="flex h-16 items-center justify-between rounded-md bg-gradient-to-br from-[#3d4f2f] to-[#2a3a1f] px-4">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={toSrc(logoUrl)}
                    alt={logoAlt || 'Logo preview'}
                    className="h-7 w-auto object-contain"
                  />
                ) : (
                  <span className="font-playfair text-lg font-semibold text-white">
                    {logoAlt || 'Jivo Wellness'}
                  </span>
                )}
                <span className="text-xs text-white/60">navbar preview</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              {logoDirty && (
                <span className="text-xs text-muted-foreground">
                  Unsaved changes
                </span>
              )}
              <Button
                onClick={saveLogo}
                disabled={!logoDirty || savingLogo}
                className="gap-2"
              >
                {savingLogo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save logo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Links table ────────────────────── */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  No nav links yet — click &quot;Add Link&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{link.sortOrder}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{link.title}</div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {link.href}
                    </code>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleVisible(link)}
                      className="cursor-pointer"
                      title={
                        link.isVisible
                          ? 'Click to hide from navbar'
                          : 'Click to show in navbar'
                      }
                    >
                      <Badge
                        variant={link.isVisible ? 'default' : 'secondary'}
                        className={
                          link.isVisible
                            ? 'bg-primary/15 text-primary hover:bg-primary/25'
                            : 'hover:bg-secondary/80'
                        }
                      >
                        <span
                          className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                            link.isVisible ? 'bg-primary' : 'bg-muted-foreground'
                          }`}
                        />
                        {link.isVisible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(link)}
                        title="Edit"
                        className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDelete(link.id)}
                        title="Delete"
                        className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Edit / Create Dialog ───────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              {editing ? 'Edit nav link' : 'Create nav link'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nav-title">Title</Label>
              <Input
                id="nav-title"
                placeholder="e.g. Our Essence"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                The label shown in the navbar.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nav-href">Link (href)</Label>
              <Input
                id="nav-href"
                placeholder="e.g. /our-essence"
                value={formHref}
                onChange={(e) => setFormHref(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Use an internal path like <code>/products</code> or a full URL.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Sort order</Label>
                <Input
                  type="number"
                  min={0}
                  value={formSortOrder}
                  onChange={(e) =>
                    setFormSortOrder(parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Visibility</Label>
                <Button
                  type="button"
                  variant={formIsVisible ? 'default' : 'secondary'}
                  className="w-full"
                  onClick={() => setFormIsVisible(!formIsVisible)}
                >
                  {formIsVisible ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" /> Hidden
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <X className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="min-w-28">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editing ? (
                'Save changes'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete nav link?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove the link from the public site navbar. This cannot
            be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Small StatCard ────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: 'default' | 'primary';
}) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold ${
          tone === 'primary' ? 'text-primary' : 'text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
