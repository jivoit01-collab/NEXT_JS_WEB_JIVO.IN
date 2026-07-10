'use client';

import { useMemo, useRef, useState } from 'react';
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

  const videoSrc = useMemo(() => resolveMediaSrc(data?.video), [data?.video]);
  const hasVideo = Boolean(videoSrc);
  const showLoading = hasVideo && !hasError && !hasEnded && (!isReady || isLoading);

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
    // Desktop (lg+): one viewport tall (h-dvh) with object-contain — still an
    // immersive full-screen look, but the page scrolls down to the footer.
    // Mobile: sized to the video's own height (h-auto) — no black letterbox bars.
    <main className="milestones-timeline-page relative w-full bg-black">
      <h1 className="sr-only">Milestones Timeline</h1>
      <section
        aria-label="Milestones timeline video"
        className={`relative w-full overflow-hidden bg-black lg:h-dvh ${
          hasVideo && !isReady && !hasError ? 'min-h-[50svh] lg:min-h-0' : ''
        }`}
      >
        {hasVideo ? (
          <>
            <video
              ref={videoRef}
              // Mobile: h-auto → the video keeps its natural aspect ratio, so the
              // section is exactly as tall as the video (no top/bottom black bars).
              // Desktop: fill the fixed layer, object-contain shows the full frame.
              className="h-auto w-full bg-black lg:h-full lg:object-contain"
              autoPlay
              muted={isMuted}
              playsInline
              preload="metadata"
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
              <source src={videoSrc} type={getVideoType(videoSrc)} />
            </video>

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

            {!hasError && (
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
      <section className="relative min-h-[50svh] w-full overflow-hidden bg-black lg:h-dvh lg:min-h-0">
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