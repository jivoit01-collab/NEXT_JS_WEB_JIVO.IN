'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ChartPoint } from './analytics-chart';

const ACCENT = '#0a7d3f';

/**
 * Interactive line/area/bar chart with a real X axis (date/label ticks), a Y
 * axis (value scale + gridlines) and a hover tooltip. Client component so the
 * pointer can track the nearest point and show a floating tooltip + crosshair —
 * the rest of AnalyticsChart (pie/bar) stays server-rendered.
 */
export function CartesianChart({
  rows,
  height,
  type,
}: {
  rows: ChartPoint[];
  height: number;
  type: 'line' | 'area' | 'bar';
}) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  // Measure the actual rendered width so the viewBox matches it 1:1 — this fills
  // the card edge-to-edge with NO letterbox gap, and keeps text undistorted
  // (unlike preserveAspectRatio="none"). Falls back to a sensible default until
  // the first measurement lands.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [measuredW, setMeasuredW] = useState(760);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setMeasuredW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Geometry. Width tracks the container; height is the card's plot height. ──
  const W = Math.max(measuredW, 240);
  const H = height;
  const padL = 46; // Y-axis value labels + axis title
  const padR = 16;
  const padT = 12;
  const padB = 40; // X-axis date labels + axis title
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const n = rows.length;
  const rawMax = Math.max(...rows.map((r) => r.value), 1);

  // "Nice" max so Y ticks are round numbers (e.g. 0/25/50/75/100).
  const niceMax = useMemo(() => niceCeil(rawMax), [rawMax]);
  const yTicks = useMemo(() => tickValues(niceMax, 4), [niceMax]);

  const x = (i: number) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => padT + (1 - v / niceMax) * plotH;
  const barSlot = plotW / Math.max(n, 1);

  const linePts = rows.map((r, i) => `${x(i)},${y(r.value)}`).join(' ');
  const areaPts = `${x(0)},${padT + plotH} ${linePts} ${x(n - 1)},${padT + plotH}`;

  // Show at most ~7 X labels so they never overlap.
  const xStep = Math.max(1, Math.ceil(n / 7));

  // Map a pointer X (in viewBox units) to the nearest data index.
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    if (vx < padL) return setHover(0);
    if (vx > padL + plotW) return setHover(n - 1);
    const i = Math.round(((vx - padL) / plotW) * (n - 1));
    setHover(Math.min(Math.max(i, 0), n - 1));
  };

  const active = hover != null ? rows[hover] : null;

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        role="img"
        className="touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* ── Y axis: gridlines + value labels ── */}
        {yTicks.map((v) => {
          const gy = y(v);
          return (
            <g key={v}>
              <line
                x1={padL}
                x2={W - padR}
                y1={gy}
                y2={gy}
                className="stroke-border"
                strokeWidth={0.5}
                strokeDasharray="2 3"
              />
              <text
                x={padL - 5}
                y={gy}
                textAnchor="end"
                dominantBaseline="central"
                className="fill-muted-foreground"
                fontSize="8"
              >
                {compact(v)}
              </text>
            </g>
          );
        })}

        {/* ── Series ── */}
        {type === 'bar' ? (
          rows.map((r, i) => {
            const bw = Math.max(2, barSlot * 0.6);
            const bx = x(i) - bw / 2;
            const by = y(r.value);
            const isHot = i === hover;
            return (
              <rect
                key={`${r.label}-${i}`}
                x={bx}
                y={by}
                width={bw}
                height={padT + plotH - by}
                rx={2}
                fill={ACCENT}
                opacity={isHot ? 1 : 0.8}
              />
            );
          })
        ) : (
          <>
            {type === 'area' && <polygon points={areaPts} fill={`url(#${gradientId})`} />}
            <polyline
              points={linePts}
              fill="none"
              stroke={ACCENT}
              strokeWidth={1.75}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}

        {/* ── Hover crosshair + dot ── */}
        {active && (
          <>
            <line
              x1={x(hover!)}
              x2={x(hover!)}
              y1={padT}
              y2={padT + plotH}
              className="stroke-muted-foreground"
              strokeWidth={0.75}
              strokeDasharray="3 3"
            />
            <circle cx={x(hover!)} cy={y(active.value)} r={3.5} fill={ACCENT} className="stroke-card" strokeWidth={1.5} />
          </>
        )}

        {/* ── X axis: date/label ticks (just below the plot) ── */}
        {rows.map((r, i) =>
          i % xStep === 0 || i === n - 1 ? (
            <text
              key={`x-${i}`}
              x={x(i)}
              y={padT + plotH + 13}
              textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
              className="fill-muted-foreground"
              fontSize="9"
            >
              {r.label}
            </text>
          ) : null,
        )}

        {/* ── Axis titles ── */}
        <text
          x={padL + plotW / 2}
          y={H - 3}
          textAnchor="middle"
          className="fill-muted-foreground font-jost-medium"
          fontSize="9"
        >
          Date
        </text>
        <text
          // Rotated Y-axis title down the left gutter.
          x={10}
          y={padT + plotH / 2}
          textAnchor="middle"
          className="fill-muted-foreground font-jost-medium"
          fontSize="9"
          transform={`rotate(-90 10 ${padT + plotH / 2})`}
        >
          Count
        </text>
      </svg>

      {/* ── Floating tooltip ── */}
      {active && (
        <div
          className="border-border bg-popover text-popover-foreground pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border px-2 py-1 text-[11px] shadow-md"
          style={{
            left: `${(x(hover!) / W) * 100}%`,
            top: `${(y(active.value) / H) * 100}%`,
          }}
        >
          <div className="font-jost-medium">{active.label}</div>
          <div className="text-muted-foreground tabular-nums">
            {active.value.toLocaleString()}
            {active.hint ? ` · ${active.hint}` : ''}
          </div>
        </div>
      )}
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────
/** Round a max up to a clean number (25, 50, 100, 250, 1000, …). */
function niceCeil(v: number): number {
  if (v <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}
/** Evenly spaced tick values from 0..max (inclusive), count+1 ticks. */
function tickValues(max: number, count: number): number[] {
  return Array.from({ length: count + 1 }, (_, i) => Math.round((max / count) * i));
}
/** Compact axis number: 1200 → "1.2k". */
function compact(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 ? 1 : 0)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 ? 1 : 0)}k`;
  return String(v);
}
