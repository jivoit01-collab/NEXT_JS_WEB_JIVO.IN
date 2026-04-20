'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff, RefreshCw, ArrowRight } from 'lucide-react';

const PROBE_URL = '/favicon.ico';
const PROBE_INTERVAL_MS = 5000;
const PROBE_TIMEOUT_MS = 4000;

async function probeNetwork(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
    const res = await fetch(`${PROBE_URL}?_=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [sinceMs, setSinceMs] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const sinceStartRef = useRef<number>(0);

  const verify = useCallback(async () => {
    const online = await probeNetwork();
    setIsOffline(!online);
    return online;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      verify();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [verify]);

  useEffect(() => {
    if (!isOffline) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      sinceStartRef.current = 0;
      setSinceMs(0);
      return;
    }

    sinceStartRef.current = Date.now();
    const tick = window.setInterval(() => {
      setSinceMs(Date.now() - sinceStartRef.current);
    }, 1000);

    intervalRef.current = window.setInterval(() => {
      verify();
    }, PROBE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(tick);
      intervalRef.current = null;
    };
  }, [isOffline, verify]);

  const handleRetry = useCallback(async () => {
    setIsChecking(true);
    await verify();
    setIsChecking(false);
  }, [verify]);

  const duration = formatDuration(sinceMs);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          key="offline-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="offline-title"
          aria-describedby="offline-desc"
          className="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden bg-black/65 px-4 backdrop-blur-md"
        >
          <FloatingOrbs />

          <motion.div
            initial={{ scale: 0.94, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 18, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            className="group relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#134b4c] via-[#0f3e3f] to-[#0a2d2e] p-8 text-white shadow-[0_25px_70px_-10px_rgba(0,0,0,0.6)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-3xl opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(239,68,68,0.0), rgba(239,68,68,0.35), rgba(20,184,166,0.25), rgba(239,68,68,0.0))',
              }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 2.4,
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15"
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-500/25" />
                  <span
                    className="absolute inset-2 rounded-full border border-red-400/30"
                    aria-hidden="true"
                  />
                  <motion.div
                    animate={{ rotate: [-4, 4, -4] }}
                    transition={{
                      duration: 2.8,
                      ease: 'easeInOut',
                      repeat: Infinity,
                    }}
                    className="relative"
                  >
                    <WifiOff className="h-9 w-9 text-red-400" aria-hidden="true" />
                  </motion.div>
                </motion.div>
              </div>

              <h2
                id="offline-title"
                className="text-center font-jost-bold text-xl md:text-2xl"
              >
                You are offline
              </h2>
              <p
                id="offline-desc"
                className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-white/70"
              >
                Check your internet connection. We&apos;ll reconnect automatically
                as soon as you are back online.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/60">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
                </span>
                <span>Disconnected {duration ? `· ${duration}` : ''}</span>
              </div>

              <RetryButton onRetry={handleRetry} isChecking={isChecking} />

              <p className="mt-4 text-center text-xs text-white/50">
                Auto-retrying every few seconds
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RetryButton({
  onRetry,
  isChecking,
}: {
  onRetry: () => void;
  isChecking: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onRetry}
      disabled={isChecking}
      whileHover={isChecking ? undefined : { scale: 1.02, y: -1 }}
      whileTap={isChecking ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="group/btn relative mt-6 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-3 font-jost-bold text-[#134b4c] shadow-[0_8px_24px_-8px_rgba(255,255,255,0.35)] transition-shadow duration-300 hover:shadow-[0_12px_32px_-8px_rgba(255,255,255,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-linear-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-[400%]"
      />

      <RefreshCw
        className={`relative h-4 w-4 transition-transform duration-500 ${
          isChecking ? 'animate-spin' : 'group-hover/btn:rotate-180'
        }`}
        aria-hidden="true"
      />
      <span className="relative">{isChecking ? 'Checking…' : 'Try again'}</span>
      {!isChecking && (
        <ArrowRight
          className="relative h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover/btn:translate-x-0 group-hover/btn:opacity-100"
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}

function FloatingOrbs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.span
        className="absolute left-[15%] top-[20%] h-40 w-40 rounded-full bg-red-500/10 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute bottom-[18%] right-[12%] h-56 w-56 rounded-full bg-teal-400/10 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function formatDuration(ms: number) {
  if (ms < 1000) return '';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}m ${rs}s`;
}
