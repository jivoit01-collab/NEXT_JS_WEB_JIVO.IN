'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Crop as CropIcon,
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  RotateCw,
  Square,
  Circle,
  X,
  Check,
  Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zero-dependency, canvas-based basic image editor.
 *
 * Simple by design: crop (free drag + aspect presets + circle), flip, 90°
 * rotate, and frame shapes/borders. No filters, colour grading, or advanced
 * tools.
 *
 * Model: the preview shows the FULL flipped/rotated/zoomed image with an
 * interactive crop rectangle overlaid on top — the user drags the box to move
 * it and drags corner/edge handles to resize it (aspect-locked when a preset is
 * chosen, free otherwise). The crop is only baked in on "Apply Changes", which
 * re-renders the output from the ORIGINAL image + current edit state, so nothing
 * is ever cumulatively degraded and "Reset" just clears the state.
 *
 * Output is a PNG `Blob` handed back via `onApply(blob)`.
 */

type AspectKey = 'free' | '1:1' | '4:5' | '4:3' | '16:9' | 'circle';
type FrameKey = 'none' | 'square' | 'rounded' | 'circle' | 'thin' | 'thick';

const ASPECTS: { key: AspectKey; label: string; ratio: number | null; circle?: boolean }[] = [
  { key: 'free', label: 'Free', ratio: null },
  { key: '1:1', label: 'Square', ratio: 1 },
  { key: '4:5', label: 'Portrait', ratio: 4 / 5 },
  { key: '4:3', label: 'Landscape', ratio: 4 / 3 },
  { key: '16:9', label: 'Wide', ratio: 16 / 9 },
  { key: 'circle', label: 'Circle', ratio: 1, circle: true },
];

const FRAMES: { key: FrameKey; label: string }[] = [
  { key: 'none', label: 'No Frame' },
  { key: 'square', label: 'Square' },
  { key: 'rounded', label: 'Rounded' },
  { key: 'circle', label: 'Circle' },
  { key: 'thin', label: 'Thin Border' },
  { key: 'thick', label: 'Thick Border' },
];

/** Crop rectangle in NORMALIZED coords (0..1) of the displayed (rotated) image. */
interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };
const MIN_CROP = 0.06; // smallest crop as a fraction, so it can't collapse

type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

interface Props {
  src: string;
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}

export function ImageEditor({ src, onApply, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [aspect, setAspect] = useState<AspectKey>('free');
  const [crop, setCrop] = useState<CropRect>(FULL_CROP);
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [frame, setFrame] = useState<FrameKey>('none');
  const [busy, setBusy] = useState(false);

  const aspectDef = useMemo(() => ASPECTS.find((a) => a.key === aspect)!, [aspect]);
  const lockedRatio = aspectDef.ratio; // null = free

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);

  const resetAll = useCallback(() => {
    setAspect('free');
    setCrop(FULL_CROP);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setFrame('none');
  }, []);

  const rotateLeft = useCallback(() => setRotation((d) => (d + 270) % 360), []);
  const rotateRight = useCallback(() => setRotation((d) => (d + 90) % 360), []);

  // ── The full image rendered to the preview canvas (WITHOUT the crop baked
  //    in) so the crop box can be dragged over it. Returns display metrics. ──
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 }); // displayed image px in the canvas

  const drawFullPreview = useCallback(
    (canvas: HTMLCanvasElement, maxSize: number) => {
      const img = imgRef.current;
      if (!img) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const swap = rotation === 90 || rotation === 270;
      const natW = swap ? img.naturalHeight : img.naturalWidth;
      const natH = swap ? img.naturalWidth : img.naturalHeight;

      const scale = Math.min(1, maxSize / Math.max(natW, natH));
      const dispW = Math.max(1, Math.round(natW * scale));
      const dispH = Math.max(1, Math.round(natH * scale));
      canvas.width = dispW;
      canvas.height = dispH;
      setBox({ w: dispW, h: dispH });

      ctx.clearRect(0, 0, dispW, dispH);
      ctx.save();
      ctx.translate(dispW / 2, dispH / 2);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      // Draw original centred; rotate swaps handled by drawing natural size.
      const dw = swap ? dispH : dispW;
      const dh = swap ? dispW : dispH;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    },
    [rotation, flipH, flipV, zoom],
  );

  useEffect(() => {
    if (!loaded || !previewRef.current) return;
    drawFullPreview(previewRef.current, 640);
  }, [loaded, drawFullPreview]);

  // ── Interactive crop overlay drag ─────────────────────────────
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    crop: CropRect;
  } | null>(null);

  const onHandleDown = useCallback(
    (handle: Handle) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = { handle, startX: e.clientX, startY: e.clientY, crop };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [crop],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      const overlay = overlayRef.current;
      if (!d || !overlay) return;
      const rect = overlay.getBoundingClientRect();
      const dx = (e.clientX - d.startX) / rect.width;
      const dy = (e.clientY - d.startY) / rect.height;
      setCrop(() => resizeCrop(d.crop, d.handle, dx, dy, lockedRatio, box.w / Math.max(1, box.h)));
    },
    [lockedRatio, box.w, box.h],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Choosing an aspect preset re-fits a centred crop of that ratio.
  const applyAspect = useCallback(
    (key: AspectKey) => {
      setAspect(key);
      const def = ASPECTS.find((a) => a.key === key)!;
      if (def.ratio == null) {
        setCrop(FULL_CROP);
        return;
      }
      const boxRatio = box.w / Math.max(1, box.h);
      setCrop(centredCrop(def.ratio, boxRatio));
    },
    [box.w, box.h],
  );

  // ── Bake the crop into the output on Apply ────────────────────
  const drawOutput = useCallback(
    (canvas: HTMLCanvasElement, maxSize: number): { w: number; h: number } | null => {
      const img = imgRef.current;
      if (!img) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const swap = rotation === 90 || rotation === 270;
      const natW = swap ? img.naturalHeight : img.naturalWidth;
      const natH = swap ? img.naturalWidth : img.naturalHeight;

      const cropW = crop.w * natW;
      const cropH = crop.h * natH;
      const scale = Math.min(1, maxSize / Math.max(cropW, cropH));
      const outW = Math.max(1, Math.round(cropW * scale));
      const outH = Math.max(1, Math.round(cropH * scale));
      canvas.width = outW;
      canvas.height = outH;

      ctx.clearRect(0, 0, outW, outH);
      ctx.save();

      const wantCircle = aspectDef.circle || frame === 'circle';
      if (wantCircle) {
        ctx.beginPath();
        ctx.ellipse(outW / 2, outH / 2, outW / 2, outH / 2, 0, 0, Math.PI * 2);
        ctx.clip();
      } else if (frame === 'rounded') {
        roundRectPath(ctx, 0, 0, outW, outH, Math.min(outW, outH) * 0.12);
        ctx.clip();
      }

      ctx.translate(outW / 2, outH / 2);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const fullW = natW * scale;
      const fullH = natH * scale;
      const cropCX = (crop.x + crop.w / 2) * fullW;
      const cropCY = (crop.y + crop.h / 2) * fullH;
      const imgW = swap ? fullH : fullW;
      const imgH = swap ? fullW : fullH;
      ctx.drawImage(img, -cropCX, -cropCY, imgW, imgH);

      ctx.restore();
      drawFrameBorder(ctx, frame, outW, outH, wantCircle);
      return { w: outW, h: outH };
    },
    [crop, rotation, flipH, flipV, zoom, frame, aspectDef],
  );

  const handleApply = useCallback(() => {
    if (!imgRef.current) return;
    setBusy(true);
    const out = document.createElement('canvas');
    const dims = drawOutput(out, 2000);
    if (!dims) {
      setBusy(false);
      return;
    }
    out.toBlob(
      (blob) => {
        setBusy(false);
        if (blob) onApply(blob);
      },
      'image/png',
      0.95,
    );
  }, [drawOutput, onApply]);

  const wantCircleUI = aspectDef.circle || frame === 'circle';

  // Crop-box position in CSS % of the overlay (which sits exactly over the img).
  const cropStyle = useMemo(
    () => ({
      left: `${crop.x * 100}%`,
      top: `${crop.y * 100}%`,
      width: `${crop.w * 100}%`,
      height: `${crop.h * 100}%`,
    }),
    [crop],
  );

  const btn =
    'inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed';
  const chip = (active: boolean) =>
    cn(
      'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
      active
        ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
        : 'border-border hover:bg-accent',
    );
  const handleCls =
    'absolute h-3 w-3 rounded-full border-2 border-green-500 bg-white shadow';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit image"
    >
      <div className="bg-background flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold sm:text-base">Edit image</h2>
          <button type="button" onClick={onCancel} aria-label="Close editor" className={btn}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 lg:flex-row">
          {/* Preview + crop overlay */}
          <div className="flex flex-1 items-center justify-center rounded-lg bg-[repeating-conic-gradient(#00000010_0deg_90deg,transparent_90deg_180deg)] bg-[length:20px_20px] p-3">
            {loaded ? (
              <div className="relative inline-block max-h-[54dvh] max-w-full">
                <canvas ref={previewRef} className="block max-h-[54dvh] max-w-full rounded-md" />
                {/* Overlay sits exactly over the canvas. */}
                <div
                  ref={overlayRef}
                  className="absolute inset-0"
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                >
                  {/* Dim outside the crop with a big box-shadow trick. */}
                  <div
                    className={cn(
                      'absolute cursor-move border-2 border-green-500',
                      wantCircleUI ? 'rounded-full' : 'rounded-sm',
                    )}
                    style={{
                      ...cropStyle,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
                    }}
                    onPointerDown={onHandleDown('move')}
                  >
                    {/* rule-of-thirds guides */}
                    {!wantCircleUI && (
                      <>
                        <span className="pointer-events-none absolute top-0 left-1/3 h-full w-px bg-white/40" />
                        <span className="pointer-events-none absolute top-0 left-2/3 h-full w-px bg-white/40" />
                        <span className="pointer-events-none absolute top-1/3 left-0 h-px w-full bg-white/40" />
                        <span className="pointer-events-none absolute top-2/3 left-0 h-px w-full bg-white/40" />
                      </>
                    )}
                    {/* corner + edge handles */}
                    <span className={cn(handleCls, '-top-1.5 -left-1.5 cursor-nwse-resize')} onPointerDown={onHandleDown('nw')} />
                    <span className={cn(handleCls, '-top-1.5 -right-1.5 cursor-nesw-resize')} onPointerDown={onHandleDown('ne')} />
                    <span className={cn(handleCls, '-bottom-1.5 -left-1.5 cursor-nesw-resize')} onPointerDown={onHandleDown('sw')} />
                    <span className={cn(handleCls, '-right-1.5 -bottom-1.5 cursor-nwse-resize')} onPointerDown={onHandleDown('se')} />
                    {lockedRatio == null && (
                      <>
                        <span className={cn(handleCls, '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize')} onPointerDown={onHandleDown('n')} />
                        <span className={cn(handleCls, '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize')} onPointerDown={onHandleDown('s')} />
                        <span className={cn(handleCls, '-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize')} onPointerDown={onHandleDown('w')} />
                        <span className={cn(handleCls, '-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize')} onPointerDown={onHandleDown('e')} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Loading…</p>
            )}
          </div>

          {/* Controls */}
          <div className="w-full shrink-0 space-y-4 lg:w-64">
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CropIcon className="h-3.5 w-3.5" /> Crop
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {ASPECTS.map((a) => (
                  <button key={a.key} type="button" onClick={() => applyAspect(a.key)} className={chip(aspect === a.key)}>
                    {a.label}
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground/70 mt-2 text-xs">
                Drag the box to move it, or drag a handle to resize. Free lets you crop any
                shape; presets lock the ratio.
              </p>
              <div className="mt-3">
                <label className="text-muted-foreground mb-1 block text-xs">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setCrop(FULL_CROP);
                  setAspect('free');
                  setZoom(1);
                }}
                className={cn(btn, 'mt-2 w-full')}
              >
                <Undo2 className="h-3.5 w-3.5" /> Reset crop
              </button>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Flip &amp; Rotate</h3>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => setFlipH((v) => !v)} className={cn(btn, flipH && 'bg-accent')}>
                  <FlipHorizontal2 className="h-3.5 w-3.5" /> Flip H
                </button>
                <button type="button" onClick={() => setFlipV((v) => !v)} className={cn(btn, flipV && 'bg-accent')}>
                  <FlipVertical2 className="h-3.5 w-3.5" /> Flip V
                </button>
                <button type="button" onClick={rotateLeft} className={btn}>
                  <RotateCcw className="h-3.5 w-3.5" /> Left
                </button>
                <button type="button" onClick={rotateRight} className={btn}>
                  <RotateCw className="h-3.5 w-3.5" /> Right
                </button>
              </div>
              <button type="button" onClick={() => setRotation(0)} className={cn(btn, 'mt-1.5 w-full')}>
                <Undo2 className="h-3.5 w-3.5" /> Reset rotation
              </button>
            </section>

            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Square className="h-3.5 w-3.5" /> Frames
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {FRAMES.map((f) => (
                  <button key={f.key} type="button" onClick={() => setFrame(f.key)} className={chip(frame === f.key)}>
                    {f.key === 'circle' ? <Circle className="mr-1 inline h-3 w-3" /> : null}
                    {f.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
          <button type="button" onClick={resetAll} className={btn}>
            <Undo2 className="h-4 w-4" /> Reset
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className={btn}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={busy || !loaded}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> {busy ? 'Applying…' : 'Apply Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── crop geometry ───────────────────────────────────────────────
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Largest centred crop of the given ratio (w/h in display px) inside 0..1. */
function centredCrop(ratio: number, boxRatio: number): CropRect {
  // ratio and boxRatio are both width/height in DISPLAY pixels. Convert the
  // desired display-ratio into normalized crop dimensions.
  let w = 1;
  let h = 1;
  const target = ratio / boxRatio; // normalized w/h
  if (target >= 1) h = 1 / target;
  else w = target;
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

/**
 * Resize/move a crop given a handle drag (dx, dy in normalized overlay coords).
 * When `ratio` is set (aspect preset), width/height stay locked to it; free
 * mode moves each edge independently. All results are clamped to 0..1 and to a
 * minimum size.
 */
function resizeCrop(
  start: CropRect,
  handle: Handle,
  dx: number,
  dy: number,
  ratio: number | null,
  boxRatio: number,
): CropRect {
  const c = { ...start };

  if (handle === 'move') {
    c.x = clamp(start.x + dx, 0, 1 - start.w);
    c.y = clamp(start.y + dy, 0, 1 - start.h);
    return c;
  }

  // Free resize: adjust the dragged edges.
  let { x, y, w, h } = start;
  const right = x + w;
  const bottom = y + h;

  if (handle.includes('w')) {
    const nx = clamp(x + dx, 0, right - MIN_CROP);
    w = right - nx;
    x = nx;
  }
  if (handle.includes('e')) {
    w = clamp(w + dx, MIN_CROP, 1 - x);
  }
  if (handle.includes('n')) {
    const ny = clamp(y + dy, 0, bottom - MIN_CROP);
    h = bottom - ny;
    y = ny;
  }
  if (handle.includes('s')) {
    h = clamp(h + dy, MIN_CROP, 1 - y);
  }

  if (ratio != null) {
    // Keep the DISPLAY aspect fixed: normalized ratio = ratio / boxRatio.
    const normRatio = ratio / boxRatio; // w/h in normalized space
    // Recompute one dimension from the other, anchored at the dragged corner.
    if (handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se') {
      // corner: derive h from w
      h = w / normRatio;
      // clamp h within bounds, then re-derive w if needed
      if (handle.includes('n')) y = bottom - h;
      if (y < 0) {
        y = 0;
        h = bottom;
        w = h * normRatio;
        if (handle.includes('w')) x = right - w;
      }
      if (y + h > 1) {
        h = 1 - y;
        w = h * normRatio;
        if (handle.includes('w')) x = right - w;
      }
      if (x < 0) {
        x = 0;
      }
      if (x + w > 1) {
        w = 1 - x;
        h = w / normRatio;
      }
    }
  }

  return {
    x: clamp(x, 0, 1),
    y: clamp(y, 0, 1),
    w: clamp(w, MIN_CROP, 1),
    h: clamp(h, MIN_CROP, 1),
  };
}

// ── canvas frame helpers ────────────────────────────────────────
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFrameBorder(
  ctx: CanvasRenderingContext2D,
  frame: FrameKey,
  w: number,
  h: number,
  circle: boolean,
) {
  if (frame === 'none') return;
  const thickness =
    frame === 'thick'
      ? Math.max(6, Math.min(w, h) * 0.05)
      : frame === 'thin'
        ? Math.max(2, Math.min(w, h) * 0.015)
        : 0;
  if (thickness === 0 && frame !== 'square' && frame !== 'rounded' && frame !== 'circle') return;

  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = thickness || Math.max(3, Math.min(w, h) * 0.02);
  const inset = ctx.lineWidth / 2;

  if (circle || frame === 'circle') {
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2 - inset, h / 2 - inset, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (frame === 'rounded') {
    roundRectPath(ctx, inset, inset, w - ctx.lineWidth, h - ctx.lineWidth, Math.min(w, h) * 0.12);
    ctx.stroke();
  } else {
    ctx.strokeRect(inset, inset, w - ctx.lineWidth, h - ctx.lineWidth);
  }
  ctx.restore();
}
