'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
}

interface UploadResponse {
  success: boolean;
  data?: {
    filename: string;
    originalName: string;
    size: number;
    width: number;
    height: number;
  };
  error?: string;
}

/** Convert a stored filename to its API-served URL */
export function toSrc(filename: string): string {
  if (!filename || filename === 'placeholder.png') return '/api/uploads/placeholder.png';
  // Already a full path (legacy or external URL) — pass through
  if (filename.startsWith('/') || filename.startsWith('http')) return filename;
  return `/api/uploads/${filename}`;
}

/** Returns true when the value is empty or just the seed placeholder — treat as "no image uploaded". */
export function isPlaceholderOrEmpty(value: string | undefined | null): boolean {
  return !value || value === 'placeholder.png';
}

async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  return res.json();
}

async function deleteFile(filename: string): Promise<void> {
  await fetch('/api/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
}

// ── Single Image Upload ─────────────────────────────────────────
export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setError('');
      setLoading(true);
      try {
        const result = await uploadFile(file);
        if (result.success && result.data) {
          onChange(result.data.filename);
        } else {
          setError(result.error ?? 'Upload failed');
        }
      } catch {
        setError('Upload failed');
      } finally {
        setLoading(false);
      }
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleRemove = useCallback(async () => {
    if (value) {
      await deleteFile(value);
      onRemove?.();
      onChange('');
    }
  }, [value, onRemove, onChange]);

  // If a real image is uploaded (not just the seed placeholder), show preview
  if (value && value !== 'placeholder.png') {
    return (
      <div className={cn('relative inline-block', className)}>
        <div className="group relative h-40 w-40 overflow-hidden rounded-lg border border-border">
          <Image
            src={toSrc(value)}
            alt="Uploaded"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors',
          dragActive
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
            : 'border-border hover:border-muted-foreground/50',
        )}
      >
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop or click to upload
            </p>
            <p className="text-xs text-muted-foreground/60">
              JPEG, PNG, WebP (max 10MB)
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ── Multi Image Upload ──────────────────────────────────────────
export function MultiImageUpload({
  value,
  onChange,
  maxImages = 5,
  className,
}: MultiImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: FileList) => {
      const remaining = maxImages - value.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remaining);
      setError('');
      setLoading(true);

      try {
        const results = await Promise.all(
          filesToUpload.map((file) => uploadFile(file)),
        );

        const newUrls = results
          .filter((r) => r.success && r.data)
          .map((r) => r.data!.filename);

        const firstError = results.find((r) => !r.success);
        if (firstError?.error) setError(firstError.error);

        if (newUrls.length > 0) {
          onChange([...value, ...newUrls]);
        }
      } catch {
        setError('Upload failed');
      } finally {
        setLoading(false);
      }
    },
    [value, onChange, maxImages],
  );

  const handleRemove = useCallback(
    async (url: string) => {
      await deleteFile(url);
      onChange(value.filter((u) => u !== url));
    },
    [value, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload],
  );

  return (
    <div className={className}>
      {/* Image previews */}
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {value.map((url) => (
            <div
              key={url}
              className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border"
            >
              <Image src={toSrc(url)} alt="Uploaded" fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {value.length < maxImages && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed transition-colors',
              dragActive
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-border hover:border-muted-foreground/50',
            )}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Add images ({value.length}/{maxImages})
                </p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files);
              }
              e.target.value = '';
            }}
          />
        </>
      )}

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
