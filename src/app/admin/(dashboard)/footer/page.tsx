'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui';
import { ImageUpload } from '@/components/shared';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  PanelBottom,
  Save,
  Columns3,
  Layers,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

interface FooterLink {
  id: string;
  columnId: string;
  title: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
}

interface FooterColumn {
  id: string;
  title: string;
  sortOrder: number;
  isVisible: boolean;
  links: FooterLink[];
}

interface FooterSetting {
  id: string;
  logoUrl: string | null;
  logoAlt: string | null;
  copyrightText: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  phoneLabel: string | null;
}

// ══════════════════════════════════════════════════════════════

export default function AdminFooterPage() {
  const router = useRouter();
  const [columns, setColumns] = useState<FooterColumn[]>([]);
  const [setting, setSetting] = useState<FooterSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Column dialog
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null);
  const [colForm, setColForm] = useState({ title: '', sortOrder: 0, isVisible: true });

  // Link dialog
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [linkForm, setLinkForm] = useState({
    columnId: '',
    title: '',
    href: '',
    sortOrder: 0,
    isVisible: true,
  });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'column'; id: string; title: string }
    | { type: 'link'; id: string; title: string }
    | null
  >(null);

  const [saving, setSaving] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    logoUrl: '',
    logoAlt: '',
    copyrightText: '',
    address: '',
    email: '',
    phone: '',
    phoneLabel: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [colsRes, settingRes] = await Promise.all([
        fetch('/api/footer?all=true', { cache: 'no-store' }),
        fetch('/api/footer/settings', { cache: 'no-store' }),
      ]);
      const colsJson = await colsRes.json();
      const settingJson = await settingRes.json();
      if (colsJson.success) {
        setColumns(colsJson.data.columns);
        // Pin the first column as active if nothing's selected yet
        setActiveColumnId((curr) => curr ?? colsJson.data.columns[0]?.id ?? null);
      }
      if (settingJson.success) {
        setSetting(settingJson.data);
        setSettingsForm({
          logoUrl: settingJson.data.logoUrl ?? '',
          logoAlt: settingJson.data.logoAlt ?? '',
          copyrightText: settingJson.data.copyrightText ?? '',
          address: settingJson.data.address ?? '',
          email: settingJson.data.email ?? '',
          phone: settingJson.data.phone ?? '',
          phoneLabel: settingJson.data.phoneLabel ?? '',
        });
      }
    } catch {
      toast.error('Failed to load footer data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const activeColumn = columns.find((c) => c.id === activeColumnId) ?? null;
  const totalLinks = columns.reduce((n, c) => n + c.links.length, 0);
  const activeColumnsCount = columns.filter((c) => c.isVisible).length;

  // ── Column handlers ────────────────────────────────────────
  const openCreateColumn = () => {
    setEditingColumn(null);
    setColForm({ title: '', sortOrder: columns.length, isVisible: true });
    setColumnDialogOpen(true);
  };
  const openEditColumn = (col: FooterColumn) => {
    setEditingColumn(col);
    setColForm({ title: col.title, sortOrder: col.sortOrder, isVisible: col.isVisible });
    setColumnDialogOpen(true);
  };
  const saveColumn = async () => {
    setSaving(true);
    try {
      const isEdit = !!editingColumn;
      const url = isEdit ? `/api/footer/columns/${editingColumn.id}` : '/api/footer/columns';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colForm),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error ?? 'Failed to save');
        return;
      }
      toast.success(`Column ${isEdit ? 'updated' : 'created'}`);
      setColumnDialogOpen(false);
      await fetchAll();
      router.refresh();
      // After creation, jump to the newly-created column
      if (!isEdit && data.data?.id) setActiveColumnId(data.data.id);
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };
  const toggleColumnVisibility = async (col: FooterColumn) => {
    const res = await fetch(`/api/footer/columns/${col.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !col.isVisible }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Column ${col.isVisible ? 'hidden' : 'published'}`);
      await fetchAll();
      router.refresh();
    } else toast.error(data.error ?? 'Update failed');
  };

  // ── Link handlers ──────────────────────────────────────────
  const openCreateLink = () => {
    if (!activeColumn) return;
    setEditingLink(null);
    setLinkForm({
      columnId: activeColumn.id,
      title: '',
      href: '',
      sortOrder: activeColumn.links.length,
      isVisible: true,
    });
    setLinkDialogOpen(true);
  };
  const openEditLink = (link: FooterLink) => {
    setEditingLink(link);
    setLinkForm({
      columnId: link.columnId,
      title: link.title,
      href: link.href,
      sortOrder: link.sortOrder,
      isVisible: link.isVisible,
    });
    setLinkDialogOpen(true);
  };
  const saveLink = async () => {
    setSaving(true);
    try {
      const isEdit = !!editingLink;
      const url = isEdit ? `/api/footer/links/${editingLink.id}` : '/api/footer/links';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkForm),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error ?? 'Failed to save');
        return;
      }
      toast.success(`Link ${isEdit ? 'updated' : 'created'}`);
      setLinkDialogOpen(false);
      await fetchAll();
      router.refresh();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };
  const toggleLinkVisibility = async (link: FooterLink) => {
    const res = await fetch(`/api/footer/links/${link.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !link.isVisible }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Link ${link.isVisible ? 'hidden' : 'published'}`);
      await fetchAll();
      router.refresh();
    } else toast.error(data.error ?? 'Update failed');
  };

  // ── Delete ─────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const endpoint =
        deleteTarget.type === 'column'
          ? `/api/footer/columns/${deleteTarget.id}`
          : `/api/footer/links/${deleteTarget.id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error ?? 'Delete failed');
        return;
      }
      toast.success(`${deleteTarget.type === 'column' ? 'Column' : 'Link'} deleted`);
      // If we deleted the active column, fall back to the first remaining one
      if (deleteTarget.type === 'column' && deleteTarget.id === activeColumnId) {
        setActiveColumnId(null);
      }
      setDeleteTarget(null);
      await fetchAll();
      router.refresh();
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  // ── Settings save ──────────────────────────────────────────
  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/footer/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error ?? 'Failed to save settings');
        return;
      }
      toast.success('Footer settings saved');
      await fetchAll();
      router.refresh();
    } catch {
      toast.error('Network error');
    } finally {
      setSavingSettings(false);
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
      {/* ── Header ─────────────────────────────────── */}
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <PanelBottom className="h-3.5 w-3.5" /> Footer
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Footer Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage every footer column, link, and the bottom bar (logo + contact info).
        </p>
      </div>

      {/* ── Stats row ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Columns3 className="h-4 w-4" />}
          label="Total columns"
          value={columns.length}
        />
        <StatCard
          icon={<Eye className="h-4 w-4 text-primary" />}
          label="Active columns"
          value={activeColumnsCount}
          tone="primary"
        />
        <StatCard
          icon={<Layers className="h-4 w-4" />}
          label="Total links"
          value={totalLinks}
        />
        <StatCard
          icon={<EyeOff className="h-4 w-4" />}
          label="Hidden"
          value={columns.length - activeColumnsCount}
        />
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* SETTINGS  (singleton)                         */}
      {/* ══════════════════════════════════════════════ */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-sm font-semibold">Brand &amp; Contact (bottom bar)</h2>
          <Button onClick={saveSettings} disabled={savingSettings} size="sm" className="gap-2">
            {savingSettings ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Logo</Label>
              <ImageUpload
                value={settingsForm.logoUrl}
                onChange={(url) => setSettingsForm({ ...settingsForm, logoUrl: url })}
                onRemove={() => setSettingsForm({ ...settingsForm, logoUrl: '' })}
              />
            </div>
            <div className="space-y-2">
              <Label>Logo alt text</Label>
              <Input
                value={settingsForm.logoAlt}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, logoAlt: e.target.value })
                }
                placeholder="Jivo"
              />
              <Label className="pt-2">Copyright text</Label>
              <Input
                value={settingsForm.copyrightText}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, copyrightText: e.target.value })
                }
                placeholder="All Right Reserved © 2026"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              rows={2}
              value={settingsForm.address}
              onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
              placeholder="Jt/190, Nehru Market, Rajouri Garden, New Delhi - 110027"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={settingsForm.email}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, email: e.target.value })
                }
                placeholder="info@jivo.in"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={settingsForm.phone}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, phone: e.target.value })
                }
                placeholder="1800 137 4433"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone label</Label>
              <Input
                value={settingsForm.phoneLabel}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, phoneLabel: e.target.value })
                }
                placeholder="(TOLL FREE)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* COLUMNS — TAB ROW                              */}
      {/* ══════════════════════════════════════════════ */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold">Link Columns</h2>
            <p className="text-xs text-muted-foreground">
              Click a tab to manage that column's links.
            </p>
          </div>
          <Button onClick={openCreateColumn} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Column
          </Button>
        </div>

        {/* Tab strip — horizontal scrollable list of columns */}
        <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b bg-muted/20 px-5 py-3">
          {columns.length === 0 ? (
            <p className="text-xs text-muted-foreground">No columns yet.</p>
          ) : (
            columns.map((col) => {
              const isActive = col.id === activeColumnId;
              return (
                <button
                  key={col.id}
                  onClick={() => setActiveColumnId(col.id)}
                  className={`group flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card hover:border-muted-foreground hover:bg-accent'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      col.isVisible
                        ? isActive
                          ? 'bg-primary-foreground'
                          : 'bg-primary'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  <span className="font-medium">{col.title}</span>
                  <span
                    className={`rounded-full px-1.5 text-[10px] ${
                      isActive
                        ? 'bg-primary-foreground/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {col.links.length}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* ── Active column panel ─────────────────────────── */}
        {activeColumn ? (
          <div className="p-5">
            {/* Active column header — title + actions on the column itself */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold">{activeColumn.title}</h3>
                <Badge
                  variant={activeColumn.isVisible ? 'default' : 'secondary'}
                  className={
                    activeColumn.isVisible ? 'bg-primary/15 text-primary' : ''
                  }
                >
                  {activeColumn.isVisible ? 'Active' : 'Hidden'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Order #{activeColumn.sortOrder}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleColumnVisibility(activeColumn)}
                  className="gap-2"
                >
                  {activeColumn.isVisible ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Hide column
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Publish column
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditColumn(activeColumn)}
                  className="gap-2"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit column
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDeleteTarget({
                      type: 'column',
                      id: activeColumn.id,
                      title: activeColumn.title,
                    })
                  }
                  className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete column
                </Button>
                <Button onClick={openCreateLink} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Add Link
                </Button>
              </div>
            </div>

            {/* Links table */}
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
                  {activeColumn.links.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No links yet. Click <b>Add Link</b> to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeColumn.links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{link.sortOrder}
                        </TableCell>
                        <TableCell className="font-medium">{link.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {link.href}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleLinkVisibility(link)}
                            className="cursor-pointer"
                            title={link.isVisible ? 'Click to hide' : 'Click to publish'}
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
                              {link.isVisible ? 'Active' : 'Hidden'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => toggleLinkVisibility(link)}
                              title={link.isVisible ? 'Hide' : 'Publish'}
                              className="hover:bg-accent"
                            >
                              {link.isVisible ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditLink(link)}
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
                                  type: 'link',
                                  id: link.id,
                                  title: link.title,
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
            {columns.length === 0
              ? 'Add your first column above to get started.'
              : 'Select a column tab to manage its links.'}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* Column Dialog                                  */}
      {/* ══════════════════════════════════════════════ */}
      <Dialog open={columnDialogOpen} onOpenChange={setColumnDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingColumn ? 'Edit column' : 'Add column'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={colForm.title}
                onChange={(e) => setColForm({ ...colForm, title: e.target.value })}
                placeholder="OUR ESSENCE"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  min={0}
                  value={colForm.sortOrder}
                  onChange={(e) =>
                    setColForm({ ...colForm, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Button
                  type="button"
                  variant={colForm.isVisible ? 'default' : 'secondary'}
                  className="w-full"
                  onClick={() => setColForm({ ...colForm, isVisible: !colForm.isVisible })}
                >
                  {colForm.isVisible ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Active
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" /> Hidden
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColumnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveColumn} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingColumn ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════ */}
      {/* Link Dialog                                    */}
      {/* ══════════════════════════════════════════════ */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Edit link' : 'Add link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Column</Label>
              <select
                className="h-9 w-full cursor-pointer rounded-md border border-border bg-background px-3 text-sm"
                value={linkForm.columnId}
                onChange={(e) => setLinkForm({ ...linkForm, columnId: e.target.value })}
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={linkForm.title}
                onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                placeholder="Our Story"
              />
            </div>
            <div className="space-y-2">
              <Label>URL / path</Label>
              <Input
                value={linkForm.href}
                onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                placeholder="/our-story"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  min={0}
                  value={linkForm.sortOrder}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Button
                  type="button"
                  variant={linkForm.isVisible ? 'default' : 'secondary'}
                  className="w-full"
                  onClick={() => setLinkForm({ ...linkForm, isVisible: !linkForm.isVisible })}
                >
                  {linkForm.isVisible ? 'Active' : 'Hidden'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveLink} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLink ? 'Save changes' : 'Create'}
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
            <DialogTitle>Delete {deleteTarget?.type}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <b>{deleteTarget?.title}</b>?
            {deleteTarget?.type === 'column' &&
              ' This will also delete all links inside this column.'}{' '}
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

      {/* Keep TS happy about unused setting state */}
      {setting ? null : null}
    </div>
  );
}

// ── StatCard ────────────────────────────────────────────────

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
