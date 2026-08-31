'use client';

import { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Ban,
  Search,
  Eye,
  EyeOff,
  Globe,
  Clock,
  Mail,
  KeyRound,
  Monitor,
  AlertTriangle,
  Users,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SecurityOverview } from '@/lib/admin-security-store';

function formatDateTime(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;

  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatTimestamp(ms: number | undefined): string {
  if (!ms) return '—';
  return formatDateTime(new Date(ms).toISOString());
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone?: 'default' | 'danger';
}

function StatCard({ label, value, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 2xl:p-5',
        tone === 'danger' && 'border-destructive/30 bg-destructive/5',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            'h-4 w-4',
            tone === 'danger' ? 'text-destructive' : 'text-muted-foreground',
          )}
        />
        <span className="text-[11px] font-jost-bold uppercase tracking-widest text-muted-foreground 2xl:text-xs">
          {label}
        </span>
      </div>
      <p
        className={cn(
          'mt-2 text-2xl font-jost-bold 2xl:text-3xl',
          tone === 'danger' ? 'text-destructive' : 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function SecurityLogView({ overview }: { overview: SecurityOverview }) {
  const [query, setQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [blockedOnly, setBlockedOnly] = useState(false);

  const { attempts, ips, totals } = overview;

  const filteredAttempts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return attempts.filter((entry) => {
      if (blockedOnly && !entry.blocked) return false;
      if (!q) return true;

      return (
        entry.ip.toLowerCase().includes(q) ||
        (entry.email?.toLowerCase().includes(q) ?? false) ||
        (entry.password?.toLowerCase().includes(q) ?? false) ||
        (entry.userAgent?.toLowerCase().includes(q) ?? false) ||
        (entry.path?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [attempts, query, blockedOnly]);

  const blockedIps = useMemo(() => ips.filter((record) => record.blocked), [ips]);

  return (
    <div className="mx-auto w-full max-w-[1800px] py-4 sm:py-8 2xl:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <p className="mb-2 flex items-center gap-2 text-xs font-jost-bold uppercase tracking-widest text-gold sm:text-sm">
          <ShieldAlert className="h-4 w-4" />
          Login Security
        </p>
        <h1 className="text-2xl font-jost-bold sm:text-3xl 2xl:text-4xl">
          <span className="text-foreground">Failed Login</span>{' '}
          <span className="admin-gradient-text">Attempts</span>
        </h1>
      </div>

      {/* Sensitive-data warning */}
      <div className="mb-6 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="text-sm">
          <p className="font-jost-bold text-amber-600 dark:text-amber-400">
            This page shows real passwords in plain text.
          </p>
          <p className="mt-1 text-muted-foreground">
            It includes passwords your own team mistypes into the login form. Do not screenshot or
            share this page, and rotate any admin password you recognise below.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:gap-4">
        <StatCard label="Blocked IPs" value={totals.blockedIps} icon={Ban} tone="danger" />
        <StatCard label="Tracked IPs" value={totals.trackedIps} icon={Globe} />
        <StatCard label="Total Attempts" value={totals.totalAttempts} icon={Activity} />
        <StatCard label="Last 24 Hours" value={totals.attemptsLast24h} icon={Clock} />
        <StatCard label="Emails Tried" value={totals.uniqueEmails} icon={Users} />
      </div>

      {/* Blocked IPs */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-jost-bold uppercase tracking-widest text-muted-foreground">
          <Ban className="h-4 w-4" />
          Permanently Blocked IPs
        </h2>

        {blockedIps.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">No IPs are currently blocked.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-184 text-left text-sm">
              <thead className="border-b bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-jost-medium">IP Address</th>
                  <th className="px-4 py-3 font-jost-medium">Blocked At</th>
                  <th className="px-4 py-3 font-jost-medium">Reason</th>
                  <th className="px-4 py-3 font-jost-medium">Last Email</th>
                  <th className="px-4 py-3 text-right font-jost-medium">Total Fails</th>
                </tr>
              </thead>
              <tbody>
                {blockedIps.map((record) => (
                  <tr key={record.ip} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-[13px] font-jost-bold text-destructive">
                      {record.ip}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatTimestamp(record.blockedAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {record.blockedReason ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px]">{record.lastEmail ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-jost-bold">{record.totalFailures}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </section>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-xs font-jost-bold uppercase tracking-widest text-muted-foreground">
          <Activity className="h-4 w-4" />
          Attempt Log
          <span className="font-jost-medium normal-case tracking-normal text-muted-foreground/70">
            ({filteredAttempts.length} of {attempts.length})
          </span>
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search IP, email, password, agent..."
              className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-72"
            />
          </div>

          <button
            type="button"
            onClick={() => setBlockedOnly((v) => !v)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
              blockedOnly
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : 'bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            <Ban className="h-4 w-4" />
            Blocked only
          </button>

          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
              showPasswords
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPasswords ? 'Hide passwords' : 'Show passwords'}
          </button>
        </div>
      </div>

      {/* Attempt log */}
      {filteredAttempts.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 py-12 text-center">
          <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {attempts.length === 0
              ? 'No failed login attempts recorded yet.'
              : 'No attempts match your filters.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border bg-card lg:block">
            <table className="w-full min-w-240 text-left text-sm">
              <thead className="border-b bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-jost-medium">When</th>
                  <th className="px-4 py-3 font-jost-medium">IP</th>
                  <th className="px-4 py-3 font-jost-medium">Email Tried</th>
                  <th className="px-4 py-3 font-jost-medium">Password Tried</th>
                  <th className="px-4 py-3 font-jost-medium">User Agent</th>
                  <th className="px-4 py-3 text-center font-jost-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((entry, index) => (
                  <tr
                    key={`${entry.at}-${entry.ip}-${index}`}
                    className={cn(
                      'border-b last:border-0 hover:bg-muted/30',
                      entry.triggeredBlock && 'bg-destructive/5',
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(entry.at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px]">
                      {entry.ip}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] break-all">
                      {entry.email ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] break-all">
                      {entry.password === null ? (
                        <span className="text-muted-foreground/50">—</span>
                      ) : showPasswords ? (
                        <span className="text-amber-600 dark:text-amber-400">{entry.password}</span>
                      ) : (
                        <span className="text-muted-foreground/60">
                          {'•'.repeat(Math.min(entry.password.length, 12)) || '—'}
                        </span>
                      )}
                    </td>
                    <td
                      className="max-w-[18rem] truncate px-4 py-3 text-xs text-muted-foreground"
                      title={entry.userAgent ?? undefined}
                    >
                      {entry.userAgent ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      {entry.triggeredBlock ? (
                        <span className="rounded-full bg-destructive/15 px-2 py-1 text-[11px] font-jost-bold text-destructive">
                          BLOCKED HERE
                        </span>
                      ) : entry.blocked ? (
                        <span className="rounded-full bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
                          blocked
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                          {entry.attemptInWindow}/5
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filteredAttempts.map((entry, index) => (
              <div
                key={`${entry.at}-${entry.ip}-${index}`}
                className={cn(
                  'rounded-xl border bg-card p-4',
                  entry.triggeredBlock && 'border-destructive/30 bg-destructive/5',
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-mono text-sm font-jost-bold">{entry.ip}</span>
                  {entry.triggeredBlock ? (
                    <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-1 text-[10px] font-jost-bold text-destructive">
                      BLOCKED HERE
                    </span>
                  ) : entry.blocked ? (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-1 text-[10px] text-destructive">
                      blocked
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                      {entry.attemptInWindow}/5
                    </span>
                  )}
                </div>

                <dl className="space-y-2 text-[13px]">
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <dd className="text-muted-foreground">{formatDateTime(entry.at)}</dd>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <dd className="break-all font-mono">{entry.email ?? '—'}</dd>
                  </div>
                  <div className="flex items-start gap-2">
                    <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <dd className="break-all font-mono">
                      {entry.password === null
                        ? '—'
                        : showPasswords
                          ? entry.password
                          : '•'.repeat(Math.min(entry.password.length, 12))}
                    </dd>
                  </div>
                  {entry.userAgent && (
                    <div className="flex items-start gap-2">
                      <Monitor className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <dd className="break-all text-xs text-muted-foreground">{entry.userAgent}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </>
      )}

      {overview.logTruncated && (
        <p className="mt-4 text-xs text-muted-foreground">
          The log holds the most recent {overview.maxLogEntries.toLocaleString()} attempts. Older
          entries have rolled off.
        </p>
      )}
    </div>
  );
}
