'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import { upsertCanolaOilsSectionAction } from '@/modules/our-products/canola-oils/actions';
import type {
  CanolaOilsHeroContent,
  CanolaOilsRangeContent,
  CanolaOilsWhatIsContent,
  CanolaOilsScienceContent,
  CanolaOilsColdPressedContent,
} from '@/modules/our-products/canola-oils/types';
import {
  defaultHeroContent,
  defaultRangeContent,
  defaultWhatIsContent,
  defaultScienceContent,
  defaultColdPressedContent,
} from '@/modules/our-products/canola-oils/data/defaults';

type ContentTabKey = 'hero' | 'range' | 'whatIsCanola' | 'science' | 'coldPressed';
type TabKey = ContentTabKey | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'range', label: 'Range' },
  { key: 'whatIsCanola', label: 'What Is Canola' },
  { key: 'science', label: 'Science' },
  { key: 'coldPressed', label: 'Cold-Pressed' },
  { key: 'seo', label: 'SEO' },
];

const inputClass = 'w-full rounded-lg border bg-background px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-sm font-jost-medium';

export default function CanolaOilsManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [hero, setHero] = useState<CanolaOilsHeroContent>(defaultHeroContent);
  const [range, setRange] = useState<CanolaOilsRangeContent>(defaultRangeContent);
  const [whatIs, setWhatIs] = useState<CanolaOilsWhatIsContent>(defaultWhatIsContent);
  const [science, setScience] = useState<CanolaOilsScienceContent>(defaultScienceContent);
  const [coldPressed, setColdPressed] =
    useState<CanolaOilsColdPressedContent>(defaultColdPressedContent);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/our-products/canola-oils');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
          if (json.data.range) setRange({ ...defaultRangeContent, ...json.data.range });
          if (json.data.whatIsCanola)
            setWhatIs({ ...defaultWhatIsContent, ...json.data.whatIsCanola });
          if (json.data.science) setScience({ ...defaultScienceContent, ...json.data.science });
          if (json.data.coldPressed)
            setColdPressed({ ...defaultColdPressedContent, ...json.data.coldPressed });
        }
      } catch (err) {
        console.error('[CanolaOilsManager.load]', err);
        toast.error('Failed to load page data');
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  const handleSave = useCallback(async () => {
    if (activeTab === 'seo') return;
    setLoading(true);

    const contentMap = { hero, range, whatIsCanola: whatIs, science, coldPressed };
    const content = contentMap[activeTab];

    const result = await upsertCanolaOilsSectionAction(activeTab, content);

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setLoading(false);
  }, [activeTab, hero, range, whatIs, science, coldPressed]);

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
            Canola Oils — Page Manager
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm 2xl:text-base">
            Manage the Our Products / Canola Oils page sections
          </p>
        </div>
        {activeTab !== 'seo' && saveButton}
      </div>

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
                  placeholder="CANOLA OILS"
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle — line 1</label>
                <input
                  type="text"
                  value={hero.subtitleLineOne}
                  onChange={(e) => setHero({ ...hero, subtitleLineOne: e.target.value })}
                  className={inputClass}
                  placeholder="India's largest seller of cold press canola oil"
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle — line 2</label>
                <input
                  type="text"
                  value={hero.subtitleLineTwo}
                  onChange={(e) => setHero({ ...hero, subtitleLineTwo: e.target.value })}
                  className={inputClass}
                  placeholder="India's first patented wheatgrass products"
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
                <label className={labelClass}>Product image — large bottle (back)</label>
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
                <label className={labelClass}>Product image — small bottle (front, optional)</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Layered in front of the large bottle. Leave empty to show a single bottle.
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
                  placeholder="CANOLA OIL RANGE OF PRODUCTS"
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
                        placeholder="/our-products/canola-1l"
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

          {/* ── What Is Canola Tab ─────────────────── */}
          {activeTab === 'whatIsCanola' && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={whatIs.heading}
                  onChange={(e) => setWhatIs({ ...whatIs, heading: e.target.value })}
                  className={inputClass}
                  placeholder="WHAT IS CANOLA ?"
                />
              </div>
              <div>
                <label className={labelClass}>Left paragraph</label>
                <textarea
                  value={whatIs.paragraphLeft}
                  onChange={(e) => setWhatIs({ ...whatIs, paragraphLeft: e.target.value })}
                  rows={5}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Right paragraph</label>
                <textarea
                  value={whatIs.paragraphRight}
                  onChange={(e) => setWhatIs({ ...whatIs, paragraphRight: e.target.value })}
                  rows={5}
                  className={inputClass}
                />
              </div>

              <RepeatableList
                label="Feature images"
                count={whatIs.features.length}
                minItems={1}
                onAdd={() =>
                  setWhatIs({
                    ...whatIs,
                    features: [...whatIs.features, { image: '', label: '', description: '' }],
                  })
                }
                onRemove={(i) =>
                  setWhatIs({
                    ...whatIs,
                    features: whatIs.features.filter((_, idx) => idx !== i),
                  })
                }
                renderItem={(i) => (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">Image</label>
                      <p className="mb-2 text-xs text-muted-foreground">
                        Use a PNG/WebP with a transparent background so it sits cleanly on the
                        section colour. Leave empty to show the placeholder.
                      </p>
                      <ImageUpload
                        value={whatIs.features[i].image}
                        onChange={(url) =>
                          setWhatIs({
                            ...whatIs,
                            features: whatIs.features.map((f, idx) =>
                              idx === i ? { ...f, image: url } : f,
                            ),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">Label</label>
                      <textarea
                        value={whatIs.features[i].label}
                        onChange={(e) =>
                          setWhatIs({
                            ...whatIs,
                            features: whatIs.features.map((f, idx) =>
                              idx === i ? { ...f, label: e.target.value } : f,
                            ),
                          })
                        }
                        rows={2}
                        className={inputClass}
                        placeholder="Mechanically extracted under minimal heat"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-jost-medium">
                        Description (optional)
                      </label>
                      <textarea
                        value={whatIs.features[i].description}
                        onChange={(e) =>
                          setWhatIs({
                            ...whatIs,
                            features: whatIs.features.map((f, idx) =>
                              idx === i ? { ...f, description: e.target.value } : f,
                            ),
                          })
                        }
                        rows={3}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          )}

          {/* ── Science Tab ────────────────────────── */}
          {activeTab === 'science' && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={science.heading}
                  onChange={(e) => setScience({ ...science, heading: e.target.value })}
                  className={inputClass}
                  placeholder="THE SCIENCE BEHIND THE GOLD"
                />
              </div>
              <div>
                <label className={labelClass}>Intro</label>
                <textarea
                  value={science.intro}
                  onChange={(e) => setScience({ ...science, intro: e.target.value })}
                  rows={4}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Subheading</label>
                <input
                  type="text"
                  value={science.subheading}
                  onChange={(e) => setScience({ ...science, subheading: e.target.value })}
                  className={inputClass}
                  placeholder="Nutritional Excellence"
                />
              </div>

              <StringListEditor
                label="Points"
                items={science.points}
                placeholder="Contains the lowest saturated fat content..."
                onChange={(points) => setScience({ ...science, points })}
              />

              <div>
                <label className={labelClass}>Closing line</label>
                <input
                  type="text"
                  value={science.closingLine}
                  onChange={(e) => setScience({ ...science, closingLine: e.target.value })}
                  className={inputClass}
                  placeholder="This isn't refinement — it's respect for what's real."
                />
              </div>
              <div>
                <label className={labelClass}>Background image (canola field)</label>
                <ImageUpload
                  value={science.backgroundImage}
                  onChange={(url) => setScience({ ...science, backgroundImage: url })}
                />
              </div>
            </div>
          )}

          {/* ── Cold-Pressed Tab ───────────────────── */}
          {activeTab === 'coldPressed' && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={coldPressed.heading}
                  onChange={(e) => setColdPressed({ ...coldPressed, heading: e.target.value })}
                  className={inputClass}
                  placeholder="WHY COLD-PRESSED"
                />
              </div>
              <div>
                <label className={labelClass}>Lead line 1</label>
                <input
                  type="text"
                  value={coldPressed.leadLineOne}
                  onChange={(e) =>
                    setColdPressed({ ...coldPressed, leadLineOne: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Lead line 2</label>
                <input
                  type="text"
                  value={coldPressed.leadLineTwo}
                  onChange={(e) =>
                    setColdPressed({ ...coldPressed, leadLineTwo: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Paragraph</label>
                <textarea
                  value={coldPressed.paragraph}
                  onChange={(e) => setColdPressed({ ...coldPressed, paragraph: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-lg border bg-background/60 p-3 sm:p-4">
                  <div>
                    <label className={labelClass}>Left column title</label>
                    <input
                      type="text"
                      value={coldPressed.coldPressedTitle}
                      onChange={(e) =>
                        setColdPressed({ ...coldPressed, coldPressedTitle: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Cold-Pressed Oils"
                    />
                  </div>
                  <StringListEditor
                    label="Points"
                    items={coldPressed.coldPressedPoints}
                    placeholder="Extracted naturally — no chemicals, no solvents"
                    onChange={(coldPressedPoints) =>
                      setColdPressed({ ...coldPressed, coldPressedPoints })
                    }
                  />
                </div>

                <div className="space-y-4 rounded-lg border bg-background/60 p-3 sm:p-4">
                  <div>
                    <label className={labelClass}>Right column title</label>
                    <input
                      type="text"
                      value={coldPressed.refinedTitle}
                      onChange={(e) =>
                        setColdPressed({ ...coldPressed, refinedTitle: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Refined Oils"
                    />
                  </div>
                  <StringListEditor
                    label="Points"
                    items={coldPressed.refinedPoints}
                    placeholder="Extracted using chemical solvents and high heat"
                    onChange={(refinedPoints) =>
                      setColdPressed({ ...coldPressed, refinedPoints })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── SEO Tab ────────────────────────────── */}
          {activeTab === 'seo' && <SeoTabPanel page="our-products-canola-oils" />}
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

interface StringListEditorProps {
  label: string;
  items: string[];
  placeholder?: string;
  onChange: (items: string[]) => void;
}

function StringListEditor({ label, items, placeholder, onChange }: StringListEditorProps) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-jost-medium">
          {label} ({items.length})
        </label>
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-jost-medium hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <textarea
              value={item}
              onChange={(e) => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))}
              rows={2}
              className={inputClass}
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => {
                if (items.length <= 1) {
                  toast.error('At least one item required');
                  return;
                }
                onChange(items.filter((_, idx) => idx !== i));
              }}
              disabled={items.length <= 1}
              aria-label={`Remove ${label} item ${i + 1}`}
              className="mt-1 shrink-0 rounded-md border p-2 text-destructive transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
