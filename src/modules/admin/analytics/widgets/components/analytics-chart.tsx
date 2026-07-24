import { BarChart3 } from 'lucide-react';

/**
 * THE one reusable analytics chart. Every analytics widget renders through this —
 * no page-specific chart code anywhere. Pure SVG + flex, so it's a server
 * component (no client JS, no chart library) and theme-aware. Six types:
 *   line · area · bar · horizontal-bar · pie · doughnut
 *
 * Data is the shared `{ label, value, hint? }[]` shape used across the platform.
 * With no data it shows a professional empty state — it NEVER breaks the layout.
 */

export type AnalyticsChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'horizontal-bar'
  | 'pie'
  | 'doughnut';

export interface ChartPoint {
  label: string;
  value: number;
  hint?: string;
}

/** Top-N rows shown by list/bar charts. */
const MAX_ROWS = 8;

// Shared categorical palette (pie/doughnut/horizontal-bar segments + legend).
const PALETTE = [
  '#7c83f0',
  '#e53935',
  '#f5a623',
  '#22a722',
  '#c026d3',
  '#14b8a6',
  '#3b82f6',
  '#64748b',
];
const ACCENT = '#0a7d3f';
const TAU = Math.PI * 2;

function EmptyChart({ message, height }: { message: string; height: number }) {
  return (
    <div
      className="border-border/60 text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed"
      style={{ minHeight: height }}
    >
      <BarChart3 size={20} className="opacity-40" />
      <p className="text-xs 2xl:text-sm">{message}</p>
    </div>
  );
}

export function AnalyticsChart({
  type,
  data,
  height = 200,
  emptyMessage = 'No data available yet.',
  showValues = true,
}: {
  type: AnalyticsChartType;
  data: ChartPoint[];
  height?: number;
  emptyMessage?: string;
  /** Show the numeric value labels (bar/horizontal-bar/legend). */
  showValues?: boolean;
}) {
  const rows = (data ?? []).filter((d) => Number.isFinite(d.value));
  if (rows.length === 0 || rows.every((r) => r.value === 0)) {
    return <EmptyChart message={emptyMessage} height={height} />;
  }

  if (type === 'pie' || type === 'doughnut') {
    return <PieChart rows={rows} doughnut={type === 'doughnut'} showValues={showValues} />;
  }
  if (type === 'horizontal-bar') {
    return <HorizontalBarChart rows={rows} showValues={showValues} />;
  }
  return <CartesianChart rows={rows} height={height} type={type} />;
}

// ── Pie / Doughnut ───────────────────────────────────────────
function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** An arc/wedge (r=0 → solid wedge) or annular sector (r>0 → doughnut segment). */
function arcPath(start: number, frac: number, cx: number, cy: number, R: number, r: number) {
  const a0 = start * TAU - Math.PI / 2;
  const a1 = (start + frac) * TAU - Math.PI / 2;
  const large = frac > 0.5 ? 1 : 0;
  const [ox0, oy0] = polar(cx, cy, R, a0);
  const [ox1, oy1] = polar(cx, cy, R, a1);
  if (r <= 0) {
    return `M ${cx} ${cy} L ${ox0.toFixed(2)} ${oy0.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${ox1.toFixed(2)} ${oy1.toFixed(2)} Z`;
  }
  const [ix0, iy0] = polar(cx, cy, r, a0);
  const [ix1, iy1] = polar(cx, cy, r, a1);
  return `M ${ox0.toFixed(2)} ${oy0.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${ox1.toFixed(2)} ${oy1.toFixed(2)} L ${ix1.toFixed(2)} ${iy1.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${ix0.toFixed(2)} ${iy0.toFixed(2)} Z`;
}

function PieChart({
  rows,
  doughnut,
  showValues,
}: {
  rows: ChartPoint[];
  doughnut: boolean;
  showValues: boolean;
}) {
  const slices = rows.slice(0, PALETTE.length);
  const total = slices.reduce((s, r) => s + r.value, 0) || 1;

  const C = 80; // centre
  const R = 74; // outer radius
  const r = doughnut ? 40 : 0; // inner radius (hole)
  const labelR = doughnut ? (R + r) / 2 : R * 0.62;

  const fracs = slices.map((s) => s.value / total);
  const segs = slices.map((row, i) => {
    const start = fracs.slice(0, i).reduce((a, f) => a + f, 0);
    const frac = fracs[i];
    const mid = (start + frac / 2) * TAU - Math.PI / 2;
    const [lx, ly] = polar(C, C, labelR, mid);
    return {
      label: row.label,
      value: row.value,
      color: PALETTE[i % PALETTE.length],
      start,
      frac,
      pct: Math.round(frac * 100),
      single: frac >= 0.9999,
      lx,
      ly,
    };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Chart — centred. Slices lift + brighten on hover; native title = tooltip. */}
      <div className="relative" style={{ height: 168, width: 168 }}>
        <svg width="168" height="168" viewBox="0 0 160 160" role="img">
          {segs.map((s, i) => {
            const tip = `${s.label}: ${s.value.toLocaleString()} (${s.pct}%)`;
            return s.single ? (
              <g key={i}>
                <circle cx={C} cy={C} r={R} fill={s.color}>
                  <title>{tip}</title>
                </circle>
                {doughnut && <circle cx={C} cy={C} r={r} className="fill-card" />}
              </g>
            ) : (
              <path
                key={i}
                d={arcPath(s.start, s.frac, C, C, R, r)}
                fill={s.color}
                className="cursor-default transition-opacity duration-200 hover:opacity-80"
              >
                <title>{tip}</title>
              </path>
            );
          })}
          {segs.map((s, i) =>
            s.pct >= 6 ? (
              <text
                key={`l${i}`}
                x={s.lx}
                y={s.ly}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none font-jost-medium"
                fontSize="11"
                fill="#ffffff"
              >
                {s.pct}%
              </text>
            ) : null,
          )}
        </svg>
        {doughnut && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-jost-bold text-base leading-none tabular-nums 2xl:text-lg">
              {total.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-[10px]">total</span>
          </div>
        )}
      </div>

      {/* Legend — left-aligned, value + % sit right beside each label. */}
      <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {segs.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs 2xl:text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-foreground/90 min-w-0 truncate">{s.label}</span>
            <span className="text-muted-foreground shrink-0 font-jost-medium tabular-nums">
              {showValues && `${s.value.toLocaleString()} · `}
              {s.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Horizontal bar ───────────────────────────────────────────
function HorizontalBarChart({ rows, showValues }: { rows: ChartPoint[]; showValues: boolean }) {
  const top = rows.slice(0, MAX_ROWS);
  const max = Math.max(...top.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {top.map((r, i) => (
        <li key={`${r.label}-${i}`} className="group/bar" title={`${r.label}: ${r.value.toLocaleString()}`}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs 2xl:text-sm">
            <span className="text-foreground/90 min-w-0 truncate transition-colors group-hover/bar:text-foreground">
              {r.label}
            </span>
            <span className="text-muted-foreground shrink-0 font-jost-medium tabular-nums">
              {showValues && r.value.toLocaleString()}
              {r.hint ? <span className="ml-1 opacity-70">{r.hint}</span> : null}
            </span>
          </div>
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full transition-opacity duration-200 group-hover/bar:opacity-80"
              style={{
                width: `${Math.max(3, Math.round((r.value / max) * 100))}%`,
                backgroundColor: PALETTE[i % PALETTE.length],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Line / Area / Bar (cartesian) ────────────────────────────
function CartesianChart({
  rows,
  height,
  type,
}: {
  rows: ChartPoint[];
  height: number;
  type: 'line' | 'area' | 'bar';
}) {
  const W = 300;
  const H = 100;
  const padY = 6;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const n = rows.length;
  const y = (v: number) => padY + (1 - v / max) * (H - padY * 2);
  const slot = W / n;
  const cx = (i: number) => slot * i + slot / 2;

  const linePts = rows.map((r, i) => `${cx(i)},${y(r.value)}`).join(' ');
  const areaPts = `${cx(0)},${H} ${linePts} ${cx(n - 1)},${H}`;
  const labelIdx = [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        width="100%"
        style={{ height }}
        className="overflow-visible"
      >
        {type === 'bar' ? (
          rows.map((r, i) => {
            const bw = Math.max(2, slot * 0.6);
            const bh = ((H - padY * 2) * r.value) / max;
            return (
              <rect key={r.label} x={cx(i) - bw / 2} y={H - bh} width={bw} height={bh} rx={2} fill={ACCENT} opacity={0.8} />
            );
          })
        ) : (
          <>
            {type === 'area' && <polygon points={areaPts} fill={ACCENT} opacity={0.12} />}
            <polyline
              points={linePts}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
      <div className="text-muted-foreground mt-2 flex justify-between text-[10px] 2xl:text-xs">
        {labelIdx.map((i) => (
          <span key={i} className="truncate">
            {rows[i].label}
          </span>
        ))}
      </div>
    </div>
  );
}
