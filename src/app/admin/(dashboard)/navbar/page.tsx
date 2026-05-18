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
import { ImageUpload, SafeImage } from '@/components/shared';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Navigation,
  Link2,
  X,
  CheckCircle2,
  Save,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

interface NavSubLinkRow {
  id: string;
  navLinkId: string;
  title: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
}

interface NavLinkRow {
  id: string;
  title: string;
  href?: string | null;
  sortOrder: number;
  isVisible: boolean;
  subLinks: NavSubLinkRow[];
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
  const [activeNavLinkId, setActiveNavLinkId] = useState<string | null>(null);

  // NavLink dialog
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NavLinkRow | null>(null);
  const [linkForm, setLinkForm] = useState({
    title: '',
    sortOrder: 0,
    isVisible: true,
  });

  // SubLink dialog
  const [subLinkDialogOpen, setSubLinkDialogOpen] = useState(false);
  const [editingSubLink, setEditingSubLink] = useState<NavSubLinkRow | null>(null);
  const [subLinkForm, setSubLinkForm] = useState({
    navLinkId: '',
    title: '',
    href: '',
    sortOrder: 0,
    isVisible: true,
  });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'link'; id: string; title: string }
    | { type: 'sublink'; id: string; title: string }
    | null
  >(null);

  const [error, setError] = useState('');

  // Logo / branding state
  const [setting, setSetting] = useState<NavbarSettingRow | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoAlt, setLogoAlt] = useState<string>('');
  const [savingLogo, setSavingLogo] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/navbar?all=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setLinks(data.data);
        setActiveNavLinkId((curr) => curr ?? data.data[0]?.id ?? null);
      } else {
        toast.error(data.error ?? 'Failed to load nav links');
      }
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

  const activeNavLink = links.find((l) => l.id === activeNavLinkId) ?? null;
  const totalSubLinks = links.reduce((n, l) => n + l.subLinks.length, 0);
  const visibleCount = links.filter((l) => l.isVisible).length;

  // ── Logo save ─────────────────────────────────────────────

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

  // ── NavLink handlers ──────────────────────────────────────

  const openCreateLink = () => {
    setEditingLink(null);
    setLinkForm({ title: '', sortOrder: links.length, isVisible: true });
    setError('');
    setLinkDialogOpen(true);
  };

  const openEditLink = (link: NavLinkRow) => {
    setEditingLink(link);
    setLinkForm({
      title: link.title,
      sortOrder: link.sortOrder,
      isVisible: link.isVisible,
    });
    setError('');
    setLinkDialogOpen(true);
  };

  const saveLink = async () => {
    setSaving(true);
    setError('');
    try {
      const isEdit = !!editingLink;
      const url = isEdit ? `/api/navbar/${editingLink.id}` : '/api/navbar';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkForm),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? 'Something went wrong');
        toast.error(data.error ?? 'Failed to save');
        return;
      }
      toast.success(`Link ${isEdit ? 'updated' : 'created'} successfully`);
      setLinkDialogOpen(false);
      await fetchLinks();
      router.refresh();
      if (!isEdit && data.data?.id) setActiveNavLinkId(data.data.id);
    } catch {
      toast.error('Network error — please retry');
    } finally {
      setSaving(false);
    }
  };

  const toggleLinkVisibility = async (link: NavLinkRow) => {
    try {
      const res = await fetch(`/api/navbar/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !link.isVisible }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${link.title}" ${link.isVisible ? 'hidden' : 'published'}`);
        await fetchLinks();
        router.refresh();
      } else {
        toast.error(data.error ?? 'Update failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // ── SubLink handlers ──────────────────────────────────────

  const openCreateSubLink = () => {
    if (!activeNavLink) return;
    setEditingSubLink(null);
    setSubLinkForm({
      navLinkId: activeNavLink.id,
      title: '',
      href: '',
      sortOrder: activeNavLink.subLinks.length,
      isVisible: true,
    });
    setError('');
    setSubLinkDialogOpen(true);
  };

  const openEditSubLink = (sub: NavSubLinkRow) => {
    setEditingSubLink(sub);
    setSubLinkForm({
      navLinkId: sub.navLinkId,
      title: sub.title,
      href: sub.href,
      sortOrder: sub.sortOrder,
      isVisible: sub.isVisible,
    });
    setError('');
    setSubLinkDialogOpen(true);
  };

  const saveSubLink = async () => {
    setSaving(true);
    setError('');
    try {
      const isEdit = !!editingSubLink;
      const url = isEdit
        ? `/api/navbar/sublinks/${editingSubLink.id}`
        : '/api/navbar/sublinks';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subLinkForm),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? 'Something went wrong');
        toast.error(data.error ?? 'Failed to save');
        return;
      }
      toast.success(`Sub-link ${isEdit ? 'updated' : 'created'} successfully`);
      setSubLinkDialogOpen(false);
      await fetchLinks();
      router.refresh();
    } catch {
      toast.error('Network error — please retry');
    } finally {
      setSaving(false);
    }
  };

  const toggleSubLinkVisibility = async (sub: NavSubLinkRow) => {
    try {
      const res = await fetch(`/api/navbar/sublinks/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !sub.isVisible }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Sub-link ${sub.isVisible ? 'hidden' : 'published'}`);
        await fetchLinks();
        router.refresh();
      } else {
        toast.error(data.error ?? 'Update failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // ── Delete ────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const endpoint =
        deleteTarget.type === 'link'
          ? `/api/navbar/${deleteTarget.id}`
          : `/api/navbar/sublinks/${deleteTarget.id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error ?? 'Delete failed');
        return;
      }
      toast.success(`${deleteTarget.type === 'link' ? 'Nav link' : 'Sub-link'} deleted`);
      if (deleteTarget.type === 'link' && deleteTarget.id === activeNavLinkId) {
        setActiveNavLinkId(null);
      }
      setDeleteTarget(null);
      await fetchLinks();
      router.refresh();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 2xl:max-w-7xl 2xl:space-y-8">
      {/* ── Header ──────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-jost-bold uppercase tracking-widest text-primary">
            <Navigation className="h-3.5 w-3.5" /> Navbar
          </div>
          <h1 className="text-2xl font-jost-bold tracking-tight md:text-3xl 2xl:text-4xl">
            Navbar Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground 2xl:text-base">
            Manage top navigation links and their hover dropdown sub-links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreateLink} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
      </div>

      {/* ── Stats row ──────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          icon={<Layers className="h-4 w-4" />}
          label="Total sub-links"
          value={totalSubLinks}
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
            <h2 className="text-base font-jost-bold">Brand logo</h2>
            <p className="text-xs text-muted-foreground">
              Shown on the left of the public navbar. Recommended: transparent
              PNG/WebP, ~120x40 px.
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
                  <SafeImage
                    src={logoUrl}
                    alt={logoAlt || 'Logo preview'}
                    width={120}
                    height={28}
                    className="h-7 w-auto object-contain"
                  />
                ) : (
                  <span className="font-playfair text-lg font-jost-bold text-white">
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

      {/* ══════════════════════════════════════════════ */}
      {/* NAV LINKS — TAB ROW (like footer columns)     */}
      {/* ══════════════════════════════════════════════ */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
          <div>
            <h2 className="text-sm font-jost-bold">Nav Links &amp; Sub-Links</h2>
            <p className="text-xs text-muted-foreground">
              Click a tab to manage that link&apos;s dropdown sub-links.
            </p>
          </div>
          <Button onClick={openCreateLink} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Link
          </Button>
        </div>

        {/* Tab strip */}
        <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b bg-muted/20 px-5 py-3">
          {links.length === 0 ? (
            <p className="text-xs text-muted-foreground">No links yet.</p>
          ) : (
            links.map((link) => {
              const isActive = link.id === activeNavLinkId;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveNavLinkId(link.id)}
                  className={`group flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card hover:border-muted-foreground hover:bg-accent'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      link.isVisible
                        ? isActive
                          ? 'bg-primary-foreground'
                          : 'bg-primary'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  <span className="font-jost-medium">{link.title}</span>
                  <span
                    className={`rounded-full px-1.5 text-[10px] ${
                      isActive
                        ? 'bg-primary-foreground/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {link.subLinks.length}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* ── Active link panel ──────────────────────── */}
        {activeNavLink ? (
          <div className="p-5">
            {/* Active link header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-jost-bold">{activeNavLink.title}</h3>
                <Badge
                  variant={activeNavLink.isVisible ? 'default' : 'secondary'}
                  className={
                    activeNavLink.isVisible ? 'bg-primary/15 text-primary' : ''
                  }
                >
                  {activeNavLink.isVisible ? 'Active' : 'Hidden'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Order #{activeNavLink.sortOrder}
                </span>
              </div>

              <div className="scrollbar-hide flex w-full items-center gap-2 overflow-x-auto sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleLinkVisibility(activeNavLink)}
                  className="shrink-0 gap-2"
                >
                  {activeNavLink.isVisible ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Hide link
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Publish link
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditLink(activeNavLink)}
                  className="shrink-0 gap-2"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDeleteTarget({
                      type: 'link',
                      id: activeNavLink.id,
                      title: activeNavLink.title,
                    })
                  }
                  className="shrink-0 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete link
                </Button>
                <Button onClick={openCreateSubLink} size="sm" className="shrink-0 gap-2">
                  <Plus className="h-4 w-4" /> Add Sub-Link
                </Button>
              </div>
            </div>

            {/* Sub-links table */}
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeNavLink.subLinks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No sub-links yet. Click <b>Add Sub-Link</b> to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeNavLink.subLinks.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{sub.sortOrder}
                        </TableCell>
                        <TableCell className="font-jost-medium">{sub.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {sub.href}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleSubLinkVisibility(sub)}
                            className="cursor-pointer"
                            title={sub.isVisible ? 'Click to hide' : 'Click to publish'}
                          >
                            <Badge
                              variant={sub.isVisible ? 'default' : 'secondary'}
                              className={
                                sub.isVisible
                                  ? 'bg-primary/15 text-primary hover:bg-primary/25'
                                  : 'hover:bg-secondary/80'
                              }
                            >
                              <span
                                className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                                  sub.isVisible ? 'bg-primary' : 'bg-muted-foreground'
                                }`}
                              />
                              {sub.isVisible ? 'Active' : 'Hidden'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => toggleSubLinkVisibility(sub)}
                              title={sub.isVisible ? 'Hide' : 'Publish'}
                              className="hover:bg-accent"
                            >
                              {sub.isVisible ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditSubLink(sub)}
                              title="Edit"
                              className="hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'sublink',
                                  id: sub.id,
                                  title: sub.title,
                                })
                              }
                              title="Delete"
                              className="text-destructive hover:bg-destructive/10"
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
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {links.length === 0
              ? 'Add your first nav link above to get started.'
              : 'Select a link tab to manage its sub-links.'}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* NavLink Dialog                                 */}
      {/* ══════════════════════════════════════════════ */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                {editingLink ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              {editingLink ? 'Edit nav link' : 'Create nav link'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nav-title">Title</Label>
              <Input
                id="nav-title"
                placeholder="e.g. Our Essence"
                value={linkForm.title}
                onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                The label shown in the navbar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Sort order</Label>
                <Input
                  type="number"
                  min={0}
                  value={linkForm.sortOrder}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Visibility</Label>
                <Button
                  type="button"
                  variant={linkForm.isVisible ? 'default' : 'secondary'}
                  className="w-full"
                  onClick={() => setLinkForm({ ...linkForm, isVisible: !linkForm.isVisible })}
                >
                  {linkForm.isVisible ? (
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
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveLink} disabled={saving} className="min-w-28">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingLink ? (
                'Save changes'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════ */}
      {/* SubLink Dialog                                 */}
      {/* ══════════════════════════════════════════════ */}
      <Dialog open={subLinkDialogOpen} onOpenChange={setSubLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubLink ? 'Edit sub-link' : 'Add sub-link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Parent link</Label>
              <select
                className="h-9 w-full cursor-pointer rounded-md border border-border bg-background px-3 text-sm"
                value={subLinkForm.navLinkId}
                onChange={(e) => setSubLinkForm({ ...subLinkForm, navLinkId: e.target.value })}
              >
                {links.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={subLinkForm.title}
                onChange={(e) => setSubLinkForm({ ...subLinkForm, title: e.target.value })}
                placeholder="e.g. The Story / Journey"
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label>URL / path</Label>
              <Input
                value={subLinkForm.href}
                onChange={(e) => setSubLinkForm({ ...subLinkForm, href: e.target.value })}
                placeholder="/our-essence/story"
                maxLength={300}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  min={0}
                  value={subLinkForm.sortOrder}
                  onChange={(e) =>
                    setSubLinkForm({ ...subLinkForm, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Button
                  type="button"
                  variant={subLinkForm.isVisible ? 'default' : 'secondary'}
                  className="w-full"
                  onClick={() =>
                    setSubLinkForm({ ...subLinkForm, isVisible: !subLinkForm.isVisible })
                  }
                >
                  {subLinkForm.isVisible ? 'Active' : 'Hidden'}
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
            <Button variant="outline" onClick={() => setSubLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSubLink} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSubLink ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════ */}
      {/* Delete Confirm                                 */}
      {/* ══════════════════════════════════════════════ */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete {deleteTarget?.type === 'link' ? 'nav link' : 'sub-link'}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <b>{deleteTarget?.title}</b>?
            {deleteTarget?.type === 'link' &&
              ' This will also delete all sub-links inside this nav link.'}{' '}
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
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
      <div className="flex items-center gap-2 text-xs font-jost-medium uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div
        className={`mt-1 text-2xl font-jost-bold 2xl:text-3xl ${
          tone === 'primary' ? 'text-primary' : 'text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
