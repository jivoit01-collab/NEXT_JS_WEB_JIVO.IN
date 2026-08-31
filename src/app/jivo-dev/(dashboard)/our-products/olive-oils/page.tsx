'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import {
  upsertOliveOilsSectionAction,
  getAllOliveOilsSectionsAction,
  setOliveOilsSectionActiveAction,
  reorderOliveOilsSectionsAction,
} from '@/modules/our-products/olive-oils/actions';
import { SectionManagerPanel, type ManagedSection } from '@/components/shared/section-manager-panel';
import type {
  OliveOilsHeroContent,
  OliveOilsVariantContent,
  OliveOilsDifferenceContent,
} from '@/modules/our-products/olive-oils/types';
import {
  defaultHeroContent,
  defaultExtraVirginContent,
  defaultExtraLightContent,
  defaultPomaceContent,
  defaultDifferenceContent,
} from '@/modules/our-products/olive-oils/data/defaults';

type VariantTabKey = 'extraVirgin' | 'extraLight' | 'pomace';
type ContentTabKey = 'hero' | VariantTabKey | 'difference';
type TabKey = ContentTabKey | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'extraVirgin', label: 'Extra Virgin' },
  { key: 'extraLight', label: 'Extra Light' },
  { key: 'pomace', label: 'Pomace' },
  { key: 'difference', label: 'Difference' },
  { key: 'seo', label: 'SEO' },
];

const inputClass = 'w-full rounded-lg border bg-background px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-sm font-jost-medium';

export default function OliveOilsManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [hero, setHero] = useState<OliveOilsHeroContent>(defaultHeroContent);
  const [extraVirgin, setExtraVirgin] =
    useState<OliveOilsVariantContent>(defaultExtraVirginContent);
  const [extraLight, setExtraLight] = useState<OliveOilsVariantContent>(defaultExtraLightContent);
  const [pomace, setPomace] = useState<OliveOilsVariantContent>(defaultPomaceContent);
  const [difference, setDifference] =
    useState<OliveOilsDifferenceContent>(defaultDifferenceContent);

  const [managedSections, setManagedSections] = useState<ManagedSection[]>([]);
  const sectionLabel = (key: string) => TABS.find((t) => t.key === key)?.label ?? key;
  const loadManagedSections = useCallback(async () => {
    const res = await getAllOliveOilsSectionsAction();
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
        const res = await fetch('/api/our-products/olive-oils');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
          if (json.data.extraVirgin)
            setExtraVirgin({ ...defaultExtraVirginContent, ...json.data.extraVirgin });
          if (json.data.extraLight)
            setExtraLight({ ...defaultExtraLightContent, ...json.data.extraLight });
          if (json.data.pomace) setPomace({ ...defaultPomaceContent, ...json.data.pomace });
          if (json.data.difference)
            setDifference({ ...defaultDifferenceContent, ...json.data.difference });
        }
      } catch (err) {
        console.error('[OliveOilsManager.load]', err);
        toast.error('Failed to load page data');
      } finally {
        setLoadingData(false);
      }
    })();
  }, [loadManagedSections]);

  const handleSave = useCallback(async () => {
    if (activeTab === 'seo') return;
    setLoading(true);

    const contentMap = { hero, extraVirgin, extraLight, pomace, difference };
    const content = contentMap[activeTab];

    const result = await upsertOliveOilsSectionAction(activeTab, content);

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setLoading(false);
  }, [activeTab, hero, extraVirgin, extraLight, pomace, difference]);

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

  // The three variant tabs share one editor; only their state differs.
  const variantEditors: Record<
    VariantTabKey,
    { value: OliveOilsVariantContent; set: (v: OliveOilsVariantContent) => void; placeholder: string }
  > = {
    extraVirgin: {
      value: extraVirgin,
      set: setExtraVirgin,
      placeholder: 'EXTRA VIRGIN OLIVE OIL',
    },
    extraLight: { value: extraLight, set: setExtraLight, placeholder: 'EXTRA LIGHT OLIVE OIL' },
    pomace: { value: pomace, set: setPomace, placeholder: 'POMACE OLIVE OIL' },
  };

  return (
    <div className="space-y-4 sm:space-y-6 2xl:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-jost-bold text-xl sm:text-2xl md:text-3xl 2xl:text-4xl">
            Olive Oils — Page Manager
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm 2xl:text-base">
            Manage the Our Products / Olive Oils page sections
          </p>
        </div>
        {activeTab !== 'seo' && saveButton}
      </div>

      {managedSections.length > 0 && (
        <SectionManagerPanel
          sections={managedSections}
          onReorder={(orderedKeys) => reorderOliveOilsSectionsAction(orderedKeys)}
          onToggleActive={async (key, isActive) => {
            const res = await setOliveOilsSectionActiveAction(key, isActive);
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
                  placeholder="THE OLIVE FAMILY"
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle — line 1</label>
                <input
                  type="text"
                  value={hero.subtitleLineOne}
                  onChange={(e) => setHero({ ...hero, subtitleLineOne: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle — line 2</label>
                <input
                  type="text"
                  value={hero.subtitleLineTwo}
                  onChange={(e) => setHero({ ...hero, subtitleLineTwo: e.target.value })}
                  className={inputClass}
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
              <div className="rounded-lg border bg-background/60 p-3 sm:p-4">
                <p className="text-sm font-jost-medium">Hero packs (three, left → right)</p>
                <p className="mt-1 mb-4 text-xs text-muted-foreground">
                  They render upright and side by side, each a step taller than the last. Use
                  PNG/WebP with transparent backgrounds. Packs 2 and 3 are optional — leave one
                  empty to show fewer.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-jost-medium">
                      Pack 1 — smallest (back)
                    </label>
                    <ImageUpload
                      value={hero.productImage}
                      onChange={(url) => setHero({ ...hero, productImage: url })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-jost-medium">
                      Pack 2 — medium (optional)
                    </label>
                    <ImageUpload
                      value={hero.productImageSecondary}
                      onChange={(url) => setHero({ ...hero, productImageSecondary: url })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-jost-medium">
                      Pack 3 — largest (front, optional)
                    </label>
                    <ImageUpload
                      value={hero.productImageThree}
                      onChange={(url) => setHero({ ...hero, productImageThree: url })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Variant tabs (Extra Virgin / Extra Light / Pomace) ── */}
          {activeTab !== 'hero' && activeTab !== 'difference' && activeTab !== 'seo' && (
            <VariantEditor
              value={variantEditors[activeTab].value}
              onChange={variantEditors[activeTab].set}
              headingPlaceholder={variantEditors[activeTab].placeholder}
            />
          )}

          {/* ── Difference Tab ─────────────────────── */}
          {activeTab === 'difference' && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={difference.heading}
                  onChange={(e) => setDifference({ ...difference, heading: e.target.value })}
                  className={inputClass}
                  placeholder="THE JIVO DIFFERENCE"
                />
              </div>
              <div>
                <label className={labelClass}>Paragraph</label>
                <textarea
                  value={difference.paragraph}
                  onChange={(e) => setDifference({ ...difference, paragraph: e.target.value })}
                  rows={6}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Line breaks are preserved on the page.
                </p>
              </div>
              <div>
                <label className={labelClass}>Background image (olive grove)</label>
                <ImageUpload
                  value={difference.backgroundImage}
                  onChange={(url) => setDifference({ ...difference, backgroundImage: url })}
                />
              </div>
            </div>
          )}

          {/* ── SEO Tab ────────────────────────────── */}
          {activeTab === 'seo' && <SeoTabPanel page="our-products-olive-oils" />}
        </div>
      </div>

      {/* Bottom save button for content tabs */}
      {activeTab !== 'seo' && (
        <div className="flex justify-stretch sm:justify-end">{saveButton}</div>
      )}
    </div>
  );
}

// ── Shared editor for the three variant sections ─────────────

function VariantEditor({
  value,
  onChange,
  headingPlaceholder,
}: {
  value: OliveOilsVariantContent;
  onChange: (v: OliveOilsVariantContent) => void;
  headingPlaceholder: string;
}) {
  const addVariant = () =>
    onChange({ ...value, variants: [...value.variants, { image: '', label: '', href: '' }] });

  const removeVariant = (i: number) => {
    if (value.variants.length <= 1) {
      toast.error('At least one pack size required');
      return;
    }
    onChange({ ...value, variants: value.variants.filter((_, idx) => idx !== i) });
  };

  const patchVariant = (i: number, patch: Partial<OliveOilsVariantContent['variants'][number]>) =>
    onChange({
      ...value,
      variants: value.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    });

  return (
    <div className="space-y-6">
      <div>
        <label className={labelClass}>Heading</label>
        <input
          type="text"
          value={value.heading}
          onChange={(e) => onChange({ ...value, heading: e.target.value })}
          className={inputClass}
          placeholder={headingPlaceholder}
        />
      </div>
      <div>
        <label className={labelClass}>Paragraph</label>
        <textarea
          value={value.paragraph}
          onChange={(e) => onChange({ ...value, paragraph: e.target.value })}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Paragraph 2 (optional)</label>
        <textarea
          value={value.paragraphTwo}
          onChange={(e) => onChange({ ...value, paragraphTwo: e.target.value })}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>“Best for” line</label>
        <input
          type="text"
          value={value.bestFor}
          onChange={(e) => onChange({ ...value, bestFor: e.target.value })}
          className={inputClass}
          placeholder="Best for: salad dressings, dips, marinades, and gentle cooking."
        />
      </div>
      <div>
        <label className={labelClass}>Side artwork (olive branch / fruit)</label>
        <p className="mb-2 text-xs text-muted-foreground">
          Decorative image beside the copy. Use a transparent PNG/WebP.
        </p>
        <ImageUpload
          value={value.sideImage}
          onChange={(url) => onChange({ ...value, sideImage: url })}
        />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-jost-medium">Pack sizes ({value.variants.length})</label>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-jost-medium hover:bg-accent"
          >
            <Plus className="h-3.5 w-3.5" /> Add pack
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {value.variants.map((variant, i) => (
            <div key={i} className="space-y-3 rounded-lg border bg-background/60 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pack {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  disabled={value.variants.length <= 1}
                  className="flex items-center gap-1 text-xs text-destructive hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-jost-medium">Label</label>
                <input
                  type="text"
                  value={variant.label}
                  onChange={(e) => patchVariant(i, { label: e.target.value })}
                  className={inputClass}
                  placeholder="1 Litre"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-jost-medium">Link (optional)</label>
                <input
                  type="text"
                  value={variant.href}
                  onChange={(e) => patchVariant(i, { href: e.target.value })}
                  className={inputClass}
                  placeholder="shop.jivo.in/olive-1l"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-jost-medium">Pack image</label>
                <ImageUpload
                  value={variant.image}
                  onChange={(url) => patchVariant(i, { image: url })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
