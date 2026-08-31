'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import {
  upsertDesiGheeSectionAction,
  getAllDesiGheeSectionsAction,
  setDesiGheeSectionActiveAction,
  reorderDesiGheeSectionsAction,
} from '@/modules/our-products/desi-ghee/actions';
import { SectionManagerPanel, type ManagedSection } from '@/components/shared/section-manager-panel';
import type {
  DesiGheeHeroContent,
  DesiGheeRangeContent,
  DesiGheeHighlightsContent,
  DesiGheeBilonaContent,
} from '@/modules/our-products/desi-ghee/types';
import {
  defaultHeroContent,
  defaultRangeContent,
  defaultHighlightsContent,
  defaultBilonaContent,
} from '@/modules/our-products/desi-ghee/data/defaults';

type ContentTabKey = 'hero' | 'range' | 'keyHighlights' | 'bilona';
type TabKey = ContentTabKey | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'range', label: 'Range' },
  { key: 'keyHighlights', label: 'Key Highlights' },
  { key: 'bilona', label: 'Bilona' },
  { key: 'seo', label: 'SEO' },
];

const inputClass = 'w-full rounded-lg border bg-background px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-sm font-jost-medium';

export default function DesiGheeManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [hero, setHero] = useState<DesiGheeHeroContent>(defaultHeroContent);
  const [range, setRange] = useState<DesiGheeRangeContent>(defaultRangeContent);
  const [highlights, setHighlights] =
    useState<DesiGheeHighlightsContent>(defaultHighlightsContent);
  const [bilona, setBilona] = useState<DesiGheeBilonaContent>(defaultBilonaContent);

  // Section order + visibility for the Manage Sections panel (from the DB rows).
  const [managedSections, setManagedSections] = useState<ManagedSection[]>([]);

  // Label lookup so the panel shows friendly names (reuses the content TABS).
  const sectionLabel = (key: string) =>
    TABS.find((t) => t.key === key)?.label ?? key;

  const loadManagedSections = useCallback(async () => {
    const res = await getAllDesiGheeSectionsAction();
    if (res.success) {
      // Rows come back ordered by sortOrder; keep only known content sections.
      const known = new Set(TABS.filter((t) => t.key !== 'seo').map((t) => t.key));
      setManagedSections(
        res.data
          .filter((r) => known.has(r.section as ContentTabKey))
          .map((r) => ({ key: r.section, label: sectionLabel(r.section), isActive: r.isActive })),
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      // Section order/visibility for the Manage Sections panel (after await, so
      // this setState is deferred, not a synchronous cascade).
      await loadManagedSections();
      try {
        const res = await fetch('/api/our-products/desi-ghee');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
          if (json.data.range) setRange({ ...defaultRangeContent, ...json.data.range });
          if (json.data.keyHighlights)
            setHighlights({ ...defaultHighlightsContent, ...json.data.keyHighlights });
          if (json.data.bilona) setBilona({ ...defaultBilonaContent, ...json.data.bilona });
        }
      } catch (err) {
        console.error('[DesiGheeManager.load]', err);
        toast.error('Failed to load page data');
      } finally {
        setLoadingData(false);
      }
    })();
  }, [loadManagedSections]);

  const handleSave = useCallback(async () => {
    if (activeTab === 'seo') return;
    setLoading(true);

    const contentMap = { hero, range, keyHighlights: highlights, bilona };
    const content = contentMap[activeTab];

    const result = await upsertDesiGheeSectionAction(activeTab, content);

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setLoading(false);
  }, [activeTab, hero, range, highlights, bilona]);

  if (loadingData) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const saveButton = (
    <button
      onClick={handleSave}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-jost-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-6 sm:text-base 2xl:px-8 2xl:py-3 2xl:text-lg"
    >
      {loading ? (
        <>
          <Loader className="h-4 w-4 animate-spin" /> Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" /> Save Changes
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-4 sm:space-y-6 2xl:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-jost-bold text-xl sm:text-2xl md:text-3xl 2xl:text-4xl">
            Desi Ghee — Page Manager
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm 2xl:text-base">
            Manage the Our Products / Desi Ghee page sections
          </p>
        </div>
        {activeTab !== 'seo' && saveButton}
      </div>

      {/* Manage Sections — reorder + show/hide (DB-driven, no code change). */}
      {managedSections.length > 0 && (
        <SectionManagerPanel
          sections={managedSections}
          onReorder={(orderedKeys) => reorderDesiGheeSectionsAction(orderedKeys)}
          onToggleActive={async (key, isActive) => {
            const res = await setDesiGheeSectionActiveAction(key, isActive);
            return { success: res.success, error: res.success ? undefined : res.error };
          }}
        />
      )}

      {/* Tabs */}
      <div className="rounded-lg border bg-card">
        <div className="flex overflow-x-auto border-b">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-3 py-2.5 text-sm font-jost-medium transition-colors sm:px-4 sm:py-3 sm:text-base 2xl:px-6 2xl:py-4 2xl:text-lg ${
                activeTab === tab.key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 2xl:space-y-8 2xl:p-8">
          {/* ── Hero Tab ───────────────────────────── */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={hero.heading}
                  onChange={(e) => setHero({ ...hero, heading: e.target.value })}
                  className={inputClass}
                  placeholder="A2 COW GHEE"
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle — line 1</label>
                <input
                  type="text"
                  value={hero.subtitleLineOne}
                  onChange={(e) => setHero({ ...hero, subtitleLineOne: e.target.value })}
                  className={inputClass}
                  placeholder="A smart blend of two oils for balanced, heart-healthy"
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle — line 2</label>
                <input
                  type="text"
                  value={hero.subtitleLineTwo}
                  onChange={(e) => setHero({ ...hero, subtitleLineTwo: e.target.value })}
                  className={inputClass}
                  placeholder="goodness every day."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>CTA label</label>
                  <input
                    type="text"
                    value={hero.ctaLabel}
                    onChange={(e) => setHero({ ...hero, ctaLabel: e.target.value })}
                    className={inputClass}
                    placeholder="BUY ALL"
                  />
                </div>
                <div>
                  <label className={labelClass}>CTA link</label>
                  <input
                    type="text"
                    value={hero.ctaHref}
                    onChange={(e) => setHero({ ...hero, ctaHref: e.target.value })}
                    className={inputClass}
                    placeholder="/our-products"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Logo / wordmark image</label>
                <ImageUpload
                  value={hero.logoImage}
                  onChange={(url) => setHero({ ...hero, logoImage: url })}
                />
              </div>
              <div>
                <label className={labelClass}>Product image — large jar (back)</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Use a PNG/WebP with a transparent background so it sits cleanly on the green
                  field.
                </p>
                <ImageUpload
                  value={hero.productImage}
                  onChange={(url) => setHero({ ...hero, productImage: url })}
                />
              </div>
              <div>
                <label className={labelClass}>Product image — small jar (front, optional)</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Layered in front of the large bottle. Leave empty to show a single jar.
                </p>
                <ImageUpload
                  value={hero.productImageSecondary}
                  onChange={(url) => setHero({ ...hero, productImageSecondary: url })}
                />
              </div>
            </div>
          )}

          {/* ── Range Tab ──────────────────────────── */}
          {activeTab === 'range' && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={range.heading}
                  onChange={(e) => setRange({ ...range, heading: e.target.value })}
                  className={inputClass}
                  placeholder="A2 COW GHEE RANGE OF PRODUCTS"
                />
              </div>

              <RepeatableList
                label="Product variants"
                count={range.variants.length}
                minItems={1}
                onAdd={() =>
                  setRange({
                    ...range,
                    variants: [...range.variants, { image: '', label: '', href: '' }],
                  })
                }
                onRemove={(i) =>
                  setRange({ ...range, variants: range.variants.filter((_, idx) => idx !== i) })
                }
                renderItem={(i) => (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">Label</label>
                      <input
                        type="text"
                        value={range.variants[i].label}
                        onChange={(e) =>
                          setRange({
                            ...range,
                            variants: range.variants.map((v, idx) =>
                              idx === i ? { ...v, label: e.target.value } : v,
                            ),
                          })
                        }
                        className={inputClass}
                        placeholder="1 Litre"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">
                        Link (optional)
                      </label>
                      <input
                        type="text"
                        value={range.variants[i].href}
                        onChange={(e) =>
                          setRange({
                            ...range,
                            variants: range.variants.map((v, idx) =>
                              idx === i ? { ...v, href: e.target.value } : v,
                            ),
                          })
                        }
                        className={inputClass}
                        placeholder="/our-products/ghee-1l"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">Jar image</label>
                      <ImageUpload
                        value={range.variants[i].image}
                        onChange={(url) =>
                          setRange({
                            ...range,
                            variants: range.variants.map((v, idx) =>
                              idx === i ? { ...v, image: url } : v,
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          )}

                    {/* ── Key Highlights Tab ───────────────── */}
          {activeTab === 'keyHighlights' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={highlights.heading}
                  onChange={(e) => setHighlights({ ...highlights, heading: e.target.value })}
                  className={inputClass}
                  placeholder="KEY HIGHLIGHTS"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Highlights</label>
                  <button
                    type="button"
                    onClick={() =>
                      setHighlights({
                        ...highlights,
                        highlights: [...highlights.highlights, { label: '', description: '' }],
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-jost-medium transition hover:bg-accent"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add highlight
                  </button>
                </div>

                {highlights.highlights.map((highlight, i) => (
                  <div key={i} className="space-y-3 rounded-lg border p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-jost-medium">Highlight {i + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setHighlights({
                            ...highlights,
                            highlights: highlights.highlights.filter((_, idx) => idx !== i),
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs text-destructive transition hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                    <div>
                      <label className={labelClass}>Label (bold lead-in)</label>
                      <input
                        type="text"
                        value={highlight.label}
                        onChange={(e) => {
                          const next = [...highlights.highlights];
                          next[i] = { ...next[i], label: e.target.value };
                          setHighlights({ ...highlights, highlights: next });
                        }}
                        className={inputClass}
                        placeholder="From a Pure Source:"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        value={highlight.description}
                        onChange={(e) => {
                          const next = [...highlights.highlights];
                          next[i] = { ...next[i], description: e.target.value };
                          setHighlights({ ...highlights, highlights: next });
                        }}
                        rows={2}
                        className={inputClass}
                        placeholder="A2 milk from free-grazing, indigenous cow breeds."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Background artwork</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Wide image — jar on the right, pale area on the left for the copy.
                </p>
                <ImageUpload
                  value={highlights.backgroundImage}
                  onChange={(url) => setHighlights({ ...highlights, backgroundImage: url })}
                />
              </div>
            </div>
          )}

          {/* ── Bilona Tab ──────────────────────── */}
          {activeTab === 'bilona' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={bilona.heading}
                  onChange={(e) => setBilona({ ...bilona, heading: e.target.value })}
                  className={inputClass}
                  placeholder="THE ART OF BILONA CHURNING"
                />
              </div>
              <div>
                <label className={labelClass}>Body copy</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Separate paragraphs with a blank line.
                </p>
                <textarea
                  value={bilona.paragraph}
                  onChange={(e) => setBilona({ ...bilona, paragraph: e.target.value })}
                  rows={10}
                  className={inputClass}
                  placeholder="While most modern ghee is made quickly from cream..."
                />
              </div>
              <div>
                <label className={labelClass}>Background artwork</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Wide image — village scene on the right, pale area on the left for the copy.
                </p>
                <ImageUpload
                  value={bilona.backgroundImage}
                  onChange={(url) => setBilona({ ...bilona, backgroundImage: url })}
                />
              </div>
            </div>
          )}

{activeTab === 'seo' && <SeoTabPanel page="our-products-desi-ghee" />}
        </div>
      </div>

      {/* Bottom save button for content tabs */}
      {activeTab !== 'seo' && (
        <div className="flex justify-stretch sm:justify-end">{saveButton}</div>
      )}
    </div>
  );
}

// ── Generic repeatable item wrapper ──────────────────────────

interface RepeatableListProps {
  label: string;
  count: number;
  minItems: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (index: number) => React.ReactNode;
}

function RepeatableList({
  label,
  count,
  minItems,
  onAdd,
  onRemove,
  renderItem,
}: RepeatableListProps) {
  const handleRemove = (i: number) => {
    if (count <= minItems) {
      toast.error(`At least ${minItems} item${minItems === 1 ? '' : 's'} required`);
      return;
    }
    onRemove(i);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-jost-medium">
          {label} ({count})
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-jost-medium hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="space-y-3 rounded-lg border bg-background/60 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Item {i + 1}</span>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                disabled={count <= minItems}
                className="flex items-center gap-1 text-xs text-destructive hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
            {renderItem(i)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Simple string-array editor ───────────────────────────────
