'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import { upsertForMotherEarthSectionAction } from '@/modules/our-essence/for-mother-earth/actions';
import { FOR_MOTHER_EARTH_SEO_PAGE } from '@/modules/our-essence/for-mother-earth/constants';
import {
  defaultCleanTreeContent,
  defaultDisasterContent,
  defaultHeroContent,
} from '@/modules/our-essence/for-mother-earth/data/defaults';
import type {
  ForMotherEarthCleanTreeContent,
  ForMotherEarthDisasterContent,
  ForMotherEarthHeroContent,
  ForMotherEarthSectionKey,
} from '@/modules/our-essence/for-mother-earth/types';

type TabKey = ForMotherEarthSectionKey | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'cleanTree', label: 'Clean Village + Tree' },
  { key: 'disaster', label: 'Disaster Support' },
  { key: 'seo', label: 'SEO' },
];

interface ApiResponse {
  success: boolean;
  data?: {
    hero?: Partial<ForMotherEarthHeroContent>;
    cleanTree?: Partial<ForMotherEarthCleanTreeContent>;
    disaster?: Partial<ForMotherEarthDisasterContent>;
  };
  error?: string;
}

export default function ForMotherEarthManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [hero, setHero] = useState<ForMotherEarthHeroContent>(defaultHeroContent);
  const [cleanTree, setCleanTree] =
    useState<ForMotherEarthCleanTreeContent>(defaultCleanTreeContent);
  const [disaster, setDisaster] = useState<ForMotherEarthDisasterContent>(defaultDisasterContent);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/our-essence/for-mother-earth', {
          cache: 'no-store',
        });
        const json = (await res.json()) as ApiResponse;

        if (!json.success) {
          throw new Error(json.error ?? 'Failed to load page data');
        }

        if (json.data?.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
        if (json.data?.cleanTree) {
          setCleanTree({ ...defaultCleanTreeContent, ...json.data.cleanTree });
        }
        if (json.data?.disaster) {
          setDisaster({ ...defaultDisasterContent, ...json.data.disaster });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load page data';
        setLoadError(message);
        toast.error(message);
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  const handleSave = useCallback(async () => {
    if (activeTab === 'seo') return;

    setLoading(true);
    const contentMap = { hero, cleanTree, disaster };
    const result = await upsertForMotherEarthSectionAction(activeTab, contentMap[activeTab]);

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save section');
    }
    setLoading(false);
  }, [activeTab, cleanTree, disaster, hero]);

  if (loadingData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 2xl:max-w-7xl">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-jost-bold text-xl sm:text-2xl md:text-3xl 2xl:text-4xl">
            For Mother Earth - Page Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage environmental storytelling sections, background images, copy, and SEO.
          </p>
        </div>
        {activeTab !== 'seo' && <SaveButton loading={loading} onClick={handleSave} />}
      </div>

      {loadError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 rounded-lg border p-3 text-sm sm:p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{loadError}</p>
        </div>
      )}

      <div className="bg-card rounded-lg border">
        <div className="flex overflow-x-auto border-b">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-jost-medium px-3 py-2.5 text-sm whitespace-nowrap transition-colors sm:px-4 sm:py-3 sm:text-base 2xl:px-6 2xl:py-4 2xl:text-lg ${
                activeTab === tab.key
                  ? 'border-primary text-primary border-b-2'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 2xl:p-8">
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <TextField
                label="Heading"
                value={hero.title}
                onChange={(title) => setHero({ ...hero, title })}
              />
              <TextField
                label="Quote"
                value={hero.quote}
                onChange={(quote) => setHero({ ...hero, quote })}
              />
              <TextField
                label="Quote Author"
                value={hero.quoteAuthor}
                onChange={(quoteAuthor) => setHero({ ...hero, quoteAuthor })}
              />
              <TextAreaField
                label="Paragraph"
                rows={6}
                value={hero.description}
                onChange={(description) => setHero({ ...hero, description })}
              />
              <ImageField
                label="Hero Background Image"
                value={hero.image}
                onChange={(image) => setHero({ ...hero, image })}
              />
            </div>
          )}

          {activeTab === 'cleanTree' && (
            <div className="space-y-4">
              <ImageField
                label="Clean Village + Tree Plantation Background Image"
                value={cleanTree.image}
                onChange={(image) => setCleanTree({ ...cleanTree, image })}
              />
              <TextField
                label="Clean Village Heading"
                value={cleanTree.cleanTitle}
                onChange={(cleanTitle) => setCleanTree({ ...cleanTree, cleanTitle })}
              />
              <TextAreaField
                label="Clean Village Paragraph"
                rows={4}
                value={cleanTree.cleanDescription}
                onChange={(cleanDescription) => setCleanTree({ ...cleanTree, cleanDescription })}
              />
              <TextField
                label="Tree Plantation Heading"
                value={cleanTree.treeTitle}
                onChange={(treeTitle) => setCleanTree({ ...cleanTree, treeTitle })}
              />
              <TextAreaField
                label="Tree Plantation Paragraph"
                rows={7}
                value={cleanTree.treeDescription}
                onChange={(treeDescription) => setCleanTree({ ...cleanTree, treeDescription })}
              />
            </div>
          )}

          {activeTab === 'disaster' && (
            <div className="space-y-4">
              <TextField
                label="Heading"
                value={disaster.title}
                onChange={(title) => setDisaster({ ...disaster, title })}
              />
              <TextAreaField
                label="Paragraph"
                rows={6}
                value={disaster.description}
                onChange={(description) => setDisaster({ ...disaster, description })}
              />
              <ImageField
                label="Disaster Background Image"
                value={disaster.image}
                onChange={(image) => setDisaster({ ...disaster, image })}
              />
            </div>
          )}

          {activeTab === 'seo' && <SeoTabPanel page={FOR_MOTHER_EARTH_SEO_PAGE} />}
        </div>
      </div>

      {activeTab !== 'seo' && (
        <div className="flex justify-end">
          <SaveButton loading={loading} onClick={handleSave} />
        </div>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-jost-medium text-sm">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-background w-full rounded-lg border px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-jost-medium text-sm">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="bg-background w-full rounded-lg border px-3 py-2 text-sm"
      />
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="font-jost-medium block text-sm">{label}</span>
      <ImageUpload value={value} onChange={onChange} />
    </div>
  );
}

function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-primary font-jost-medium text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm transition disabled:opacity-50 sm:w-auto sm:px-6 sm:text-base 2xl:px-8 2xl:py-3 2xl:text-lg"
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
}
