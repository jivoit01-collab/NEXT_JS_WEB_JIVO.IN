'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import {
  upsertWheatgrassSectionAction,
  getAllWheatgrassSectionsAction,
  setWheatgrassSectionActiveAction,
  reorderWheatgrassSectionsAction,
} from '@/modules/our-products/wheatgrass-juice/actions';
import { SectionManagerPanel, type ManagedSection } from '@/components/shared/section-manager-panel';
import type {
  WheatgrassHeroContent,
  WheatgrassRangeContent,
  WheatgrassWellnessContent,
  WheatgrassDifferenceContent,
  WheatgrassHighlightsContent,
} from '@/modules/our-products/wheatgrass-juice/types';
import {
  defaultHeroContent,
  defaultRangeContent,
  defaultWellnessContent,
  defaultDifferenceContent,
  defaultHighlightsContent,
} from '@/modules/our-products/wheatgrass-juice/data/defaults';

type ContentTabKey = 'hero' | 'range' | 'wellness' | 'difference' | 'highlights';
type TabKey = ContentTabKey | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'range', label: 'Range' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'difference', label: 'Difference' },
  { key: 'highlights', label: 'Key Highlights' },
  { key: 'seo', label: 'SEO' },
];

/** Hero fan slots, left → right. Index 2 is the large centre bottle. */
const HERO_BOTTLE_SLOTS = [
  '1st bottle (small)',
  '2nd bottle (medium)',
  '3rd bottle (largest)',
  '4th bottle (medium)',
  '5th bottle (small)',
];

const inputClass = 'w-full rounded-lg border bg-background px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-sm font-jost-medium';

export default function WheatgrassJuiceManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [hero, setHero] = useState<WheatgrassHeroContent>(defaultHeroContent);
  const [range, setRange] = useState<WheatgrassRangeContent>(defaultRangeContent);
  const [wellness, setWellness] = useState<WheatgrassWellnessContent>(defaultWellnessContent);
  const [difference, setDifference] =
    useState<WheatgrassDifferenceContent>(defaultDifferenceContent);
  const [highlights, setHighlights] =
    useState<WheatgrassHighlightsContent>(defaultHighlightsContent);

  // Section order + visibility for the Manage Sections panel (from the DB rows).
  const [managedSections, setManagedSections] = useState<ManagedSection[]>([]);
  const sectionLabel = (key: string) => TABS.find((t) => t.key === key)?.label ?? key;
  const loadManagedSections = useCallback(async () => {
    const res = await getAllWheatgrassSectionsAction();
    if (res.success) {
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
      await loadManagedSections();
      try {
        const res = await fetch('/api/our-products/wheatgrass-juice');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
          if (json.data.range) setRange({ ...defaultRangeContent, ...json.data.range });
          if (json.data.wellness)
            setWellness({ ...defaultWellnessContent, ...json.data.wellness });
          if (json.data.difference)
            setDifference({ ...defaultDifferenceContent, ...json.data.difference });
          if (json.data.highlights)
            setHighlights({ ...defaultHighlightsContent, ...json.data.highlights });
        }
      } catch (err) {
        console.error('[WheatgrassJuiceManager.load]', err);
        toast.error('Failed to load page data');
      } finally {
        setLoadingData(false);
      }
    })();
  }, [loadManagedSections]);

  const handleSave = useCallback(async () => {
    if (activeTab === 'seo') return;
    setLoading(true);

    const contentMap = { hero, range, wellness, difference, highlights };
    const content = contentMap[activeTab];

    const result = await upsertWheatgrassSectionAction(activeTab, content);

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setLoading(false);
  }, [activeTab, hero, range, wellness, difference, highlights]);

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
            Healthy Wheatgrass Juice — Page Manager
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm 2xl:text-base">
            Manage the Our Products / Healthy Wheatgrass Juice page sections
          </p>
        </div>
        {activeTab !== 'seo' && saveButton}
      </div>

      {managedSections.length > 0 && (
        <SectionManagerPanel
          sections={managedSections}
          onReorder={(orderedKeys) => reorderWheatgrassSectionsAction(orderedKeys)}
          onToggleActive={async (key, isActive) => {
            const res = await setWheatgrassSectionActiveAction(key, isActive);
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
                  placeholder="HEALTHY WHEATGRASS"
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle — line 1</label>
                <input
                  type="text"
                  value={hero.subtitleLineOne}
                  onChange={(e) => setHero({ ...hero, subtitleLineOne: e.target.value })}
                  className={inputClass}
                  placeholder="Himalayan Greens."
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle — line 2</label>
                <textarea
                  value={hero.subtitleLineTwo}
                  onChange={(e) => setHero({ ...hero, subtitleLineTwo: e.target.value })}
                  rows={2}
                  className={inputClass}
                  placeholder={'Pure Goodness.\nSimply Refreshing.'}
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
                    placeholder="BUY"
                  />
                </div>
                <div>
                  <label className={labelClass}>CTA link</label>
                  <input
                    type="text"
                    value={hero.ctaHref}
                    onChange={(e) => setHero({ ...hero, ctaHref: e.target.value })}
                    className={inputClass}
                    placeholder="shop.jivo.in"
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
                <label className={labelClass}>Hero bottles (5)</label>
                <p className="mb-3 text-xs text-muted-foreground">
                  Left → right as they appear in the fan. The 3rd (middle) bottle renders
                  largest, the 2nd and 4th a step smaller, and the 1st and 5th smallest. Use
                  PNG/WebP with a transparent background so they sit cleanly on the green field.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {HERO_BOTTLE_SLOTS.map((slotLabel, i) => (
                    <div key={i}>
                      <label className="mb-1 block text-xs font-jost-medium">{slotLabel}</label>
                      <ImageUpload
                        value={hero.bottles?.[i] ?? ''}
                        onChange={(url) =>
                          setHero({
                            ...hero,
                            bottles: Array.from({ length: 5 }, (_, idx) =>
                              idx === i ? url : (hero.bottles?.[idx] ?? ''),
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
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
                  placeholder="HEALTHY WHEATGRASS RANGE OF PRODUCTS"
                />
              </div>

              <RepeatableList
                grid
                label="Product variants"
                count={range.variants.length}
                minItems={1}
                onAdd={() =>
                  setRange({
                    ...range,
                    variants: [...range.variants, { image: '', label: '', size: '', href: '' }],
                  })
                }
                onRemove={(i) =>
                  setRange({ ...range, variants: range.variants.filter((_, idx) => idx !== i) })
                }
                renderItem={(i) => (
                  <div className="space-y-3">
                    {/* Stacked (not side-by-side): each item now sits in a
                        narrow grid card, where two columns would be cramped. */}
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-jost-medium">Flavour</label>
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
                          placeholder="Rose"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-jost-medium">Size</label>
                        <input
                          type="text"
                          value={range.variants[i].size}
                          onChange={(e) =>
                            setRange({
                              ...range,
                              variants: range.variants.map((v, idx) =>
                                idx === i ? { ...v, size: e.target.value } : v,
                              ),
                            })
                          }
                          className={inputClass}
                          placeholder="200ml"
                        />
                      </div>
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
                        placeholder="shop.jivo.in/wheatgrass-rose"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">Bottle image</label>
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

          {/* ── Wellness Tab ───────────────────────── */}
          {activeTab === 'wellness' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={wellness.heading}
                  onChange={(e) => setWellness({ ...wellness, heading: e.target.value })}
                  className={inputClass}
                  placeholder="MORE THAN A JUICE: A CARRIER OF WELLNESS"
                />
              </div>
              <div>
                <label className={labelClass}>Paragraph</label>
                <textarea
                  value={wellness.paragraph}
                  onChange={(e) => setWellness({ ...wellness, paragraph: e.target.value })}
                  rows={8}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Side artwork (wheatgrass blades)</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Bleeds off the right edge behind the copy. Use a transparent PNG/WebP.
                </p>
                <ImageUpload
                  value={wellness.image}
                  onChange={(url) => setWellness({ ...wellness, image: url })}
                />
              </div>
            </div>
          )}

          {/* ── Difference Tab ─────────────────────── */}
          {activeTab === 'difference' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={difference.heading}
                  onChange={(e) => setDifference({ ...difference, heading: e.target.value })}
                  className={inputClass}
                  placeholder="A DIFFERENCE YOU CAN SEE AND TASTE"
                />
              </div>
              <div>
                <label className={labelClass}>Paragraph</label>
                <textarea
                  value={difference.paragraph}
                  onChange={(e) => setDifference({ ...difference, paragraph: e.target.value })}
                  rows={8}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Side artwork (tilted bottle)</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Bleeds off the bottom-right edge behind the copy. Use a transparent PNG/WebP.
                </p>
                <ImageUpload
                  value={difference.image}
                  onChange={(url) => setDifference({ ...difference, image: url })}
                />
              </div>
            </div>
          )}

          {/* ── Key Highlights Tab ─────────────────── */}
          {activeTab === 'highlights' && (
            <div className="space-y-6">
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
              <div>
                <label className={labelClass}>Background photo (wheatgrass field)</label>
                <ImageUpload
                  value={highlights.backgroundImage}
                  onChange={(url) => setHighlights({ ...highlights, backgroundImage: url })}
                />
              </div>

              <RepeatableList
                label="Highlights"
                count={highlights.highlights.length}
                minItems={1}
                onAdd={() =>
                  setHighlights({
                    ...highlights,
                    highlights: [
                      ...highlights.highlights,
                      { image: '', label: '', description: '' },
                    ],
                  })
                }
                onRemove={(i) =>
                  setHighlights({
                    ...highlights,
                    highlights: highlights.highlights.filter((_, idx) => idx !== i),
                  })
                }
                renderItem={(i) => (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">Label</label>
                      <input
                        type="text"
                        value={highlights.highlights[i].label}
                        onChange={(e) =>
                          setHighlights({
                            ...highlights,
                            highlights: highlights.highlights.map((h, idx) =>
                              idx === i ? { ...h, label: e.target.value } : h,
                            ),
                          })
                        }
                        className={inputClass}
                        placeholder="Cold-Pressed Extraction"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">Description</label>
                      <textarea
                        value={highlights.highlights[i].description}
                        onChange={(e) =>
                          setHighlights({
                            ...highlights,
                            highlights: highlights.highlights.map((h, idx) =>
                              idx === i ? { ...h, description: e.target.value } : h,
                            ),
                          })
                        }
                        rows={3}
                        className={inputClass}
                        placeholder="Preserves live enzymes and nutrients intact."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">Icon</label>
                      <ImageUpload
                        value={highlights.highlights[i].image}
                        onChange={(url) =>
                          setHighlights({
                            ...highlights,
                            highlights: highlights.highlights.map((h, idx) =>
                              idx === i ? { ...h, image: url } : h,
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

          {/* ── SEO Tab ────────────────────────────── */}
          {activeTab === 'seo' && <SeoTabPanel page="our-products-wheatgrass-juice" />}
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
  /**
   * Lay items out as CARDS in a responsive grid (up to 4 per row) instead of
   * stacked full-width rows. Used by the Range tab, where each item is a small
   * product card and a horizontal row wastes most of the width.
   */
  grid?: boolean;
}

function RepeatableList({
  label,
  count,
  minItems,
  onAdd,
  onRemove,
  renderItem,
  grid = false,
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

      <div
        className={
          grid
            ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'
            : 'space-y-3 sm:space-y-4'
        }
      >
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
