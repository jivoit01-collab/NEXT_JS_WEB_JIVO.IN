'use client';

import { useCallback, useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { MAX_VIDEO_UPLOAD_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  value?: string;
  onChange: (filename: string) => void;
  onRemove?: () => void;
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

function toMediaSrc(filename: string): string {
  if (!filename) return '';
  if (filename.startsWith('/') || filename.startsWith('http')) return filename;
  return `/api/uploads/${filename}`;
}

const MAX_VIDEO_UPLOAD_SIZE_MB = Math.round(MAX_VIDEO_UPLOAD_SIZE / 1024 / 1024);

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

export function VideoUpload({ value, onChange, onRemove, className }: VideoUploadProps) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setError('');
      setLoading(true);

      try {
        if (file.size > MAX_VIDEO_UPLOAD_SIZE) {
          setError(`File too large. Max size: ${MAX_VIDEO_UPLOAD_SIZE_MB}MB`);
          return;
        }

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
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragActive(false);

      const file = event.dataTransfer.files[0];
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
  }, [onChange, onRemove, value]);

  if (value) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="group relative aspect-video w-full max-w-2xl overflow-hidden rounded-lg border bg-black">
          <video
            src={toMediaSrc(value)}
            className="h-full w-full object-cover"
            controls
            preload="metadata"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remove uploaded video"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-muted-foreground text-xs break-all">{value}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors',
          dragActive
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
            : 'border-border hover:border-muted-foreground/50',
        )}
      >
        {loading ? (
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        ) : (
          <>
            <Upload className="text-muted-foreground h-8 w-8" />
            <p className="text-muted-foreground text-sm">Drag & drop or click to upload video</p>
            <p className="text-muted-foreground/60 text-xs">
              MP4, WebM, OGG (max {MAX_VIDEO_UPLOAD_SIZE_MB}MB)
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleUpload(file);
          event.target.value = '';
        }}
      />

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
