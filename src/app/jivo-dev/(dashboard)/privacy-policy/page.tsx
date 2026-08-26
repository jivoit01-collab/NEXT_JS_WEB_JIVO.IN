'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/admin';
import { SeoTabPanel } from '@/modules/seo';
import { upsertPrivacyPolicySectionAction } from '@/modules/privacy-policy/actions';
import type { PrivacyHeroContent, PrivacyBodyContent } from '@/modules/privacy-policy/types';
import { defaultHeroContent, defaultBodyContent } from '@/modules/privacy-policy/data/defaults';

type ContentTabKey = 'hero' | 'body';
type TabKey = ContentTabKey | 'seo';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'body', label: 'Body' },
  { key: 'seo', label: 'SEO' },
];

const inputClass = 'w-full rounded-lg border bg-background px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-sm font-jost-medium';

export default function PrivacyPolicyManager() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'seo' ? 'seo' : 'hero',
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [hero, setHero] = useState<PrivacyHeroContent>(defaultHeroContent);
  const [body, setBody] = useState<PrivacyBodyContent>(defaultBodyContent);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/privacy-policy');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.hero) setHero({ ...defaultHeroContent, ...json.data.hero });
          if (json.data.body) setBody({ ...defaultBodyContent, ...json.data.body });
        }
      } catch (err) {
        console.error('[PrivacyPolicyManager.load]', err);
        toast.error('Failed to load page data');
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  const handleSave = useCallback(async () => {
    if (activeTab === 'seo') return;
    setLoading(true);
    const content = activeTab === 'hero' ? hero : body;
    const result = await upsertPrivacyPolicySectionAction(activeTab, content);
    if (result.success) {
      toast.success('Section updated!');
    } else if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
      const details = Object.entries(result.fieldErrors)
        .map(([field, msgs]) => `${field}: ${(msgs ?? []).join(', ')}`)
        .join(' | ');
      toast.error(`${result.error || 'Validation failed'} — ${details}`);
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setLoading(false);
  }, [activeTab, hero, body]);

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
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-jost-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-6"
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-jost-bold text-xl sm:text-2xl md:text-3xl">
            Privacy Policy — Page Manager
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage the Privacy Policy page sections
          </p>
        </div>
        {activeTab !== 'seo' && saveButton}
      </div>

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
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={hero.heading}
                  onChange={(e) => setHero({ ...hero, heading: e.target.value })}
                  className={inputClass}
                  placeholder="PRIVACY POLICY"
                />
              </div>
              <div>
                <label className={labelClass}>Intro paragraph</label>
                <textarea
                  value={hero.intro}
                  onChange={(e) => setHero({ ...hero, intro: e.target.value })}
                  rows={3}
                  className={inputClass}
                  placeholder="Jivo Wellness Pvt. Ltd. respects & understands the importance of privacy..."
                />
              </div>
              <div>
                <label className={labelClass}>Logo image (centered top)</label>
                <ImageUpload
                  value={hero.logoImage}
                  onChange={(url) => setHero({ ...hero, logoImage: url })}
                />
              </div>
              <div>
                <label className={labelClass}>Illustration (right side)</label>
                <ImageUpload value={hero.image} onChange={(url) => setHero({ ...hero, image: url })} />
              </div>
            </div>
          )}

          {/* ── Body Tab ───────────────────────────── */}
          {activeTab === 'body' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Content blocks ({body.blocks.length})</label>
                <button
                  type="button"
                  onClick={() =>
                    setBody({ ...body, blocks: [...body.blocks, { heading: '', body: '' }] })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-jost-medium transition hover:bg-accent"
                >
                  <Plus className="h-3.5 w-3.5" /> Add block
                </button>
              </div>

              {body.blocks.map((block, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-jost-medium">Block {i + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setBody({ ...body, blocks: body.blocks.filter((_, idx) => idx !== i) })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs text-destructive transition hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Heading (optional — leave empty for a lead paragraph)
                    </label>
                    <input
                      type="text"
                      value={block.heading}
                      onChange={(e) => {
                        const next = [...body.blocks];
                        next[i] = { ...next[i], heading: e.target.value };
                        setBody({ ...body, blocks: next });
                      }}
                      className={inputClass}
                      placeholder="EMBEDDED CONTENT FROM OTHER WEBSITES"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Body</label>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Separate paragraphs with a blank line.
                    </p>
                    <textarea
                      value={block.body}
                      onChange={(e) => {
                        const next = [...body.blocks];
                        next[i] = { ...next[i], body: e.target.value };
                        setBody({ ...body, blocks: next });
                      }}
                      rows={5}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'seo' && <SeoTabPanel page="privacy-policy" />}
        </div>
      </div>

      {activeTab !== 'seo' && <div className="flex justify-stretch sm:justify-end">{saveButton}</div>}
    </div>
  );
}
