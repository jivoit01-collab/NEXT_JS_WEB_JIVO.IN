'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, Loader, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import { upsertCertificationsSectionAction } from '@/modules/our-essence/certifications-quality-standards/actions';
import type {
  CertificationsHeroContent,
  CertificationsBadgesContent,
  CertificationsFeaturedContent,
  CertificationBadge,
} from '@/modules/our-essence/certifications-quality-standards/types';
import {
  defaultHeroContent,
  defaultBadgesContent,
  defaultFeaturedContent,
} from '@/modules/our-essence/certifications-quality-standards/data/defaults';

type TabKey = 'hero' | 'badges' | 'featured' | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'badges', label: 'Badges' },
  { key: 'featured', label: 'Featured' },
  { key: 'seo', label: 'SEO' },
];

export default function CertificationsManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [hero, setHero] = useState<CertificationsHeroContent>(defaultHeroContent);
  const [badges, setBadges] = useState<CertificationsBadgesContent>(defaultBadgesContent);
  const [featured, setFeatured] = useState<CertificationsFeaturedContent>(defaultFeaturedContent);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/our-essence/certifications-quality-standards');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
          if (json.data.badges) setBadges({ ...defaultBadgesContent, ...json.data.badges });
          if (json.data.featured)
            setFeatured({ ...defaultFeaturedContent, ...json.data.featured });
        }
      } catch (err) {
        console.error('[CertificationsManager.load]', err);
        toast.error('Failed to load page data');
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  const handleSave = useCallback(async () => {
    if (activeTab === 'seo') return;
    setLoading(true);

    const contentMap = { hero, badges, featured };
    const content = contentMap[activeTab as keyof typeof contentMap];

    const result = await upsertCertificationsSectionAction(
      activeTab as 'hero' | 'badges' | 'featured',
      content,
    );

    if (result.success) {
      toast.success('Section updated!');
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setLoading(false);
  }, [activeTab, hero, badges, featured]);

  if (loadingData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 2xl:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-jost-bold text-xl sm:text-2xl md:text-3xl 2xl:text-4xl">
            Certifications &amp; Quality Standards — Page Manager
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm 2xl:text-base">
            Manage the Our Essence / Certifications &amp; Quality Standards page sections
          </p>
        </div>
        {activeTab !== 'seo' && (
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
        )}
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
                <label className="mb-1 block text-sm font-jost-medium">Heading</label>
                <input
                  type="text"
                  value={hero.heading}
                  onChange={(e) => setHero({ ...hero, heading: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="WE ARE CERTIFIED"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Subheading</label>
                <input
                  type="text"
                  value={hero.subheading}
                  onChange={(e) => setHero({ ...hero, subheading: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="TRUSTED. TESTED. CERTIFIED."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">
                  Background Image (spans the whole page)
                </label>
                <ImageUpload
                  value={hero.backgroundImage}
                  onChange={(url) => setHero({ ...hero, backgroundImage: url })}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Use a wide, high-resolution image (WebP recommended, ~200KB). This is the LCP
                  image, so keep it optimized.
                </p>
              </div>
            </div>
          )}

          {/* ── Badges Tab ─────────────────────────── */}
          {activeTab === 'badges' && (
            <BadgeList
              badges={badges.items}
              onChange={(items) => setBadges({ ...badges, items })}
            />
          )}

          {/* ── Featured Tab ───────────────────────── */}
          {activeTab === 'featured' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-jost-medium">
                <input
                  type="checkbox"
                  checked={featured.enabled}
                  onChange={(e) => setFeatured({ ...featured, enabled: e.target.checked })}
                  className="h-4 w-4 rounded border"
                />
                Show the featured badge below the grid
              </label>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Label (alt text)</label>
                <input
                  type="text"
                  value={featured.label}
                  onChange={(e) => setFeatured({ ...featured, label: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="U.S. Food & Drug Administration"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-jost-medium">Featured Badge Image</label>
                <ImageUpload
                  value={featured.image}
                  onChange={(url) => setFeatured({ ...featured, image: url })}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Transparent PNG works best — it sits on a light rounded panel.
                </p>
              </div>
            </div>
          )}

          {/* ── SEO Tab ────────────────────────────── */}
          {activeTab === 'seo' && (
            <SeoTabPanel page="our-essence-certifications-quality-standards" />
          )}
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

// ── Reorderable badge list (image + label, move up/down) ─────

interface BadgeListProps {
  badges: CertificationBadge[];
  onChange: (badges: CertificationBadge[]) => void;
}

function BadgeList({ badges, onChange }: BadgeListProps) {
  const addBadge = () => onChange([...badges, { image: '', label: '' }]);

  const removeBadge = (i: number) => {
    if (badges.length <= 1) {
      toast.error('At least one badge is required');
      return;
    }
    onChange(badges.filter((_, idx) => idx !== i));
  };

  const updateBadge = (i: number, patch: Partial<CertificationBadge>) => {
    onChange(badges.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= badges.length) return;
    const next = [...badges];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-sm font-jost-medium">Certification Badges ({badges.length})</label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Use the arrows to arrange the display order. The grid renders them in this order.
          </p>
        </div>
        <button
          type="button"
          onClick={addBadge}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-jost-medium hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add badge
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {badges.map((badge, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border bg-background/60 p-3 sm:p-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-jost-medium text-primary">
                {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Move ${badge.label || 'badge'} up`}
                  className="rounded-md border p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === badges.length - 1}
                  aria-label={`Move ${badge.label || 'badge'} down`}
                  className="rounded-md border p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBadge(i)}
                  disabled={badges.length <= 1}
                  aria-label={`Remove ${badge.label || 'badge'}`}
                  className="rounded-md border p-1.5 text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <ImageUpload
              value={badge.image}
              onChange={(url) => updateBadge(i, { image: url })}
              className="w-full"
            />

            <div>
              <label className="mb-1 block text-xs font-jost-medium">Label (alt text)</label>
              <input
                type="text"
                value={badge.label}
                onChange={(e) => updateBadge(i, { label: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="ISO 9001 Certified"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
