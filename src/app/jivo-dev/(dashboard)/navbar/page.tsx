'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Reorder, useDragControls } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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
  Layers,
  GripVertical,
  ChevronDown,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────

/** Turn a title into a URL slug: lowercase, spaces→hyphens, strip the rest. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // drop anything not a letter/number/space/hyphen
    .replace(/[\s_]+/g, '-') // spaces & underscores → single hyphen
    .replace(/-+/g, '-') // collapse repeats
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/** Base path for a parent nav link. Uses its href (e.g. "/products"), falling
 *  back to a slug of its title ("Our Essence" → "/our-essence"). Always returns
 *  a leading-slash path with no trailing slash. */
function parentBasePath(link: { href?: string | null; title: string } | undefined): string {
  if (!link) return '';
  const raw = link.href?.trim() || `/${slugify(link.title)}`;
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, '');
}

/** Compose the auto URL: parent base + "/" + slug(title). */
function autoHref(
  parent: { href?: string | null; title: string } | undefined,
  title: string,
): string {
  const base = parentBasePath(parent);
  const slug = slugify(title);
  if (!slug) return base;
  return `${base}/${slug}`;
}

// ── Types ─────────────────────────────────────────────────────

interface NavSubLinkRow {
  id: string;
  navLinkId: string;
  title: string;
  href: string;
  group: string | null;
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
    group: '',
    sortOrder: 0,
    isVisible: true,
  });
  // Once the admin edits the URL by hand, stop auto-filling it from the title so
  // we never clobber a deliberate custom path.
  const [hrefTouched, setHrefTouched] = useState(false);
  // Drag-reorder: true while a sub-link save from a drop is in flight.
  const [reordering, setReordering] = useState(false);
  // Inline "create a new group" box in the active-link panel. Typing a name and
  // hitting Add just registers the group locally so it appears in every row's
  // "move to group" dropdown — a link only actually joins it once assigned.
  const [newGroupName, setNewGroupName] = useState('');
  const [draftGroups, setDraftGroups] = useState<string[]>([]);
  // Group filter for the sub-links list: '' = All, '__none__' = ungrouped only,
  // otherwise a specific group name.
  const [groupFilter, setGroupFilter] = useState<string>('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'link'; id: string; title: string }
    | { type: 'sublink'; id: string; title: string }
    | null
  >(null);

  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchLinks().finally(() => setLoading(false));
  }, [fetchLinks]);

  const activeNavLink = links.find((l) => l.id === activeNavLinkId) ?? null;
  // Distinct group names already used in the active nav link — powers the Group
  // field's autocomplete so admins reuse the same groups instead of re-typing.
  const existingGroups = Array.from(
    new Set((activeNavLink?.subLinks ?? []).map((s) => s.group).filter((g): g is string => !!g)),
  );
  // All group names offered in each row's "move to" dropdown: those already in
  // use plus any freshly-typed drafts not yet assigned to a link.
  const allGroups = Array.from(new Set([...existingGroups, ...draftGroups]));
  // Show the per-row Group dropdown as soon as ANY group exists (assigned or a
  // fresh draft) so links can actually be moved into it. Otherwise it's a flat
  // list and the column stays hidden.
  const hasAnyGroup = allGroups.length > 0;
  const totalSubLinks = links.reduce((n, l) => n + l.subLinks.length, 0);
  const visibleCount = links.filter((l) => l.isVisible).length;

  // Switch the active link tab, clearing the local "new group" drafts so a draft
  // typed under one link doesn't leak into another.
  const selectNavLink = (id: string) => {
    setActiveNavLinkId(id);
    setDraftGroups([]);
    setNewGroupName('');
    setGroupFilter('');
  };

  // Register a freshly-typed group name as a draft so it shows in every row's
  // dropdown (and the filter) even before any link is assigned to it.
  const addDraftGroup = () => {
    const name = newGroupName.trim();
    if (!name) {
      toast.error('Type a group name first');
      return;
    }
    if (allGroups.includes(name)) {
      toast.info(`"${name}" already exists`);
      setGroupFilter(name);
      setNewGroupName('');
      return;
    }
    setDraftGroups((d) => [...d, name]);
    setGroupFilter(name); // jump the filter to the new group so it's obvious
    setNewGroupName('');
    toast.success(`Group "${name}" added — assign links to it via their Group dropdown`);
  };

  // Sub-links shown after applying the group filter. Only the full (unfiltered)
  // list is drag-reorderable — filtering to a subset would make drop order
  // ambiguous, so drag is disabled while a filter is active.
  const filteredSubLinks = (activeNavLink?.subLinks ?? []).filter((s) => {
    if (groupFilter === '') return true;
    if (groupFilter === '__none__') return !s.group;
    return s.group === groupFilter;
  });

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
      group: '',
      sortOrder: activeNavLink.subLinks.length,
      isVisible: true,
    });
    setHrefTouched(false); // fresh form → auto-fill URL from title
    setError('');
    setSubLinkDialogOpen(true);
  };

  const openEditSubLink = (sub: NavSubLinkRow) => {
    setEditingSubLink(sub);
    setSubLinkForm({
      navLinkId: sub.navLinkId,
      title: sub.title,
      href: sub.href,
      group: sub.group ?? '',
      sortOrder: sub.sortOrder,
      isVisible: sub.isVisible,
    });
    // Existing rows already have a URL — treat it as intentional so editing the
    // title doesn't silently rewrite an established path.
    setHrefTouched(true);
    setError('');
    setSubLinkDialogOpen(true);
  };

  // Update the title and, unless the admin has hand-edited the URL, regenerate
  // the href as parentBase + slug(title).
  const onSubLinkTitleChange = (title: string) => {
    setSubLinkForm((f) => {
      const parent = links.find((l) => l.id === f.navLinkId);
      return { ...f, title, href: hrefTouched ? f.href : autoHref(parent, title) };
    });
  };

  // Changing the parent re-bases the auto URL too (keeps the same title slug).
  const onSubLinkParentChange = (navLinkId: string) => {
    setSubLinkForm((f) => {
      const parent = links.find((l) => l.id === navLinkId);
      return { ...f, navLinkId, href: hrefTouched ? f.href : autoHref(parent, f.title) };
    });
  };

  // ── Sub-link drag reorder ─────────────────────────────────
  // framer-motion Reorder hands back the full array in its new order; persist
  // that order to the server, then refresh so sortOrder badges update.
  const handleReorderSubLinks = async (reordered: NavSubLinkRow[]) => {
    if (!activeNavLink) return;
    // Optimistic: reflect the new order immediately in the active link.
    setLinks((prev) =>
      prev.map((l) =>
        l.id === activeNavLink.id
          ? { ...l, subLinks: reordered.map((s, i) => ({ ...s, sortOrder: i })) }
          : l,
      ),
    );
    setReordering(true);
    try {
      const res = await fetch('/api/navbar/sublinks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navLinkId: activeNavLink.id,
          orderedIds: reordered.map((s) => s.id),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error ?? 'Failed to save new order');
        await fetchLinks(); // revert to server truth
      } else {
        router.refresh();
      }
    } catch {
      toast.error('Network error while reordering');
      await fetchLinks();
    } finally {
      setReordering(false);
    }
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

  // Move a sub-link into a group (or ungroup with null) in one click, without
  // opening the edit dialog. Sends only the `group` field via the update schema.
  const setSubLinkGroup = async (sub: NavSubLinkRow, group: string | null) => {
    // Optimistic update so the row jumps into its new section immediately.
    setLinks((prev) =>
      prev.map((l) =>
        l.id === sub.navLinkId
          ? { ...l, subLinks: l.subLinks.map((s) => (s.id === sub.id ? { ...s, group } : s)) }
          : l,
      ),
    );
    try {
      const res = await fetch(`/api/navbar/sublinks/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(group ? `Moved to "${group}"` : 'Removed from group');
        await fetchLinks();
        router.refresh();
      } else {
        toast.error(data.error ?? 'Update failed');
        await fetchLinks();
      }
    } catch {
      toast.error('Network error');
      await fetchLinks();
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
    <div className="mx-auto w-full max-w-[1800px] space-y-6 2xl:space-y-8">
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
                  onClick={() => selectNavLink(link.id)}
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

            {/* Group toolbar — create a group by typing its name; then use each
                row's "Group" dropdown to move links into it. Filter to show only
                one group's links. A group only "exists" on the public site once
                a link is assigned to it. */}
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-muted/20 px-3 py-2.5">
              {/* Label + all filter chips share one line on the left. */}
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-jost-bold uppercase tracking-wide text-muted-foreground">
                <Layers className="h-3.5 w-3.5" /> Groups
              </span>

              {allGroups.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  None yet — type a name to create one.
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGroupFilter('')}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                      groupFilter === ''
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    All
                  </button>
                  {allGroups.map((g) => {
                    const count = activeNavLink.subLinks.filter((s) => s.group === g).length;
                    const active = groupFilter === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGroupFilter(active ? '' : g)}
                        className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : count > 0
                              ? 'border-primary/30 bg-primary/10 text-primary hover:border-primary/50'
                              : 'border-dashed border-border text-muted-foreground hover:border-muted-foreground'
                        }`}
                      >
                        {g} · {count}
                        {count === 0 && ' (empty)'}
                      </button>
                    );
                  })}
                  {(() => {
                    const ungrouped = activeNavLink.subLinks.filter((s) => !s.group).length;
                    if (ungrouped === 0) return null;
                    const active = groupFilter === '__none__';
                    return (
                      <button
                        type="button"
                        onClick={() => setGroupFilter(active ? '' : '__none__')}
                        className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        Ungrouped · {ungrouped}
                      </button>
                    );
                  })()}
                </div>
              )}

              {/* Create control stays on the same line, pushed to the right. */}
              <div className="ml-auto flex flex-1 items-center gap-1.5 sm:max-w-sm">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDraftGroup();
                    }
                  }}
                  placeholder="New group name…"
                  className="h-9 flex-1 text-sm"
                  maxLength={80}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-9 shrink-0 gap-1"
                  disabled={!newGroupName.trim()}
                  onClick={addDraftGroup}
                >
                  <Plus className="h-3.5 w-3.5" /> Add group
                </Button>
              </div>
            </div>

            {/* Sub-links — drag to reorder. framer-motion Reorder replaces the
                table so each row can be a draggable item; a grip handle starts
                the drag so button clicks inside the row still work. */}
            <div className="overflow-hidden rounded-lg border">
              {/* Header row (matches the old table columns) */}
              <div className="flex items-center gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-jost-medium text-muted-foreground">
                <span className="w-5" />
                <span className="w-12">Order</span>
                <span className="flex-1">Title</span>
                <span className="hidden flex-1 sm:block">URL</span>
                {hasAnyGroup && <span className="w-40">Group</span>}
                <span className="w-24">Status</span>
                <span className="w-28 text-right">Actions</span>
              </div>

              {activeNavLink.subLinks.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No sub-links yet. Click <b>Add Sub-Link</b> to create one.
                </div>
              ) : filteredSubLinks.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No links in this group yet. Set a link&apos;s <b>Group</b> to move it here.
                </div>
              ) : groupFilter === '' ? (
                // Unfiltered → full drag-reorderable list.
                <Reorder.Group
                  axis="y"
                  values={activeNavLink.subLinks}
                  onReorder={handleReorderSubLinks}
                  className="divide-y"
                >
                  {activeNavLink.subLinks.map((sub) => (
                    <SubLinkRow
                      key={sub.id}
                      sub={sub}
                      showGroup={hasAnyGroup}
                      groups={allGroups}
                      onSetGroup={(g) => setSubLinkGroup(sub, g)}
                      onToggle={() => toggleSubLinkVisibility(sub)}
                      onEdit={() => openEditSubLink(sub)}
                      onDelete={() =>
                        setDeleteTarget({ type: 'sublink', id: sub.id, title: sub.title })
                      }
                    />
                  ))}
                </Reorder.Group>
              ) : (
                // Filtered → static (non-draggable) subset; reordering a subset
                // would be ambiguous against the full sortOrder.
                <div className="divide-y">
                  {filteredSubLinks.map((sub) => (
                    <SubLinkRow
                      key={sub.id}
                      sub={sub}
                      showGroup={hasAnyGroup}
                      groups={allGroups}
                      draggable={false}
                      onSetGroup={(g) => setSubLinkGroup(sub, g)}
                      onToggle={() => toggleSubLinkVisibility(sub)}
                      onEdit={() => openEditSubLink(sub)}
                      onDelete={() =>
                        setDeleteTarget({ type: 'sublink', id: sub.id, title: sub.title })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
            {activeNavLink.subLinks.length > 1 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {reordering
                  ? 'Saving new order…'
                  : groupFilter !== ''
                    ? 'Filtered view — clear the filter (pick “All”) to drag-reorder links.'
                    : 'Tip: drag the ⠿ handle to reorder. Use a row’s Group dropdown to move it into a group.'}
              </p>
            )}
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
                onChange={(e) => onSubLinkParentChange(e.target.value)}
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
                onChange={(e) => onSubLinkTitleChange(e.target.value)}
                placeholder="e.g. The Story / Journey"
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label>URL / path</Label>
              <Input
                value={subLinkForm.href}
                onChange={(e) => {
                  setHrefTouched(true); // manual edit → stop auto-fill
                  setSubLinkForm({ ...subLinkForm, href: e.target.value });
                }}
                placeholder="/our-essence/story"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">
                Auto-filled from the parent link and title (spaces become hyphens,
                lowercased). Edit it here to override.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Group (optional)</Label>
              <Input
                list="navsublink-groups"
                value={subLinkForm.group}
                onChange={(e) => setSubLinkForm({ ...subLinkForm, group: e.target.value })}
                placeholder="e.g. Healthy Oils"
                maxLength={80}
              />
              <datalist id="navsublink-groups">
                {existingGroups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Groups this link under a sub-heading in the dropdown (e.g. Healthy
                Oils / Beverages / Staples). Leave blank for a flat link.
              </p>
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

// ── Draggable sub-link row ────────────────────────────────────
// One Reorder.Item per sub-link. Dragging is restricted to the grip handle
// (useDragControls + dragListener={false}) so the Eye/Edit/Delete buttons stay
// clickable without accidentally starting a drag.
function SubLinkRow({
  sub,
  showGroup,
  groups,
  draggable = true,
  onSetGroup,
  onToggle,
  onEdit,
  onDelete,
}: {
  sub: NavSubLinkRow;
  showGroup: boolean;
  groups: string[];
  draggable?: boolean;
  onSetGroup: (group: string | null) => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();
  // A group in use elsewhere but not this row still needs to appear as an option
  // (plus this row's own group, in case it was hidden by a stale drop).
  const options = Array.from(new Set([...groups, ...(sub.group ? [sub.group] : [])]));

  const inner = (
    <>
      {/* Drag handle — inert (dimmed) when the list is filtered and can't reorder. */}
      {draggable ? (
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          aria-label="Drag to reorder"
          className="w-5 shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : (
        <span className="w-5 shrink-0 text-muted-foreground/30">
          <GripVertical className="h-4 w-4" />
        </span>
      )}

      <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
        #{sub.sortOrder}
      </span>
      <span className="flex-1 truncate font-jost-medium">{sub.title}</span>
      <span className="hidden flex-1 truncate text-xs text-muted-foreground sm:block">
        {sub.href}
      </span>

      {showGroup && (
        <span className="w-40 shrink-0">
          <div className="relative">
            <select
              value={sub.group ?? ''}
              onChange={(e) => onSetGroup(e.target.value || null)}
              className="h-8 w-full cursor-pointer appearance-none rounded-md border border-border bg-background px-2.5 pr-7 text-xs text-foreground transition hover:border-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
              title="Move this link into a group"
            >
              <option value="">— No group —</option>
              {options.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </span>
      )}

      <span className="w-24 shrink-0">
        <button
          onClick={onToggle}
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
      </span>

      <div className="flex w-28 shrink-0 items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          title={sub.isVisible ? 'Hide' : 'Publish'}
          className="hover:bg-accent"
        >
          {sub.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          title="Edit"
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          title="Delete"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );

  const rowClass = 'flex items-center gap-3 bg-card px-3 py-2.5 text-sm';

  // Draggable rows must live inside the Reorder.Group as Reorder.Items; the
  // filtered (static) list renders the same content in a plain div instead.
  if (!draggable) {
    return <div className={rowClass}>{inner}</div>;
  }
  return (
    <Reorder.Item
      value={sub}
      dragListener={false}
      dragControls={controls}
      className={rowClass}
    >
      {inner}
    </Reorder.Item>
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
