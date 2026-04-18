'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared';
import { SeoTabPanel } from '@/modules/seo';
import { upsertCoreValuesSectionAction } from '@/modules/our-essence/core-values/actions';
import type {
  CoreValuesHeroContent,
  CoreValuesFoundationContent,
  CoreValuesPrinciplesContent,
  CoreValueBlock,
} from '@/modules/our-essence/core-values/types';
import {
  defaultHeroContent,
  defaultFoundationContent,
  defaultPrinciplesContent,
} from '@/modules/our-essence/core-values/data/defaults';

type TabKey = 'hero' | 'foundation' | 'principles' | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'foundation', label: 'Foundation' },
  { key: 'principles', label: 'Principles' },
  { key: 'seo', label: 'SEO' },
];

export default function CoreValuesManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [hero, setHero] = useState<CoreValuesHeroContent>(defaultHeroContent);
  const [foundation, setFoundation] = useState<CoreValuesFoundationContent>(
    defaultFoundationContent,
  );
  const [principles, setPrinciples] = useState<CoreValuesPrinciplesContent>(
    defaultPrinciplesContent,
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/our-essence/core-values');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
          if (json.data.foundation)
            setFoundation({ ...defaultFoundationContent, ...json.data.foundation });
          if (json.data.principles)
            setPrinciples({ ...defaultPrinciplesContent, ...json.data.principles });
        }
      } catch (err) {
        console.error('[CoreValuesManager.load]', err);
        toast.error('Failed to load page data');
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  const handleSave = useCallback(async () => {
    if (activeTab === 'seo') return;
    setLoading(true);

    const contentMap = { hero, foundation, principles };
    const content = contentMap[activeTab as keyof typeof contentMap];

    const result = await upsertCoreValuesSectionAction(
      activeTab as 'hero' | 'foundation' | 'principles',
      content,
    );

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setLoading(false);
  }, [activeTab, hero, foundation, principles]);

  if (loadingData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-jost-bold text-xl sm:text-2xl md:text-3xl">
            Core Values — Page Manager
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage the Our Essence / Core Values page sections
          </p>
        </div>
        {activeTab !== 'seo' && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-jost-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-6 sm:text-base"
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
        )}
      </div>

      {/* Tabs */}
      <div className="rounded-lg border bg-card">
        <div className="flex overflow-x-auto border-b">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-3 py-2.5 text-sm font-jost-medium transition-colors sm:px-4 sm:py-3 sm:text-base ${
                activeTab === tab.key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {/* ── Hero Tab ───────────────────────────── */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Heading</label>
                <input
                  type="text"
                  value={hero.heading}
                  onChange={(e) => setHero({ ...hero, heading: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="ESSENCE IN ACTION"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Subtitle</label>
                <textarea
                  value={hero.subtitle}
                  onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="Where values transform into everyday actions..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Paragraph</label>
                <textarea
                  value={hero.paragraph}
                  onChange={(e) => setHero({ ...hero, paragraph: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="These principles are not ideas..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Background Image</label>
                <ImageUpload
                  value={hero.backgroundImage}
                  onChange={(url) => setHero({ ...hero, backgroundImage: url })}
                />
              </div>
            </div>
          )}

          {/* ── Foundation Tab ─────────────────────── */}
          {activeTab === 'foundation' && (
            <div className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Heading</label>
                <input
                  type="text"
                  value={foundation.heading}
                  onChange={(e) => setFoundation({ ...foundation, heading: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="TRUTH AS FOUNDATION"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Background Image</label>
                <ImageUpload
                  value={foundation.backgroundImage}
                  onChange={(url) =>
                    setFoundation({ ...foundation, backgroundImage: url })
                  }
                />
              </div>

              <BlockList
                label="Value Blocks"
                minBlocks={2}
                blocks={foundation.blocks}
                onChange={(blocks) => setFoundation({ ...foundation, blocks })}
              />
            </div>
          )}

          {/* ── Principles Tab ─────────────────────── */}
          {activeTab === 'principles' && (
            <div className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Background Image</label>
                <ImageUpload
                  value={principles.backgroundImage}
                  onChange={(url) =>
                    setPrinciples({ ...principles, backgroundImage: url })
                  }
                />
              </div>

              <BlockList
                label="Value Blocks"
                minBlocks={3}
                blocks={principles.blocks}
                onChange={(blocks) => setPrinciples({ ...principles, blocks })}
              />
            </div>
          )}

          {/* ── SEO Tab ────────────────────────────── */}
          {activeTab === 'seo' && <SeoTabPanel page="our-essence-core-values" />}
        </div>
      </div>

      {/* Bottom save button for content tabs */}
      {activeTab !== 'seo' && (
        <div className="flex justify-stretch sm:justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-jost-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-6 sm:text-base"
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
        </div>
      )}
    </div>
  );
}

// ── Repeatable block list (label + description) ──────────────

interface BlockListProps {
  label: string;
  minBlocks: number;
  blocks: CoreValueBlock[];
  onChange: (blocks: CoreValueBlock[]) => void;
}

function BlockList({ label, minBlocks, blocks, onChange }: BlockListProps) {
  const addBlock = () => onChange([...blocks, { label: '', description: '' }]);
  const removeBlock = (i: number) => {
    if (blocks.length <= minBlocks) {
      toast.error(`At least ${minBlocks} blocks required`);
      return;
    }
    onChange(blocks.filter((_, idx) => idx !== i));
  };
  const updateBlock = (i: number, patch: Partial<CoreValueBlock>) => {
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-jost-medium">
          {label} ({blocks.length})
        </label>
        <button
          type="button"
          onClick={addBlock}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-jost-medium hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add block
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {blocks.map((block, i) => (
          <div
            key={i}
            className="space-y-3 rounded-lg border bg-background/60 p-3 sm:p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Block {i + 1}</span>
              <button
                type="button"
                onClick={() => removeBlock(i)}
                disabled={blocks.length <= minBlocks}
                className="flex items-center gap-1 text-xs text-destructive hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-jost-medium">Label</label>
              <input
                type="text"
                value={block.label}
                onChange={(e) => updateBlock(i, { label: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="TRUTH"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-jost-medium">Description</label>
              <textarea
                value={block.description}
                onChange={(e) => updateBlock(i, { description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="Truth is the recognition of..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
