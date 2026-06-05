'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import { upsertTheJivoCapitalSectionAction } from '@/modules/our-essence/the-jivo-capital/actions';
import { THE_JIVO_CAPITAL_SEO_PAGE } from '@/modules/our-essence/the-jivo-capital/constants';
import {
  defaultHeroContent,
  defaultOilPlantContent,
  defaultWaterPlantContent,
} from '@/modules/our-essence/the-jivo-capital/data/defaults';
import type {
  TheJivoCapitalHeroContent,
  TheJivoCapitalPlantContent,
  TheJivoCapitalSectionKey,
} from '@/modules/our-essence/the-jivo-capital/types';

type TabKey = TheJivoCapitalSectionKey | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'oilPlant', label: 'Oil Plant' },
  { key: 'waterPlant', label: 'Water Plant' },
  { key: 'seo', label: 'SEO' },
];

interface ApiResponse {
  success: boolean;
  data?: {
    hero?: Partial<TheJivoCapitalHeroContent>;
    oilPlant?: Partial<TheJivoCapitalPlantContent>;
    waterPlant?: Partial<TheJivoCapitalPlantContent>;
  };
  error?: string;
}

export default function TheJivoCapitalManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [hero, setHero] = useState<TheJivoCapitalHeroContent>(defaultHeroContent);
  const [oilPlant, setOilPlant] =
    useState<TheJivoCapitalPlantContent>(defaultOilPlantContent);
  const [waterPlant, setWaterPlant] =
    useState<TheJivoCapitalPlantContent>(defaultWaterPlantContent);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/our-essence/the-jivo-capital', {
          cache: 'no-store',
        });
        const json = (await res.json()) as ApiResponse;

        if (!json.success) {
          throw new Error(json.error ?? 'Failed to load page data');
        }

        if (json.data?.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
        if (json.data?.oilPlant) {
          setOilPlant({ ...defaultOilPlantContent, ...json.data.oilPlant });
        }
        if (json.data?.waterPlant) {
          setWaterPlant({ ...defaultWaterPlantContent, ...json.data.waterPlant });
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
    const contentMap = { hero, oilPlant, waterPlant };
    const result = await upsertTheJivoCapitalSectionAction(activeTab, contentMap[activeTab]);

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save section');
    }
    setLoading(false);
  }, [activeTab, hero, oilPlant, waterPlant]);

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
            The Jivo Capital - Page Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage the plant hero, oil packaging section, water combi plant section, and SEO.
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
              <TextAreaField
                label="Paragraph"
                rows={5}
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

          {activeTab === 'oilPlant' && (
            <PlantEditor
              value={oilPlant}
              imageLabel="Oil Plant Background Image"
              onChange={setOilPlant}
            />
          )}

          {activeTab === 'waterPlant' && (
            <PlantEditor
              value={waterPlant}
              imageLabel="Water Plant Background Image"
              onChange={setWaterPlant}
            />
          )}

          {activeTab === 'seo' && <SeoTabPanel page={THE_JIVO_CAPITAL_SEO_PAGE} />}
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

function PlantEditor({
  value,
  imageLabel,
  onChange,
}: {
  value: TheJivoCapitalPlantContent;
  imageLabel: string;
  onChange: (value: TheJivoCapitalPlantContent) => void;
}) {
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={value.title} onChange={(title) => onChange({ ...value, title })} />
      <TextAreaField
        label="Paragraph"
        rows={6}
        value={value.description}
        onChange={(description) => onChange({ ...value, description })}
      />
      <label className="block space-y-1.5">
        <span className="font-jost-medium text-sm">Text Alignment</span>
        <select
          value={value.align}
          onChange={(event) =>
            onChange({ ...value, align: event.target.value as TheJivoCapitalPlantContent['align'] })
          }
          className="bg-background w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="left">Left / Bottom</option>
          <option value="right">Right / Top</option>
        </select>
      </label>
      <ImageField label={imageLabel} value={value.image} onChange={(image) => onChange({ ...value, image })} />
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
