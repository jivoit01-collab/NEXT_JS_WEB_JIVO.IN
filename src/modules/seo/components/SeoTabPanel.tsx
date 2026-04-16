'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, Save, Search, Image as ImageIcon, Globe, Code2 } from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { ImageUpload } from '@/components/shared';
import type { SeoFormInput, TwitterCard, RobotsDirective } from '../types';

interface SeoTabPanelProps {
  /** The unique page key — e.g., "home", "about", "products". */
  page: string;
  /** Pre-filled defaults (a module's defaultSeo). Used if no DB row exists yet. */
  moduleDefault?: Partial<SeoFormInput>;
  /** Optional human label shown in the header. */
  pageLabel?: string;
}

const EMPTY: SeoFormInput = {
  metaTitle: '',
  metaDescription: '',
  keywords: [],
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterCard: 'summary_large_image',
  canonicalUrl: '',
  structuredData: null,
  robots: 'index,follow',
};

export function SeoTabPanel({ page, moduleDefault, pageLabel }: SeoTabPanelProps) {
  const [form, setForm] = useState<SeoFormInput>({ ...EMPTY, ...(moduleDefault ?? {}) });
  const [keywordsInput, setKeywordsInput] = useState('');
  const [structuredInput, setStructuredInput] = useState('');
  const [structuredError, setStructuredError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/seo/${encodeURIComponent(page)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && data.data) {
        const row = data.data;
        const next: SeoFormInput = {
          metaTitle: row.metaTitle ?? '',
          metaDescription: row.metaDescription ?? '',
          keywords: row.keywords ?? [],
          ogTitle: row.ogTitle ?? '',
          ogDescription: row.ogDescription ?? '',
          ogImage: row.ogImage ?? '',
          twitterCard: (row.twitterCard ?? 'summary_large_image') as TwitterCard,
          canonicalUrl: row.canonicalUrl ?? '',
          structuredData: row.structuredData ?? null,
          robots: (row.robots ?? 'index,follow') as RobotsDirective,
        };
        setForm(next);
        setKeywordsInput(next.keywords.join(', '));
        setStructuredInput(
          next.structuredData ? JSON.stringify(next.structuredData, null, 2) : '',
        );
      } else if (moduleDefault) {
        setForm({ ...EMPTY, ...moduleDefault });
        setKeywordsInput((moduleDefault.keywords ?? []).join(', '));
        setStructuredInput(
          moduleDefault.structuredData
            ? JSON.stringify(moduleDefault.structuredData, null, 2)
            : '',
        );
      }
    } catch {
      toast.error('Failed to load SEO');
    } finally {
      setLoading(false);
    }
  }, [page, moduleDefault]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setStructuredError(null);

    let parsedStructured: Record<string, unknown> | null = null;
    if (structuredInput.trim()) {
      try {
        parsedStructured = JSON.parse(structuredInput);
      } catch {
        setStructuredError('Structured data is not valid JSON');
        toast.error('Structured data must be valid JSON');
        return;
      }
    }

    const payload = {
      ...form,
      keywords: keywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      structuredData: parsedStructured,
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/seo/${encodeURIComponent(page)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error ?? 'Failed to save SEO');
        return;
      }
      toast.success('SEO saved', {
        description: 'Refresh the public page to see the new metadata.',
      });
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setForm({ ...EMPTY, ...(moduleDefault ?? {}) });
    setKeywordsInput((moduleDefault?.keywords ?? []).join(', '));
    setStructuredInput(
      moduleDefault?.structuredData
        ? JSON.stringify(moduleDefault.structuredData, null, 2)
        : '',
    );
    toast.info('Reverted to module defaults (not yet saved)');
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const titleLen = form.metaTitle.length;
  const descLen = (form.metaDescription ?? '').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-dashed bg-muted/30 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-jost-bold uppercase tracking-widest text-primary">
          <Search className="h-3.5 w-3.5" />
          SEO Settings
        </div>
        <h3 className="text-base font-jost-bold">
          {pageLabel ?? page} — Search & Social Metadata
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Edit how this page appears in Google, social sharing previews, and structured-data
          search features. Empty fields fall back to module defaults, then site defaults.
        </p>
      </div>

      {/* Search basics */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-jost-bold uppercase tracking-wide">Search</h4>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-title">
            Meta Title <span className="text-muted-foreground">({titleLen}/70)</span>
          </Label>
          <Input
            id="seo-title"
            value={form.metaTitle}
            onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
            placeholder="e.g. About Jivo Wellness | India's Largest Cold Press Canola Oil Seller"
            maxLength={70}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-desc">
            Meta Description <span className="text-muted-foreground">({descLen}/180)</span>
          </Label>
          <Textarea
            id="seo-desc"
            value={form.metaDescription ?? ''}
            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            placeholder="A short description shown in Google search results."
            rows={3}
            maxLength={180}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-keywords">Keywords (comma-separated)</Label>
          <Input
            id="seo-keywords"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            placeholder="cold press oil, canola oil, jivo wellness"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seo-canonical">Canonical URL</Label>
            <Input
              id="seo-canonical"
              value={form.canonicalUrl ?? ''}
              onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
              placeholder="https://jivo.in/about"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-robots">Robots</Label>
            <Select
              value={form.robots}
              onValueChange={(v) => setForm({ ...form, robots: v as RobotsDirective })}
            >
              <SelectTrigger id="seo-robots">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index,follow">Index + Follow (default)</SelectItem>
                <SelectItem value="index,nofollow">Index, no-follow</SelectItem>
                <SelectItem value="noindex,follow">No-index, follow</SelectItem>
                <SelectItem value="noindex,nofollow">No-index, no-follow</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Open Graph / Twitter */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-jost-bold uppercase tracking-wide">Social Sharing</h4>
        </div>

        <div className="space-y-2">
          <Label htmlFor="og-title">OG Title</Label>
          <Input
            id="og-title"
            value={form.ogTitle ?? ''}
            onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
            placeholder="Falls back to Meta Title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="og-desc">OG Description</Label>
          <Textarea
            id="og-desc"
            value={form.ogDescription ?? ''}
            onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
            placeholder="Falls back to Meta Description"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>OG Image (1200×630 recommended)</Label>
          <ImageUpload
            value={form.ogImage ?? ''}
            onChange={(url) => setForm({ ...form, ogImage: url })}
            onRemove={() => setForm({ ...form, ogImage: '' })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter-card">Twitter Card</Label>
          <Select
            value={form.twitterCard}
            onValueChange={(v) => setForm({ ...form, twitterCard: v as TwitterCard })}
          >
            <SelectTrigger id="twitter-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Structured data */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-jost-bold uppercase tracking-wide">
            JSON-LD Structured Data
          </h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Optional. Paste a JSON-LD object — schema.org wrapper is added automatically. Used
          for rich-result eligibility (FAQ, Article, Product, Organization, …).
        </p>
        <Textarea
          value={structuredInput}
          onChange={(e) => setStructuredInput(e.target.value)}
          placeholder='{ "@type": "Organization", "name": "Jivo Wellness" }'
          rows={8}
          className="font-mono text-xs"
        />
        {structuredError && (
          <p className="text-xs text-destructive">{structuredError}</p>
        )}
      </section>

      {/* Action bar */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button variant="outline" onClick={handleResetToDefaults} disabled={saving}>
          Reset to defaults
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save SEO
        </Button>
      </div>
    </div>
  );
}
