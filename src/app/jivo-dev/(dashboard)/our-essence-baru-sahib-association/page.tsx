'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload, VideoUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import { upsertBaruSahibAssociationSectionAction } from '@/modules/our-essence/baru-sahib-association/actions';
import { BARU_SAHIB_ASSOCIATION_SEO_PAGE } from '@/modules/our-essence/baru-sahib-association/constants';
import {
  heroSectionData,
  humanitySectionData,
  videoSectionData,
} from '@/modules/our-essence/baru-sahib-association/content-defaults';
import type {
  BaruSahibAssociationHeroContent,
  BaruSahibAssociationHumanityContent,
  BaruSahibAssociationSectionKey,
  BaruSahibAssociationVideoContent,
} from '@/modules/our-essence/baru-sahib-association/types';

type TabKey = BaruSahibAssociationSectionKey | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'video', label: 'Video Section' },
  { key: 'humanity', label: 'Humanity Section' },
  { key: 'seo', label: 'SEO' },
];

interface ApiResponse {
  success: boolean;
  data?: {
    hero?: Partial<BaruSahibAssociationHeroContent>;
    video?: Partial<BaruSahibAssociationVideoContent>;
    humanity?: Partial<BaruSahibAssociationHumanityContent>;
  };
  error?: string;
}

export default function BaruSahibAssociationManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [hero, setHero] = useState<BaruSahibAssociationHeroContent>(heroSectionData);
  const [video, setVideo] = useState<BaruSahibAssociationVideoContent>(videoSectionData);
  const [humanity, setHumanity] =
    useState<BaruSahibAssociationHumanityContent>(humanitySectionData);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/baru-sahib-association');
        const json = (await res.json()) as ApiResponse;

        if (!json.success) {
          throw new Error(json.error ?? 'Failed to load page data');
        }

        if (json.data?.hero) setHero({ ...heroSectionData, ...json.data.hero });
        if (json.data?.video) setVideo({ ...videoSectionData, ...json.data.video });
        if (json.data?.humanity) setHumanity({ ...humanitySectionData, ...json.data.humanity });
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
    const contentMap = { hero, video, humanity };
    const result = await upsertBaruSahibAssociationSectionAction(activeTab, contentMap[activeTab]);

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save section');
    }
    setLoading(false);
  }, [activeTab, hero, humanity, video]);

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
            Baru Sahib Association - Page Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage hero, video, humanity story, and SEO content for the Our Essence page.
          </p>
        </div>
        {activeTab !== 'seo' && (
          <button
            onClick={handleSave}
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
        )}
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

        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 2xl:p-8">
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <FieldLabel label="Title" />
              <input
                type="text"
                value={hero.title}
                onChange={(event) => setHero({ ...hero, title: event.target.value })}
                className="bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="BARU SAHIB ASSOCIATION"
              />

              <FieldLabel label="Description" />
              <textarea
                value={hero.description}
                onChange={(event) => setHero({ ...hero, description: event.target.value })}
                rows={4}
                className="bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Just as a tiny banyan seed grows..."
              />

              <FieldLabel label="Hero Image" />
              <ImageUpload value={hero.image} onChange={(image) => setHero({ ...hero, image })} />
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              <FieldLabel label="Video Upload" />
              <VideoUpload
                value={video.video}
                onChange={(uploadedVideo, meta) =>
                  setVideo({
                    ...video,
                    video: uploadedVideo,
                    videoWidth: meta?.width ?? 0,
                    videoHeight: meta?.height ?? 0,
                  })
                }
              />
              {video.videoWidth ? (
                <p className="text-muted-foreground text-xs">
                  Detected size: {video.videoWidth}×{video.videoHeight}px — used to reserve exact
                  space while loading (no layout jump).
                </p>
              ) : null}
            </div>
          )}

          {activeTab === 'humanity' && (
            <div className="space-y-4">
              <FieldLabel label="Title" />
              <input
                type="text"
                value={humanity.title}
                onChange={(event) => setHumanity({ ...humanity, title: event.target.value })}
                className="bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="BRINGING GRACE TO HUMAN RACE"
              />

              <FieldLabel label="Description" />
              <textarea
                value={humanity.description}
                onChange={(event) => setHumanity({ ...humanity, description: event.target.value })}
                rows={7}
                className="bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Baru Sahib has been working tirelessly..."
              />

              <FieldLabel label="Humanity Image" />
              <ImageUpload
                value={humanity.image}
                onChange={(image) => setHumanity({ ...humanity, image })}
              />
            </div>
          )}

          {activeTab === 'seo' && <SeoTabPanel page={BARU_SAHIB_ASSOCIATION_SEO_PAGE} />}
        </div>
      </div>

      {activeTab !== 'seo' && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
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
        </div>
      )}
    </div>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <label className="font-jost-medium block text-sm">{label}</label>;
}
