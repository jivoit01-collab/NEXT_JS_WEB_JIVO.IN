'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUpload, SafeImage } from '@/components/shared/admin';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Home,
  Layers,
  X,
  Search,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Save,
} from 'lucide-react';
import { SeoTabPanel } from '@/modules/seo';
import {
  defaultSeo as homeDefaultSeo,
  reorderHomeSectionsAction,
  setHomeSectionActiveAction,
} from '@/modules/home';
import { SectionManagerPanel, type ManagedSection } from '@/components/shared/section-manager-panel';

// ── Types ─────────────────────────────────────────────────────

interface HomeSection {
  id: string;
  section: string;
  title: string | null;
  content: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
}

interface HeroSlide {
  id: string;
  backgroundImage: string;
  headline: string;
  subtitle: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
}

type SectionKey =
  | 'hero'
  | 'categories'
  | 'vision_mission'
  | 'products_foundation'
  | 'why_jivo';

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: 'Hero Section',
  categories: 'Product Categories',
  vision_mission: 'Vision & Mission',
  products_foundation: 'Products Foundation',
  why_jivo: 'Why Jivo',
};

const SECTION_ORDER: SectionKey[] = [
  'hero',
  'categories',
  'vision_mission',
  'products_foundation',
  'why_jivo',
];

// ── Default templates (for create flow) ───────────────────────

function getDefaultContent(section: SectionKey): Record<string, unknown> {
  switch (section) {
    case 'hero':
      return {
        logo: '',
        backgroundImage: '',
        headline: '',
        subtitle: '',
      };
    case 'categories':
      return {
        heading: 'MADE FOR EVERYDAY LOVE',
        items: [{ name: '', image: '', href: '', bgColor: 'bg-jivo-green' }],
      };
    case 'vision_mission':
      return {
        backgroundImage: '',
        heading: '',
        subtitle: '',
        intro: '',
        vision: '',
        mission: '',
      };
    case 'products_foundation':
      return {
        productImage: '',
        section1: { heading: '', paragraphs: [''] },
        section2: { heading: '', paragraphs: [''] },
      };
    case 'why_jivo':
      return {
        heading: '',
        subheading: '',
        leftText: '',
        rightParagraphs: [''],
        valuePillars: [{ image: '', title: '', description: '' }],
      };
    default:
      return {};
  }
}

// ── Page ──────────────────────────────────────────────────────

export default function AdminHomePageManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Inline section tabs (edit each section in a tab, no dialog) ──
  const [activeSectionTab, setActiveSectionTab] = useState<SectionKey>('hero');
  // Live-edited content per section, keyed by section key. Seeded from the DB
  // rows (or defaults for sections not yet created).
  const [sectionContent, setSectionContent] = useState<Record<SectionKey, Record<string, unknown>>>(
    {} as Record<SectionKey, Record<string, unknown>>,
  );
  const [savingSection, setSavingSection] = useState(false);

  // ── Hero Slides state ──────────────────────────
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [deleteSlideDialogOpen, setDeleteSlideDialogOpen] = useState(false);
  const [deletingSlideId, setDeletingSlideId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState({
    backgroundImage: '',
    headline: '',
    subtitle: '',
    sortOrder: 0,
    isActive: true,
  });
  const [slideSaving, setSlideSaving] = useState(false);
  const [slideError, setSlideError] = useState('');

  const fetchSections = useCallback(async () => {
    try {
      const res = await fetch('/api/home?all=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setSections(data.data);
        // Seed the inline editor content for every known section (DB content or
        // defaults for sections not yet created).
        const byKey: Record<string, HomeSection> = {};
        for (const s of data.data as HomeSection[]) byKey[s.section] = s;
        const seeded = {} as Record<SectionKey, Record<string, unknown>>;
        for (const key of SECTION_ORDER) {
          seeded[key] = byKey[key]?.content ?? getDefaultContent(key);
        }
        setSectionContent(seeded);
      } else {
        toast.error(data.error ?? 'Failed to load sections');
      }
    } catch {
      toast.error('Failed to load home sections');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save the currently-open section tab (create if it doesn't exist yet).
  const saveSectionTab = async () => {
    setSavingSection(true);
    try {
      const key = activeSectionTab;
      const existing = sections.find((s) => s.section === key);
      const content = sectionContent[key] ?? getDefaultContent(key);
      const url = existing ? `/api/home/${existing.id}` : '/api/home';
      const method = existing ? 'PUT' : 'POST';
      const body = existing
        ? { content }
        : { section: key, content, sortOrder: SECTION_ORDER.indexOf(key), isActive: true };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error ?? 'Failed to save');
        return;
      }
      toast.success(`${SECTION_LABELS[key]} saved`);
      await fetchSections();
    } catch {
      toast.error('Network error');
    } finally {
      setSavingSection(false);
    }
  };

  const fetchSlides = useCallback(async () => {
    try {
      const res = await fetch('/api/hero-slides?all=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setHeroSlides(data.data);
    } catch {
      toast.error('Failed to load hero slides');
    }
  }, []);

  useEffect(() => {
    fetchSections();
    fetchSlides();
  }, [fetchSections, fetchSlides]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/home/${deletingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Section deleted');
        setDeleteDialogOpen(false);
        setDeletingId(null);
        await fetchSections();
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

  // ── Hero Slide handlers ─────────────────────
  const openCreateSlide = () => {
    setEditingSlide(null);
    // Sort order starts at 1 — hero section (Sections tab) is slide 0
    const maxOrder = heroSlides.reduce((max, s) => Math.max(max, s.sortOrder), 0);
    setSlideForm({
      backgroundImage: '',
      headline: '',
      subtitle: '',
      sortOrder: maxOrder + 1,
      isActive: true,
    });
    setSlideError('');
    setSlideDialogOpen(true);
  };

  const openEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideForm({
      backgroundImage: slide.backgroundImage,
      headline: slide.headline,
      subtitle: slide.subtitle,
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    });
    setSlideError('');
    setSlideDialogOpen(true);
  };

  const handleSaveSlide = async () => {
    setSlideSaving(true);
    setSlideError('');
    try {
      const isEdit = !!editingSlide;
      const url = isEdit ? `/api/hero-slides/${editingSlide.id}` : '/api/hero-slides';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slideForm),
      });
      const data = await res.json();
      if (!data.success) {
        setSlideError(data.error ?? 'Something went wrong');
        toast.error(data.error ?? 'Failed to save slide');
        return;
      }
      toast.success(`Slide ${isEdit ? 'updated' : 'created'}`);
      setSlideDialogOpen(false);
      await fetchSlides();
      router.refresh();
    } catch {
      toast.error('Network error');
    } finally {
      setSlideSaving(false);
    }
  };

  const handleDeleteSlide = async () => {
    if (!deletingSlideId) return;
    setSlideSaving(true);
    try {
      const res = await fetch(`/api/hero-slides/${deletingSlideId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Slide deleted');
        setDeleteSlideDialogOpen(false);
        setDeletingSlideId(null);
        await fetchSlides();
        router.refresh();
      } else {
        toast.error(data.error ?? 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSlideSaving(false);
    }
  };

  const toggleSlideActive = async (slide: HeroSlide) => {
    try {
      const res = await fetch(`/api/hero-slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Slide ${slide.isActive ? 'hidden' : 'published'}`);
        await fetchSlides();
        router.refresh();
      }
    } catch {
      toast.error('Network error');
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const newSlides = [...heroSlides];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newSlides.length) return;
    [newSlides[index], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[index]];
    const ids = newSlides.map((s) => s.id);
    try {
      const res = await fetch('/api/hero-slides/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSlides();
        router.refresh();
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
    <div className="mx-auto w-full max-w-[1800px] space-y-6 2xl:space-y-8">
      {/* ── Header ──────────────────────────── */}
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-jost-bold uppercase tracking-widest text-primary">
          <Home className="h-3.5 w-3.5" /> Home Page
        </div>
        <h1 className="text-2xl font-jost-bold tracking-tight md:text-3xl 2xl:text-4xl">
          Home Page Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage every visual section on the public home page.
        </p>
      </div>

      {/* ── Top-level Tabs (Sections / Hero Carousel / SEO) ──
          Styled like the product/essence pages: an underline tab row on a card,
          active tab = green (primary) with a bottom border. */}
      <Tabs defaultValue={searchParams.get('tab') === 'seo' ? 'seo' : 'sections'} className="space-y-6">
        <TabsList className="bg-card flex h-auto w-full justify-start gap-0 overflow-x-auto rounded-lg border p-0">
          <TabsTrigger
            value="sections"
            className="data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-jost-medium whitespace-nowrap shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none 2xl:px-6 2xl:py-4 2xl:text-base"
          >
            <Layers className="h-4 w-4" /> Sections
          </TabsTrigger>
          <TabsTrigger
            value="hero-carousel"
            className="data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-jost-medium whitespace-nowrap shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none 2xl:px-6 2xl:py-4 2xl:text-base"
          >
            <ImageIcon className="h-4 w-4" /> Hero Carousel
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-jost-medium whitespace-nowrap shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none 2xl:px-6 2xl:py-4 2xl:text-base"
          >
            <Search className="h-4 w-4" /> SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-6">

      {/* ── Manage Sections — drag-reorder + show/hide (same as other pages) ── */}
      {sections.length > 0 && (
        <SectionManagerPanel
          sections={sections.map(
            (s): ManagedSection => ({
              key: s.section,
              label: SECTION_LABELS[s.section as SectionKey] ?? s.title ?? s.section,
              isActive: s.isActive,
            }),
          )}
          onReorder={async (orderedKeys) => {
            const res = await reorderHomeSectionsAction(orderedKeys);
            if (res.success) await fetchSections();
            return { success: res.success, error: res.success ? undefined : res.error };
          }}
          onToggleActive={async (key, isActive) => {
            const res = await setHomeSectionActiveAction(key, isActive);
            if (res.success) await fetchSections();
            return { success: res.success, error: res.success ? undefined : res.error };
          }}
        />
      )}

      {/* ── Section content tabs — edit each section inline (no dialog) ── */}
      <div className="rounded-lg border bg-card">
        <div className="flex overflow-x-auto border-b">
          {SECTION_ORDER.map((key) => (
            <button
              key={key}
              onClick={() => setActiveSectionTab(key)}
              className={`whitespace-nowrap px-3 py-2.5 text-sm font-jost-medium transition-colors sm:px-4 sm:py-3 sm:text-base 2xl:px-6 2xl:py-4 2xl:text-lg ${
                activeSectionTab === key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
        </div>

        <div className="space-y-5 p-4 sm:p-6 2xl:p-8">
          {(() => {
            const key = activeSectionTab;
            const content = sectionContent[key] ?? getDefaultContent(key);
            const onChange = (next: Record<string, unknown>) =>
              setSectionContent((prev) => ({ ...prev, [key]: next }));
            return (
              <>
                {key === 'hero' && <HeroEditor content={content} onChange={onChange} />}
                {key === 'categories' && <CategoriesEditor content={content} onChange={onChange} />}
                {key === 'vision_mission' && (
                  <VisionMissionEditor content={content} onChange={onChange} />
                )}
                {key === 'products_foundation' && (
                  <ProductsFoundationEditor content={content} onChange={onChange} />
                )}
                {key === 'why_jivo' && <WhyJivoEditor content={content} onChange={onChange} />}
              </>
            );
          })()}

          <div className="flex justify-end border-t pt-4">
            <Button onClick={saveSectionTab} disabled={savingSection} className="gap-2">
              {savingSection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation ────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete section?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            The public home page will fall back to its default content for this section.
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        </TabsContent>

        {/* ── Hero Carousel Tab ─────────────────── */}
        <TabsContent value="hero-carousel" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-jost-bold">Hero Carousel Slides</h2>
              <p className="text-sm text-muted-foreground">
                The first slide (sort order 0) is the <strong>Hero Section</strong> from the Sections tab.
                Additional slides below rotate after it in the carousel.
              </p>
            </div>
            <Button onClick={openCreateSlide} className="gap-2">
              <Plus className="h-4 w-4" /> Add slide
            </Button>
          </div>

          {/* Hero section = slide 0 indicator */}
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-jost-bold text-primary">
              #0
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-jost-medium">Hero Section <span className="text-xs font-jost-regular text-muted-foreground">(default first slide)</span></p>
              <p className="text-sm text-muted-foreground">
                Edit from the <strong>Sections</strong> tab &rarr; Hero section. Background image, headline &amp; subtitle from there become slide #0.
              </p>
            </div>
          </div>

          {heroSlides.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-jost-medium">No carousel slides yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your first slide to enable the hero carousel.
              </p>
              <Button onClick={openCreateSlide} className="mt-4 gap-2" size="sm">
                <Plus className="h-3.5 w-3.5" /> Add first slide
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
                >
                  {/* Order controls */}
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveSlide(index, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs font-mono text-muted-foreground">
                      #{slide.sortOrder}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveSlide(index, 'down')}
                      disabled={index === heroSlides.length - 1}
                      className="h-6 w-6"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {slide.backgroundImage ? (
                      <SafeImage
                        src={slide.backgroundImage}
                        alt={slide.headline}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-jost-medium">{slide.headline || 'Untitled slide'}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {slide.subtitle || 'No subtitle'}
                    </p>
                  </div>

                  {/* Status */}
                  <button onClick={() => toggleSlideActive(slide)} className="cursor-pointer">
                    <Badge
                      variant={slide.isActive ? 'default' : 'secondary'}
                      className={
                        slide.isActive
                          ? 'bg-primary/15 text-primary hover:bg-primary/25'
                          : 'hover:bg-secondary/80'
                      }
                    >
                      <span
                        className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                          slide.isActive ? 'bg-primary' : 'bg-muted-foreground'
                        }`}
                      />
                      {slide.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditSlide(slide)}
                      className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setDeletingSlideId(slide.id);
                        setDeleteSlideDialogOpen(true);
                      }}
                      className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Slide Create/Edit Dialog */}
          <Dialog open={slideDialogOpen} onOpenChange={setSlideDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {editingSlide ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                  {editingSlide ? 'Edit slide' : 'Add new slide'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <div className="space-y-2">
                  <Label>Background image</Label>
                  <ImageUpload
                    value={slideForm.backgroundImage}
                    onChange={(url) => setSlideForm((f) => ({ ...f, backgroundImage: url }))}
                    onRemove={() => setSlideForm((f) => ({ ...f, backgroundImage: '' }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input
                    value={slideForm.headline}
                    onChange={(e) => setSlideForm((f) => ({ ...f, headline: e.target.value }))}
                    placeholder="LET NATURE RECLAIM YOU"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Textarea
                    value={slideForm.subtitle}
                    onChange={(e) => setSlideForm((f) => ({ ...f, subtitle: e.target.value }))}
                    rows={2}
                    placeholder="A short description for this slide..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sort order</Label>
                    <Input
                      type="number"
                      min={0}
                      value={slideForm.sortOrder}
                      onChange={(e) =>
                        setSlideForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Visibility</Label>
                    <Button
                      type="button"
                      variant={slideForm.isActive ? 'default' : 'secondary'}
                      className="w-full"
                      onClick={() => setSlideForm((f) => ({ ...f, isActive: !f.isActive }))}
                    >
                      {slideForm.isActive ? (
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

                {slideError && (
                  <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <X className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{slideError}</span>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSlideDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSlide} disabled={slideSaving} className="min-w-28">
                  {slideSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingSlide ? (
                    'Save changes'
                  ) : (
                    'Create slide'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Slide Delete Confirmation */}
          <Dialog open={deleteSlideDialogOpen} onOpenChange={setDeleteSlideDialogOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete slide?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                This slide will be removed from the hero carousel. This cannot be undone.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteSlideDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteSlide} disabled={slideSaving}>
                  {slideSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Yes, delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── SEO Tab ─────────────────────────── */}
        <TabsContent value="seo">
          <SeoTabPanel
            page="home"
            pageLabel="Home Page"
            moduleDefault={homeDefaultSeo}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Section Editors ───────────────────────────────────────────

interface EditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

function field(content: Record<string, unknown>, key: string): string {
  return (content[key] as string) ?? '';
}

function HeroEditor({ content, onChange }: EditorProps) {
  const set = (key: string, value: string) => onChange({ ...content, [key]: value });
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Logo image</Label>
          <ImageUpload
            value={field(content, 'logo')}
            onChange={(url) => set('logo', url)}
            onRemove={() => set('logo', '')}
          />
        </div>
        <div className="space-y-2">
          <Label>Background image</Label>
          <ImageUpload
            value={field(content, 'backgroundImage')}
            onChange={(url) => set('backgroundImage', url)}
            onRemove={() => set('backgroundImage', '')}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={field(content, 'headline')}
          onChange={(e) => set('headline', e.target.value)}
          placeholder="LET NATURE RECLAIM YOU"
        />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Textarea
          value={field(content, 'subtitle')}
          onChange={(e) => set('subtitle', e.target.value)}
          rows={2}
          placeholder="The Heartbeat of Jivo — pure, honest products…"
        />
      </div>
    </div>
  );
}

function CategoriesEditor({ content, onChange }: EditorProps) {
  const heading = field(content, 'heading');
  const items =
    (content.items as Array<{ name: string; image: string; href: string; bgColor: string }>) ??
    [];

  const setHeading = (v: string) => onChange({ ...content, heading: v });
  const updateItem = (index: number, key: string, value: string) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    onChange({ ...content, items: updated });
  };
  const addItem = () =>
    onChange({
      ...content,
      items: [...items, { name: '', image: '', href: '', bgColor: 'bg-jivo-green' }],
    });
  const removeItem = (index: number) =>
    onChange({ ...content, items: items.filter((_, i) => i !== index) });

  const COLOR_OPTIONS = [
    { label: 'Green', value: 'bg-jivo-green' },
    { label: 'Sage', value: 'bg-jivo-sage' },
    { label: 'Blue', value: 'bg-jivo-blue' },
    { label: 'Maroon', value: 'bg-jivo-maroon' },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section heading</Label>
        <Input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="MADE FOR EVERYDAY LOVE"
        />
      </div>

      <Label>Category items</Label>
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-jost-medium">Category #{index + 1}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeItem(index)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="Cooking Oil"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Link</Label>
              <Input
                value={item.href}
                onChange={(e) => updateItem(index, 'href', e.target.value)}
                placeholder="/products?category=cooking-oil"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Card color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => updateItem(index, 'bgColor', c.value)}
                  className={`cursor-pointer rounded-md border px-3 py-1 text-xs font-jost-medium transition ${
                    item.bgColor === c.value
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <span className={`mr-1.5 inline-block h-3 w-3 rounded-full ${c.value}`} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Image</Label>
            <ImageUpload
              value={item.image}
              onChange={(url) => updateItem(index, 'image', url)}
              onRemove={() => updateItem(index, 'image', '')}
            />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="gap-2">
        <Plus className="h-3.5 w-3.5" /> Add category
      </Button>
    </div>
  );
}

function VisionMissionEditor({ content, onChange }: EditorProps) {
  const set = (key: string, value: string) => onChange({ ...content, [key]: value });
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Background image</Label>
        <ImageUpload
          value={field(content, 'backgroundImage')}
          onChange={(url) => set('backgroundImage', url)}
          onRemove={() => set('backgroundImage', '')}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Heading</Label>
          <Input
            value={field(content, 'heading')}
            onChange={(e) => set('heading', e.target.value)}
            placeholder="LET NATURE RECLAIM YOU"
          />
        </div>
        <div className="space-y-2">
          <Label>Subtitle</Label>
          <Input
            value={field(content, 'subtitle')}
            onChange={(e) => set('subtitle', e.target.value)}
            placeholder="Our foundation is truth, our motive is service."
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          Intro paragraph{' '}
          <span className="text-xs font-jost-regular text-muted-foreground">
            (optional — shown between subtitle and Vision/Mission columns)
          </span>
        </Label>
        <Textarea
          value={field(content, 'intro')}
          onChange={(e) => set('intro', e.target.value)}
          rows={3}
          placeholder="Jivo exists to prove that business can be a pure expression of service…"
        />
      </div>
      <div className="space-y-2">
        <Label>
          Intro paragraph 2{' '}
          <span className="text-xs font-jost-regular text-muted-foreground">
            (optional — second paragraph below the first intro)
          </span>
        </Label>
        <Textarea
          value={field(content, 'intro2')}
          onChange={(e) => set('intro2', e.target.value)}
          rows={3}
          placeholder="Our story begins with our founding father…"
        />
      </div>
      <div className="space-y-2">
        <Label>Vision text</Label>
        <Textarea
          value={field(content, 'vision')}
          onChange={(e) => set('vision', e.target.value)}
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label>Mission text</Label>
        <Textarea
          value={field(content, 'mission')}
          onChange={(e) => set('mission', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}

function ProductsFoundationEditor({ content, onChange }: EditorProps) {
  const section1 =
    (content.section1 as { heading: string; paragraphs: string[] }) ?? {
      heading: '',
      paragraphs: [''],
    };
  const section2 =
    (content.section2 as { heading: string; paragraphs: string[] }) ?? {
      heading: '',
      paragraphs: [''],
    };

  const updateSection = (key: 'section1' | 'section2', fieldKey: string, value: unknown) => {
    const current = key === 'section1' ? section1 : section2;
    onChange({ ...content, [key]: { ...current, [fieldKey]: value } });
  };
  const updateParagraph = (key: 'section1' | 'section2', index: number, value: string) => {
    const current = key === 'section1' ? section1 : section2;
    updateSection(
      key,
      'paragraphs',
      current.paragraphs.map((p, i) => (i === index ? value : p)),
    );
  };
  const addParagraph = (key: 'section1' | 'section2') => {
    const current = key === 'section1' ? section1 : section2;
    updateSection(key, 'paragraphs', [...current.paragraphs, '']);
  };
  const removeParagraph = (key: 'section1' | 'section2', index: number) => {
    const current = key === 'section1' ? section1 : section2;
    updateSection(
      key,
      'paragraphs',
      current.paragraphs.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Product image</Label>
        <ImageUpload
          value={field(content, 'productImage')}
          onChange={(url) => onChange({ ...content, productImage: url })}
          onRemove={() => onChange({ ...content, productImage: '' })}
        />
      </div>

      <Tabs defaultValue="section1">
        <TabsList className="w-full">
          <TabsTrigger value="section1" className="flex-1 cursor-pointer">
            Section 1
          </TabsTrigger>
          <TabsTrigger value="section2" className="flex-1 cursor-pointer">
            Section 2
          </TabsTrigger>
        </TabsList>

        {(['section1', 'section2'] as const).map((key) => {
          const current = key === 'section1' ? section1 : section2;
          return (
            <TabsContent key={key} value={key} className="space-y-3 pt-3">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  value={current.heading}
                  onChange={(e) => updateSection(key, 'heading', e.target.value)}
                />
              </div>
              <Label>Paragraphs</Label>
              {current.paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea
                    value={p}
                    onChange={(e) => updateParagraph(key, i, e.target.value)}
                    rows={3}
                    className="flex-1"
                  />
                  {current.paragraphs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeParagraph(key, i)}
                      className="shrink-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addParagraph(key)}
                className="gap-2"
              >
                <Plus className="h-3.5 w-3.5" /> Add paragraph
              </Button>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function WhyJivoEditor({ content, onChange }: EditorProps) {
  const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
  const rightParagraphs = (content.rightParagraphs as string[]) ?? [''];

  // Normalize incoming pillars — strip any legacy `icon` field and ensure `image` exists
  const rawPillars =
    (content.valuePillars as Array<Record<string, unknown>>) ?? [];
  const valuePillars: Array<{ image: string; title: string; description: string }> =
    rawPillars.map((p) => ({
      image: (p.image as string) ?? '',
      title: (p.title as string) ?? '',
      description: (p.description as string) ?? '',
    }));

  const [activePillarIdx, setActivePillarIdx] = useState(0);
  const safeIdx = Math.min(activePillarIdx, Math.max(0, valuePillars.length - 1));
  const activePillar = valuePillars[safeIdx];

  const updatePillar = (
    idx: number,
    key: 'image' | 'title' | 'description',
    value: string,
  ) => {
    set(
      'valuePillars',
      valuePillars.map((p, i) => (i === idx ? { ...p, [key]: value } : p)),
    );
  };

  const addPillar = () => {
    set('valuePillars', [
      ...valuePillars,
      { image: '', title: '', description: '' },
    ]);
    setActivePillarIdx(valuePillars.length);
  };

  const removePillar = (idx: number) => {
    const next = valuePillars.filter((_, i) => i !== idx);
    set('valuePillars', next);
    setActivePillarIdx(Math.max(0, Math.min(idx, next.length - 1)));
  };

  return (
    <div className="space-y-5">
      {/* ── Text content ─────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Heading</Label>
          <Input
            value={field(content, 'heading')}
            onChange={(e) => set('heading', e.target.value)}
            placeholder="SO, WHY JIVO EXACTLY?"
          />
        </div>
        <div className="space-y-2">
          <Label>Subheading</Label>
          <Input
            value={field(content, 'subheading')}
            onChange={(e) => set('subheading', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Left column text</Label>
        <Textarea
          value={field(content, 'leftText')}
          onChange={(e) => set('leftText', e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Right column paragraphs</Label>
        {rightParagraphs.map((p, i) => (
          <div key={i} className="flex gap-2">
            <Textarea
              value={p}
              onChange={(e) =>
                set(
                  'rightParagraphs',
                  rightParagraphs.map((para, idx) => (idx === i ? e.target.value : para)),
                )
              }
              rows={2}
              className="flex-1"
            />
            {rightParagraphs.length > 1 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  set('rightParagraphs', rightParagraphs.filter((_, idx) => idx !== i))
                }
                className="shrink-0 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => set('rightParagraphs', [...rightParagraphs, ''])}
          className="gap-2"
        >
          <Plus className="h-3.5 w-3.5" /> Add paragraph
        </Button>
      </div>

      {/* ── Value Pillars (tabbed) ────────────────────── */}
      <div className="space-y-3 rounded-lg border bg-muted/10 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="text-sm font-jost-bold">
              Value Pillars{' '}
              <span className="font-jost-regular text-muted-foreground">
                ({valuePillars.length} / 6 recommended)
              </span>
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Click a tab to edit that pillar. Upload any PNG / SVG / WebP — no preset icons.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addPillar}
            className="gap-2 self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" /> Add pillar
          </Button>
        </div>

        {valuePillars.length === 0 ? (
          <div className="rounded-md border border-dashed bg-background/40 p-6 text-center text-sm text-muted-foreground">
            No pillars yet. Click <span className="font-jost-medium">Add pillar</span> to create your first one.
          </div>
        ) : (
          <>
            {/* Tab strip */}
            <div className="flex w-full gap-1.5 overflow-x-auto rounded-md bg-muted/40 p-1">
              {valuePillars.map((pillar, index) => {
                const incomplete = !pillar.image || !pillar.title;
                const isActive = index === safeIdx;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActivePillarIdx(index)}
                    className={`flex shrink-0 items-center gap-2 rounded px-3 py-1.5 text-xs font-jost-medium transition-colors ${
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                    }`}
                  >
                    <span className="truncate max-w-[140px]">
                      {pillar.title || `Pillar ${index + 1}`}
                    </span>
                    {incomplete && (
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
                        title="Missing image or title"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active pillar editor */}
            {activePillar && (
              <div className="grid gap-5 rounded-md border bg-background p-4 md:grid-cols-[auto_1fr]">
                <div className="space-y-2">
                  <Label className="text-xs">Pillar image</Label>
                  <ImageUpload
                    value={activePillar.image}
                    onChange={(url) => updatePillar(safeIdx, 'image', url)}
                    onRemove={() => updatePillar(safeIdx, 'image', '')}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Square PNG / SVG works best (≥ 128×128).
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={activePillar.title}
                      onChange={(e) => updatePillar(safeIdx, 'title', e.target.value)}
                      placeholder="People"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={activePillar.description}
                      onChange={(e) =>
                        updatePillar(safeIdx, 'description', e.target.value)
                      }
                      rows={4}
                      placeholder="A short sentence about this value."
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePillar(safeIdx)}
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove this pillar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
