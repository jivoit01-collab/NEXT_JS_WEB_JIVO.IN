'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Textarea,
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { ImageUpload, toSrc } from '@/components/shared';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Home,
  Layers,
  CheckCircle2,
  X,
  Search,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { SeoTabPanel } from '@/modules/seo';
import { defaultSeo as homeDefaultSeo } from '@/modules/home';

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
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createKey, setCreateKey] = useState<SectionKey | ''>('');
  const [formContent, setFormContent] = useState<Record<string, unknown>>({});
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [error, setError] = useState('');

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
      if (data.success) setSections(data.data);
      else toast.error(data.error ?? 'Failed to load sections');
    } catch {
      toast.error('Failed to load home sections');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const existingKeys = sections.map((s) => s.section);
  const availableToCreate = SECTION_ORDER.filter((k) => !existingKeys.includes(k));
  const activeCount = sections.filter((s) => s.isActive).length;

  const openCreate = (key: SectionKey) => {
    setEditingSection(null);
    setCreateKey(key);
    setFormContent(getDefaultContent(key));
    setFormSortOrder(SECTION_ORDER.indexOf(key));
    setFormIsActive(true);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (section: HomeSection) => {
    setEditingSection(section);
    setCreateKey('');
    setFormContent(section.content);
    setFormSortOrder(section.sortOrder);
    setFormIsActive(section.isActive);
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
      const isEdit = !!editingSection;
      const url = isEdit ? `/api/home/${editingSection.id}` : '/api/home';
      const method = isEdit ? 'PUT' : 'POST';

      const body = isEdit
        ? { content: formContent, sortOrder: formSortOrder, isActive: formIsActive }
        : {
            section: createKey,
            content: formContent,
            sortOrder: formSortOrder,
            isActive: formIsActive,
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

      const label = isEdit
        ? SECTION_LABELS[editingSection.section as SectionKey]
        : SECTION_LABELS[createKey as SectionKey];
      toast.success(`${label} ${isEdit ? 'updated' : 'created'}`, {
        description: 'Refresh your live site tab to see the change.',
        duration: 5000,
      });
      setDialogOpen(false);
      await fetchSections();
      router.refresh(); // revalidate public / route cache
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

  const toggleActive = async (section: HomeSection) => {
    try {
      const res = await fetch(`/api/home/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !section.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${section.title ?? section.section} ${section.isActive ? 'hidden' : 'published'}`);
        await fetchSections();
        router.refresh();
      } else {
        toast.error(data.error ?? 'Update failed');
      }
    } catch {
      toast.error('Network error');
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

  const currentSectionKey = editingSection?.section ?? createKey;

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
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Home className="h-3.5 w-3.5" /> Home Page
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Home Page Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage every visual section on the public home page.
        </p>
      </div>

      {/* ── Top-level Tabs (Sections / SEO) ── */}
      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="w-full justify-start sm:w-auto">
          <TabsTrigger value="sections" className="gap-2">
            <Layers className="h-4 w-4" /> Sections
          </TabsTrigger>
          <TabsTrigger value="hero-carousel" className="gap-2">
            <ImageIcon className="h-4 w-4" /> Hero Carousel
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" /> SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-6">

      {/* ── Stats row ──────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Layers className="h-4 w-4" />}
          label="Total sections"
          value={sections.length}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
          label="Active"
          value={activeCount}
          tone="primary"
        />
        <StatCard
          icon={<EyeOff className="h-4 w-4" />}
          label="Inactive"
          value={sections.length - activeCount}
        />
        <StatCard
          icon={<Plus className="h-4 w-4" />}
          label="Available to add"
          value={availableToCreate.length}
        />
      </div>

      {/* ── Missing sections chips ─────────── */}
      {availableToCreate.length > 0 && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-4">
          <p className="mb-3 text-sm font-medium">
            You haven&apos;t created these sections yet:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableToCreate.map((key) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => openCreate(key)}
                className="gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                {SECTION_LABELS[key]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ── Sections table ─────────────────── */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-40">Last updated</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  No home sections yet — add one from the chips above.
                </TableCell>
              </TableRow>
            ) : (
              sections.map((section) => (
                <TableRow key={section.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{section.sortOrder}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {section.title ??
                        SECTION_LABELS[section.section as SectionKey] ??
                        section.section}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {section.section}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(section)}
                      className="cursor-pointer"
                      title={section.isActive ? 'Click to unpublish' : 'Click to publish'}
                    >
                      <Badge
                        variant={section.isActive ? 'default' : 'secondary'}
                        className={
                          section.isActive
                            ? 'bg-primary/15 text-primary hover:bg-primary/25'
                            : 'hover:bg-secondary/80'
                        }
                      >
                        <span
                          className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                            section.isActive ? 'bg-primary' : 'bg-muted-foreground'
                          }`}
                        />
                        {section.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(section.updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(section)}
                        title="Edit"
                        className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDelete(section.id)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                  editingSection ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'
                }`}
              >
                {editingSection ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              {editingSection
                ? `Edit — ${
                    SECTION_LABELS[editingSection.section as SectionKey] ??
                    editingSection.section
                  }`
                : `Create — ${SECTION_LABELS[createKey as SectionKey] ?? createKey}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Meta row */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Sort order</Label>
                <Input
                  type="number"
                  min={0}
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Visibility</Label>
                <Button
                  type="button"
                  variant={formIsActive ? 'default' : 'secondary'}
                  className="w-full"
                  onClick={() => setFormIsActive(!formIsActive)}
                >
                  {formIsActive ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Active — visible on site
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" /> Inactive — hidden
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Section-specific editor */}
            {currentSectionKey === 'hero' && (
              <HeroEditor content={formContent} onChange={setFormContent} />
            )}
            {currentSectionKey === 'categories' && (
              <CategoriesEditor content={formContent} onChange={setFormContent} />
            )}
            {currentSectionKey === 'vision_mission' && (
              <VisionMissionEditor content={formContent} onChange={setFormContent} />
            )}
            {currentSectionKey === 'products_foundation' && (
              <ProductsFoundationEditor content={formContent} onChange={setFormContent} />
            )}
            {currentSectionKey === 'why_jivo' && (
              <WhyJivoEditor content={formContent} onChange={setFormContent} />
            )}

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
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingSection ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <h2 className="text-lg font-semibold">Hero Carousel Slides</h2>
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
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
              #0
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">Hero Section <span className="text-xs font-normal text-muted-foreground">(default first slide)</span></p>
              <p className="text-sm text-muted-foreground">
                Edit from the <strong>Sections</strong> tab &rarr; Hero section. Background image, headline &amp; subtitle from there become slide #0.
              </p>
            </div>
          </div>

          {heroSlides.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium">No carousel slides yet</p>
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
                      <img
                        src={toSrc(slide.backgroundImage)}
                        alt={slide.headline}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{slide.headline || 'Untitled slide'}</p>
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
            <span className="text-sm font-medium">Category #{index + 1}</span>
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
                  className={`cursor-pointer rounded-md border px-3 py-1 text-xs font-medium transition ${
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
          <span className="text-xs font-normal text-muted-foreground">
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
            <Label className="text-sm font-semibold">
              Value Pillars{' '}
              <span className="font-normal text-muted-foreground">
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
            No pillars yet. Click <span className="font-medium">Add pillar</span> to create your first one.
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
                    className={`flex shrink-0 items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
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
