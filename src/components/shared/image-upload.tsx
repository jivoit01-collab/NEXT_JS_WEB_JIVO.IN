'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { isExternalImageSrc } from './safe-image';
import {
  Upload,
  X,
  Loader2,
  ImagePlus,
  Copy,
  Check,
  ClipboardPaste,
  Pencil,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageEditor } from './image-editor';

/**
 * Copy text to the clipboard. Works on both HTTPS (production) and HTTP
 * (localhost dev) — the admin panel runs on plain http://localhost, where
 * `navigator.clipboard` is unavailable, so we fall back to a hidden textarea.
 * Mirrors the pattern in `src/modules/seo/components/SeoTabPanel.tsx`.
 */
function copyText(text: string): void {
  const fallback = () => {
    const el = document.createElement('textarea');
    el.value = text;
    Object.assign(el.style, { position: 'fixed', opacity: '0', pointerEvents: 'none' });
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };
  if (navigator.clipboard && window.isSecureContext) {
    void navigator.clipboard.writeText(text).catch(fallback);
  } else {
    fallback();
  }
}

/**
 * Read the clipboard. Unlike WRITING, reading has no reliable http-localhost
 * fallback (`execCommand('paste')` is blocked in modern browsers and there is no
 * secure-context bypass). Returns the text on success, or `null` when the browser
 * denies access — the caller then tells the user to paste manually (Ctrl+V).
 */
async function readClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard?.readText && window.isSecureContext) {
      return await navigator.clipboard.readText();
    }
  } catch {
    // permission denied or unavailable — fall through
  }
  return null;
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  /** When true, an empty value shows a red "Image is required" message. */
  required?: boolean;
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

/**
 * A fill-cover thumbnail. Uses next/image for local uploads (optimized), but an
 * external pasted URL (http/https/data) isn't from a whitelisted host, so
 * next/image would throw "hostname not configured" — those render with a plain
 * <img> instead, which has no host restriction.
 */
function Thumb({ value, alt }: { value: string; alt: string }) {
  const resolved = toSrc(value);
  if (isExternalImageSrc(resolved)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={resolved} alt={alt} className="block h-full w-full rounded-lg object-contain" />
    );
  }
  // The box is a FIXED size (set on the wrapper); `object-contain` scales any
  // image — tall or wide — to fit INSIDE without stretching the box. So a large
  // portrait upload no longer makes the card grow taller than its neighbours.
  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes="256px"
      className="rounded-lg object-contain"
    />
  );
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
  // NEVER delete the shared fallback: placeholder.png is the default for every
  // unset image field across the whole site — removing it would break them all.
  // Guarding here covers every caller (remove button, replace, multi-upload).
  if (!filename || filename === 'placeholder.png') return;
  await fetch('/api/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
}

/**
 * The reusable image identifier shown beside every image field.
 *
 * Images are stored as a bare filename (e.g. "abc123.webp"), and every image
 * field uses that same string. So copying this value from one field and pasting
 * it into another makes both reference the SAME uploaded file — reuse without a
 * second upload, no duplicate on the server. Typing/pasting only calls onChange;
 * it never deletes the file (removal stays on the thumbnail's X button).
 */
function ImageUrlField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [pasteHint, setPasteHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = !isPlaceholderOrEmpty(value);

  const handleCopy = useCallback(() => {
    if (!value) return;
    copyText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const handlePaste = useCallback(async () => {
    const text = await readClipboard();
    if (text !== null) {
      onChange(text.trim());
      setPasteHint(false);
    } else {
      // Clipboard read blocked (e.g. http localhost) — focus the box so the
      // user can paste manually with Ctrl+V, and show a one-time hint.
      inputRef.current?.focus();
      setPasteHint(true);
      window.setTimeout(() => setPasteHint(false), 3000);
    }
  }, [onChange]);

  return (
    <div className="space-y-1.5">
      {/* URL chip: link icon · truncating input · icon-only copy button, all in
          one rounded pill (matches the reference). Long values ellipsize; the
          field scrolls so the full value stays reachable. */}
      <div className="border-border bg-background flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5">
        <Link2 className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="image name or URL"
          spellCheck={false}
          title={value || undefined}
          className="min-w-0 flex-1 truncate bg-transparent text-xs outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasValue}
          aria-label="Copy image name"
          className="text-muted-foreground shrink-0 rounded p-0.5 transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Only Paste here — Copy already lives inside the URL chip above.
          Full-width pill. */}
      <button
        type="button"
        onClick={handlePaste}
        aria-label="Paste image name"
        className="border-border inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-accent"
      >
        <ClipboardPaste className="h-3.5 w-3.5" />
        Paste
      </button>
      {pasteHint && (
        <p className="text-muted-foreground/70 text-[0.7rem]">Press Ctrl+V in the box to paste.</p>
      )}
    </div>
  );
}

// ── Single Image Upload ─────────────────────────────────────────
export function ImageUpload({ value, onChange, onRemove, className, required }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Select → preview → (upload | edit) flow. After picking a file we hold it
  // locally and show a preview with Upload/Edit — nothing uploads automatically.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  // When editing an ALREADY-UPLOADED image in place, we edit its /api/uploads
  // source directly and, on successful re-upload, delete the old file so we
  // don't accumulate orphans on the server.
  const [editExisting, setEditExisting] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Derive the object URL synchronously from the pending file (no setState),
  // and revoke it on change/unmount via a cleanup-only effect.
  const pendingUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : ''),
    [pendingFile],
  );
  useEffect(() => {
    if (!pendingUrl) return;
    return () => URL.revokeObjectURL(pendingUrl);
  }, [pendingUrl]);

  const clearPending = useCallback(() => {
    setPendingFile(null);
    setEditExisting(false);
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      setError('');
      setLoading(true);
      try {
        // Capture the previous file BEFORE onChange so we can delete it after a
        // successful replace/edit-in-place (keeps net storage flat).
        const previous = value;
        const wasExisting = editExisting;
        const result = await uploadFile(file);
        if (result.success && result.data) {
          onChange(result.data.filename);
          setPendingFile(null);
          setEditExisting(false);
          // Delete the old server file only when we replaced/edited an existing
          // upload and it actually changed (never delete the placeholder).
          if (
            wasExisting &&
            previous &&
            previous !== 'placeholder.png' &&
            previous !== result.data.filename
          ) {
            void deleteFile(previous);
          }
        } else {
          setError(result.error ?? 'Upload failed');
        }
      } catch {
        setError('Upload failed');
      } finally {
        setLoading(false);
      }
    },
    [onChange, value, editExisting],
  );

  // Selecting a file does NOT upload — it stages it for preview + optional edit.
  const selectFile = useCallback((file: File) => {
    setError('');
    setPendingFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) selectFile(file);
    },
    [selectFile],
  );

  // Editor "Apply Changes" hands back an edited PNG blob; wrap it as the new
  // pending file so the user still confirms with Upload.
  const handleEditApply = useCallback(
    (blob: Blob) => {
      const base = pendingFile?.name ?? value ?? 'image';
      const name = base.replace(/\.[^.]+$/, '') + '-edited.png';
      setPendingFile(new File([blob], name, { type: 'image/png' }));
      setEditing(false);
    },
    [pendingFile, value],
  );

  // Edit the ALREADY-UPLOADED image in place: open the editor on its server
  // source. On Apply it becomes a pending file; Upload replaces + cleans up.
  const startEditExisting = useCallback(() => {
    setEditExisting(true);
    setEditing(true);
  }, []);

  // Replace: pick a NEW file for a field that already has an image. Staged for
  // preview like any pick; marked so Upload deletes the old file afterwards.
  const startReplace = useCallback((file: File) => {
    setError('');
    setEditExisting(true);
    setPendingFile(file);
  }, []);

  // Source the editor reads from: the pending file's object URL, or — when
  // editing in place with no pending file yet — the existing upload's URL.
  const editorSrc = pendingUrl || (value ? toSrc(value) : '');

  const handleRemove = useCallback(async () => {
    if (value) {
      await deleteFile(value);
      onRemove?.();
      onChange('');
    }
  }, [value, onRemove, onChange]);

  // ── Pending preview: a file has been selected but not yet uploaded. Show it
  //    with Upload / Edit — the original is never uploaded automatically. ──
  if (pendingFile && pendingUrl) {
    return (
      <>
        {editing && (
          <ImageEditor
            src={editorSrc}
            onApply={handleEditApply}
            onCancel={() => setEditing(false)}
          />
        )}
        <div className={cn('bg-card w-full max-w-64 space-y-2.5 rounded-xl border p-3 shadow-sm', className)}>
          <div className="bg-muted/30 relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg">
            {/* Fixed square box; object-contain scales the pending image to fit
                inside instead of stretching the box to the image's height. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingUrl} alt="Preview" className="block h-full w-full rounded-lg object-contain" />
            <span className="absolute top-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[0.65rem] font-medium text-white">
              Not uploaded
            </span>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Upload (primary) full-width, then Edit | Cancel. */}
          <button
            type="button"
            onClick={() => handleUpload(pendingFile)}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {loading ? 'Uploading…' : 'Upload'}
          </button>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={loading}
              className="border-border inline-flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium transition hover:bg-accent disabled:opacity-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={clearPending}
              disabled={loading}
              className="border-border inline-flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium transition hover:bg-accent disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      </>
    );
  }

  // If a real image is uploaded (not just the seed placeholder), show preview
  // with Replace / Edit / Remove — editing works IN PLACE (no re-pick needed)
  // and, on Upload, deletes the old file so no duplicate accumulates.
  if (value && value !== 'placeholder.png') {
    return (
      <>
        {editing && (
          <ImageEditor
            src={editorSrc}
            onApply={handleEditApply}
            onCancel={() => {
              setEditing(false);
              setEditExisting(false);
            }}
          />
        )}
        {/* Compact card: image on top (hover reveals Replace/Edit), then the
            URL row + Copy/Paste. A max-width keeps cards uniform so several
            fields line up ~3 per row on a page. */}
        <div className={cn('bg-card w-full max-w-64 space-y-2.5 rounded-xl border p-3 shadow-sm', className)}>
          <div className="group bg-muted/30 relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg">
            <Thumb value={value} alt="Uploaded" />

            {/* Remove — always reachable, top-right. */}
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove image"
              className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1 text-white shadow transition hover:bg-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Hover overlay — Replace + Edit. */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => replaceInputRef.current?.click()}
                aria-label="Replace image"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black shadow transition hover:bg-white/90"
              >
                <ImagePlus className="h-3.5 w-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={startEditExisting}
                aria-label="Edit image"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black shadow transition hover:bg-white/90"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
          </div>

          <div className="border-border/60 border-t" />
          <ImageUrlField value={value} onChange={onChange} />

          <input
            ref={replaceInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) startReplace(file);
              e.target.value = '';
            }}
          />
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        'bg-card w-full max-w-64 space-y-2.5 rounded-xl border p-3 shadow-sm',
        required && 'border-red-500/60',
        className,
      )}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'mx-auto flex aspect-square w-full max-w-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors',
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
            <p className="text-muted-foreground px-2 text-center text-xs">Drag & drop or click</p>
            <p className="text-muted-foreground/60 text-[0.7rem]">JPEG, PNG, WebP · 10MB</p>
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
          if (file) selectFile(file);
          e.target.value = '';
        }}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {required && <p className="text-xs font-medium text-red-500">Image is required.</p>}

      <div className="border-border/60 border-t" />
      <ImageUrlField value={value} onChange={onChange} />
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
        const results = await Promise.all(filesToUpload.map((file) => uploadFile(file)));

        const newUrls = results.filter((r) => r.success && r.data).map((r) => r.data!.filename);

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
              className="group border-border relative h-24 w-24 overflow-hidden rounded-lg border"
            >
              <Thumb value={url} alt="Uploaded" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
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
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            ) : (
              <>
                <ImagePlus className="text-muted-foreground h-6 w-6" />
                <p className="text-muted-foreground text-xs">
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
