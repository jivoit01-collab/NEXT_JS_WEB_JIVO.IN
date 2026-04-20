'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared';
import { SeoTabPanel } from '@/modules/seo';
import {
  upsertTheStorySectionAction,
} from '@/modules/our-essence/the-story/actions';
import type {
  TheStoryHeroContent,
  TheStoryFounderContent,
  TheStoryVisionContent,
} from '@/modules/our-essence/the-story/types';
import {
  defaultHeroContent,
  defaultFounderContent,
  defaultVisionContent,
} from '@/modules/our-essence/the-story/data/defaults';

type TabKey = 'hero' | 'founder' | 'vision' | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'founder', label: 'Founder' },
  { key: 'vision', label: 'Vision' },
  { key: 'seo', label: 'SEO' },
];

export default function TheStoryManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [hero, setHero] = useState<TheStoryHeroContent>(defaultHeroContent);
  const [founder, setFounder] = useState<TheStoryFounderContent>(defaultFounderContent);
  const [vision, setVision] = useState<TheStoryVisionContent>(defaultVisionContent);

  // Load data on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/our-essence/the-story');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
          if (json.data.founder) setFounder({ ...defaultFounderContent, ...json.data.founder });
          if (json.data.vision) setVision({ ...defaultVisionContent, ...json.data.vision });
        }
      } catch (err) {
        console.error('[TheStoryManager.load]', err);
        toast.error('Failed to load page data');
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  const handleSave = useCallback(async () => {
    if (activeTab === 'seo') return; // SEO tab has its own save
    setLoading(true);

    const contentMap = { hero, founder, vision };
    const content = contentMap[activeTab as keyof typeof contentMap];

    const result = await upsertTheStorySectionAction(
      activeTab as 'hero' | 'founder' | 'vision',
      content,
    );

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setLoading(false);
  }, [activeTab, hero, founder, vision]);

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
            The Story — Page Manager
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage the Our Essence / The Story page sections
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
                  placeholder="JIVO JOURNEY"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Paragraph</label>
                <textarea
                  value={hero.paragraph}
                  onChange={(e) => setHero({ ...hero, paragraph: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="Inspired by Baba Iqbal Singh ji's vision..."
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

          {/* ── Founder Tab ────────────────────────── */}
          {activeTab === 'founder' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Section Heading</label>
                <input
                  type="text"
                  value={founder.sectionHeading}
                  onChange={(e) => setFounder({ ...founder, sectionHeading: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="FOR HUMANITY, WITH PURPOSE"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Title</label>
                <input
                  type="text"
                  value={founder.title}
                  onChange={(e) => setFounder({ ...founder, title: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="WELLNESS ROOTED IN SEVA"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Paragraph</label>
                <textarea
                  value={founder.paragraph}
                  onChange={(e) => setFounder({ ...founder, paragraph: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="Our founding father, Baba Iqbal Singh ji..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Founder Image</label>
                <ImageUpload
                  value={founder.founderImage}
                  onChange={(url) => setFounder({ ...founder, founderImage: url })}
                />
              </div>
            </div>
          )}

          {/* ── Vision Tab ─────────────────────────── */}
          {activeTab === 'vision' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Section Heading</label>
                <input
                  type="text"
                  value={vision.sectionHeading}
                  onChange={(e) => setVision({ ...vision, sectionHeading: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="WHERE PURPOSE BECOMES WELLNESS"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Title</label>
                <input
                  type="text"
                  value={vision.title}
                  onChange={(e) => setVision({ ...vision, title: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="VISION OF SEVA & GROWTH"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Left Column</label>
                <textarea
                  value={vision.leftColumn}
                  onChange={(e) => setVision({ ...vision, leftColumn: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="He envisioned that the organization..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Right Column</label>
                <textarea
                  value={vision.rightColumn}
                  onChange={(e) => setVision({ ...vision, rightColumn: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="Jivo was started to fulfill this vision..."
                />
              </div>
            </div>
          )}

          {/* ── SEO Tab ────────────────────────────── */}
          {activeTab === 'seo' && <SeoTabPanel page="our-essence-the-story" />}
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
