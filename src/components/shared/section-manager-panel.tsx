'use client';

// ==========================================================================
// SectionManagerPanel — reusable admin control to REORDER (drag) and SHOW/HIDE
// (toggle) a product page's sections. Order + visibility are stored in the DB
// (sortOrder / isActive), so the public page reflects changes with no code edit.
//
// Product-agnostic: pass the sections + two async callbacks. Used on each
// product's admin page above the section editors.
// ==========================================================================

import { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { toast } from 'sonner';
import { GripVertical, Eye, EyeOff, Loader2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ManagedSection {
  /** DB section key, e.g. "hero". */
  key: string;
  /** Human label shown in the panel, e.g. "Hero". */
  label: string;
  isActive: boolean;
}

export function SectionManagerPanel({
  sections,
  onReorder,
  onToggleActive,
}: {
  sections: ManagedSection[];
  /** Persist the new order (array of section keys). */
  onReorder: (orderedKeys: string[]) => Promise<{ success: boolean; error?: string }>;
  /** Persist a section's visibility. */
  onToggleActive: (
    key: string,
    isActive: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  }) {
  const [items, setItems] = useState<ManagedSection[]>(sections);
  const [busy, setBusy] = useState(false);

  // Drag-drop reorder → persist the new key order.
  const handleReorder = async (next: ManagedSection[]) => {
    setItems(next); // optimistic
    setBusy(true);
    const res = await onReorder(next.map((s) => s.key));
    setBusy(false);
    if (!res.success) {
      toast.error(res.error ?? 'Failed to save order');
      setItems(sections); // revert
    } else {
      toast.success('Section order saved.');
    }
  };

  const toggle = async (s: ManagedSection) => {
    const nextActive = !s.isActive;
    setItems((prev) => prev.map((it) => (it.key === s.key ? { ...it, isActive: nextActive } : it)));
    const res = await onToggleActive(s.key, nextActive);
    if (!res.success) {
      toast.error(res.error ?? 'Failed to update visibility');
      setItems((prev) => prev.map((it) => (it.key === s.key ? { ...it, isActive: s.isActive } : it)));
    } else {
      toast.success(nextActive ? `"${s.label}" is now visible.` : `"${s.label}" is now hidden.`);
    }
  };

  return (
    <div className="bg-card mb-6 rounded-xl border p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="bg-primary/10 text-primary inline-flex h-8 w-8 items-center justify-center rounded-md">
          <Layers className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-jost-bold text-base">Manage Sections</h2>
          <p className="text-muted-foreground text-xs">
            Drag to reorder, or hide a section from the public page. Changes apply
            live — no code edit needed.
          </p>
        </div>
        {busy && <Loader2 className="text-muted-foreground ml-auto h-4 w-4 animate-spin" />}
      </div>

      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-1.5">
        {items.map((s) => (
          <SectionRow key={s.key} section={s} onToggle={() => toggle(s)} />
        ))}
      </Reorder.Group>
    </div>
  );
}

function SectionRow({
  section,
  onToggle,
}: {
  section: ManagedSection;
  onToggle: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={controls}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-2.5',
        section.isActive ? 'bg-background border-border' : 'bg-muted/40 border-dashed',
      )}
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Drag to reorder"
        className="text-muted-foreground w-5 shrink-0 cursor-grab touch-none active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span
        className={cn(
          'flex-1 font-jost-medium text-sm',
          !section.isActive && 'text-muted-foreground line-through',
        )}
      >
        {section.label}
      </span>

      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-jost-medium transition',
          section.isActive
            ? 'bg-primary/15 text-primary hover:bg-primary/25'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        )}
        title={section.isActive ? 'Click to hide' : 'Click to show'}
      >
        {section.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        {section.isActive ? 'Visible' : 'Hidden'}
      </button>
    </Reorder.Item>
  );
}
