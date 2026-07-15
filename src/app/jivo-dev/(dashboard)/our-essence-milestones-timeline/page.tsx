'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';
import { VideoUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import { MILESTONES_TIMELINE_SEO_PAGE } from '@/modules/our-essence/milestones-timeline/constants';
import { upsertMilestonesTimelineSectionAction } from '@/modules/our-essence/milestones-timeline/actions';
import { defaultVideoContent } from '@/modules/our-essence/milestones-timeline/data/defaults';
import type { MilestonesTimelineVideoContent } from '@/modules/our-essence/milestones-timeline/types';

type TabKey = 'video' | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'video', label: 'Video' },
  { key: 'seo', label: 'SEO' },
];

interface ApiResponse {
  success: boolean;
  data?: {
    video?: Partial<MilestonesTimelineVideoContent>;
  };
  error?: string;
}

export default function MilestonesTimelineManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'video',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [video, setVideo] = useState<MilestonesTimelineVideoContent>(defaultVideoContent);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/milestones-timeline');
        const json = (await res.json()) as ApiResponse;

        if (!json.success) {
          throw new Error(json.error ?? 'Failed to load page data');
        }

        if (json.data?.video) setVideo({ ...defaultVideoContent, ...json.data.video });
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
    const result = await upsertMilestonesTimelineSectionAction('video', video);

    if (result.success) {
      toast.success('Video updated!');
    } else {
      toast.error(result.error || 'Failed to save video');
    }
    setLoading(false);
  }, [activeTab, video]);

  if (loadingData) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 2xl:max-w-6xl">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-jost-bold text-xl sm:text-2xl md:text-3xl 2xl:text-4xl">
            Milestones Timeline - Page Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Upload the single full-screen timeline video. MP4, WebM, and OGG are accepted up to 400MB.
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

        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 2xl:p-8">
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <FieldLabel label="Desktop Video (landscape — e.g. 1920×1080)" />
                <VideoUpload
                  value={video.video}
                  onChange={(uploadedVideo, meta) =>
                    setVideo((prev) => ({
                      ...prev,
                      video: uploadedVideo,
                      videoWidth: meta?.width ?? 0,
                      videoHeight: meta?.height ?? 0,
                    }))
                  }
                />
                {video.videoWidth > 0 && (
                  <p className="text-muted-foreground text-xs">
                    Detected size: {video.videoWidth}×{video.videoHeight}px — used to reserve exact
                    space while loading.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel label="Mobile Video (portrait — e.g. 1080×1920)" />
                <VideoUpload
                  value={video.videoMobile}
                  onChange={(uploadedVideo, meta) =>
                    setVideo((prev) => ({
                      ...prev,
                      videoMobile: uploadedVideo,
                      videoMobileWidth: meta?.width ?? 0,
                      videoMobileHeight: meta?.height ?? 0,
                    }))
                  }
                />
                {video.videoMobileWidth > 0 && (
                  <p className="text-muted-foreground text-xs">
                    Detected size: {video.videoMobileWidth}×{video.videoMobileHeight}px
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  Shown on phones/small screens. Optional — if left empty, the desktop video
                  is used everywhere. Only one video ever loads per device (no performance cost).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'seo' && <SeoTabPanel page={MILESTONES_TIMELINE_SEO_PAGE} />}
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

function FieldLabel({ label }: { label: string }) {
  return <label className="font-jost-medium block text-sm">{label}</label>;
}