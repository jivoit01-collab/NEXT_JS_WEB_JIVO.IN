'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, Volume2, VolumeX } from 'lucide-react';
import type { MilestonesTimelineVideoContent } from '../types';

interface MilestonesTimelineVideoProps {
  data?: MilestonesTimelineVideoContent;
}

function resolveMediaSrc(value?: string) {
  if (!value) return '';
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('/')
  ) {
    return value;
  }

  return `/api/uploads/${encodeURIComponent(value)}`;
}

function getVideoType(src: string) {
  const cleanSrc = src.split('?')[0]?.toLowerCase() ?? '';
  if (cleanSrc.endsWith('.webm')) return 'video/webm';
  if (cleanSrc.endsWith('.ogg') || cleanSrc.endsWith('.ogv')) return 'video/ogg';
  return 'video/mp4';
}

export function MilestonesTimelineVideo({ data }: MilestonesTimelineVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  // Two sources: portrait for phones, landscape for desktop. We resolve BOTH URLs
  // but only ever mount ONE <video>, so just one file is downloaded/decoded.
  const desktopSrc = useMemo(() => resolveMediaSrc(data?.video), [data?.video]);
  const mobileSrc = useMemo(() => resolveMediaSrc(data?.videoMobile), [data?.videoMobile]);
  const hasVideo = Boolean(desktopSrc) || Boolean(mobileSrc);

  // `null` until mounted so SSR never picks the wrong file (and never loads both).
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Prefer the device-specific video; fall back to the other when one isn't set.
  const activeSrc =
    isDesktop === null
      ? ''
      : isDesktop
        ? desktopSrc || mobileSrc
        : mobileSrc || desktopSrc;

  const showLoading =
    hasVideo && (isDesktop === null || (!hasError && !hasEnded && (!isReady || isLoading)));

  // Reserve the EXACT box each video will occupy, per breakpoint, straight from SSR —
  // so the skeleton and the loaded video are identical in size (zero layout jump).
  // Sizes are captured on upload; the fallbacks match typical landscape/portrait cuts.
  const desktopAspect =
    data?.videoWidth && data?.videoHeight ? `${data.videoWidth}/${data.videoHeight}` : '16/9';
  const mobileAspect = !mobileSrc
    ? desktopAspect // no portrait cut → the desktop file is used on phones too
    : data?.videoMobileWidth && data?.videoMobileHeight
      ? `${data.videoMobileWidth}/${data.videoMobileHeight}`
      : '3/4';

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const restartVideo = async () => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    setHasEnded(false);
    setHasError(false);
    setIsLoading(true);
    currentVideo.currentTime = 0;
    currentVideo.muted = isMuted;

    try {
      await currentVideo.play();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    // In-flow on ALL screens so the footer always shows below the video.
    // Desktop (lg+): full-viewport landscape video, object-contain (all years).
    // Mobile: tall portrait video that fills the screen (object-cover) — the
    // correct aspect for a phone, so no crop of content and no blank space.
    // Only ONE of the two source files is ever loaded (see activeSrc).
    <main className="milestones-timeline-page relative w-full bg-black">
      <h1 className="sr-only">Milestones Timeline</h1>
      <section
        aria-label="Milestones timeline video"
        style={
          {
            '--video-aspect-m': mobileAspect,
            '--video-aspect-d': desktopAspect,
          } as React.CSSProperties
        }
        className="relative aspect-[var(--video-aspect-m)] w-full overflow-hidden bg-black lg:aspect-[var(--video-aspect-d)]"
      >
        {hasVideo ? (
          <>
            {activeSrc && (
              <video
                key={activeSrc}
                ref={videoRef}
                // The section already reserves this video's exact aspect box, so the
                // video simply fills it — full width, whole frame, no crop, no jump.
                className="h-full w-full bg-black object-contain"
                autoPlay
                muted={isMuted}
                playsInline
                preload="auto"
                controls={false}
                controlsList="nodownload nofullscreen noplaybackrate"
                disablePictureInPicture
                aria-label="Milestones timeline video"
                onLoadStart={() => {
                  setIsReady(false);
                  setIsLoading(true);
                  setHasEnded(false);
                  setHasError(false);
                }}
                onWaiting={() => setIsLoading(true)}
                onStalled={() => setIsLoading(true)}
                onCanPlay={() => {
                  setIsReady(true);
                  setIsLoading(false);
                }}
                onLoadedData={() => {
                  setIsReady(true);
                  setIsLoading(false);
                }}
                onPlaying={() => {
                  setIsReady(true);
                  setIsLoading(false);
                  setHasEnded(false);
                }}
                onEnded={() => {
                  setHasEnded(true);
                  setIsLoading(false);
                  videoRef.current?.pause();
                }}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                onContextMenu={(event) => event.preventDefault()}
              >
                <source src={activeSrc} type={getVideoType(activeSrc)} />
              </video>
            )}

            {showLoading && <VideoLoadingOverlay />}
            {hasError && <VideoStatus label="Video unavailable" />}

            {hasEnded && !hasError && (
              <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:bottom-6">
                <button
                  type="button"
                  onClick={restartVideo}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/18 bg-black/48 px-5 py-2.5 text-sm font-jost-bold tracking-[0.16em] text-white uppercase shadow-[0_14px_40px_rgba(0,0,0,0.38)] ring-1 ring-white/10 backdrop-blur-md transition-colors duration-300 hover:bg-white/16 focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Restart
                </button>
              </div>
            )}

            {!hasError && activeSrc && (
              <button
                type="button"
                onClick={toggleMute}
                className="absolute right-4 bottom-4 z-30 flex size-12 items-center justify-center rounded-full border border-white/18 bg-black/42 text-white shadow-[0_14px_40px_rgba(0,0,0,0.38)] ring-1 ring-white/10 backdrop-blur-md transition-colors duration-300 hover:bg-white/14 focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-black focus:outline-none sm:right-6 sm:bottom-6 sm:size-14"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
            )}
          </>
        ) : (
          <VideoStatus label="Upload a milestones timeline video from admin" />
        )}
      </section>
      <style jsx global>{`
        body:has(.milestones-timeline-page) {
          background: #000;
        }
      `}</style>
    </main>
  );
}

function VideoLoadingOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/16"
      role="status"
      aria-live="polite"
      aria-label="Loading video"
    >
      <div className="relative flex size-16 items-center justify-center rounded-full border border-white/12 bg-black/34 shadow-[0_18px_52px_rgba(0,0,0,0.42)] backdrop-blur-md sm:size-18">
        <span className="absolute inset-2 rounded-full border border-white/10" />
        <span className="absolute size-10 animate-spin rounded-full border-2 border-white/22 border-t-white sm:size-11" />
        <span className="size-2 rounded-full bg-white/85 shadow-[0_0_18px_rgba(255,255,255,0.65)]" />
      </div>
    </div>
  );
}

function VideoStatus({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <p className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-center text-xs font-jost-bold tracking-[0.2em] text-white/70 uppercase backdrop-blur-md sm:text-sm">
        {label}
      </p>
    </div>
  );
}

export function MilestonesTimelineVideoSkeleton() {
  return (
    <main className="milestones-timeline-page relative w-full bg-black" aria-hidden="true">
      {/* Same aspect box as the real video section, so there is no jump when it swaps in. */}
      <section className="relative aspect-[3/4] w-full overflow-hidden bg-black lg:aspect-video">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
        <VideoLoadingOverlay />
      </section>
      <style jsx global>{`
        body:has(.milestones-timeline-page) {
          background: #000;
        }
      `}</style>
    </main>
  );
}