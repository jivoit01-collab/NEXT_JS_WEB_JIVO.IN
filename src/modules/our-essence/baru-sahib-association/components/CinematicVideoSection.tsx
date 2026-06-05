'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { SafeImage } from '@/components/shared/public';
import { cn } from '@/lib/utils';
import type { BaruSahibAssociationVideoContent } from '../types';

interface CinematicVideoSectionProps {
  data?: BaruSahibAssociationVideoContent;
}

interface VideoSource {
  src: string;
  type: string;
}

const fallbackVideoContent: BaruSahibAssociationVideoContent = {
  video: '',
  videoWebm: '',
  poster: '',
};

const loadingSpinnerSegments = Array.from({ length: 12 }, (_, index) => index);
const VIDEO_VIEW_THRESHOLD = 0.18;
const VISIBILITY_DEBOUNCE_MS = 90;
const VIDEO_FRAME_SIZES = '100vw';

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

function buildVideoSources(content: BaruSahibAssociationVideoContent) {
  const sources: VideoSource[] = [];
  const webmSource = resolveMediaSrc(content.videoWebm);
  const primarySource = resolveMediaSrc(content.video);

  if (webmSource) {
    sources.push({ src: webmSource, type: 'video/webm' });
  }

  if (primarySource && !sources.some((source) => source.src === primarySource)) {
    sources.push({ src: primarySource, type: getVideoType(primarySource) });
  }

  return sources;
}

export function CinematicVideoSection({ data }: CinematicVideoSectionProps) {
  const content = data ?? fallbackVideoContent;
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const visibilityTimerRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const preferredMutedRef = useRef(true);
  const isInPlayableViewRef = useRef(false);
  const isPlayingRef = useRef(false);

  const videoSources = useMemo(() => buildVideoSources(content), [content]);
  const sourceKey = useMemo(
    () => videoSources.map((source) => source.src).join('|'),
    [videoSources],
  );
  const posterSrc = useMemo(() => resolveMediaSrc(content.poster), [content.poster]);
  const hasVideo = videoSources.length > 0;

  const [isMuted, setIsMuted] = useState(true);
  const [hasMountedVideo, setHasMountedVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  const syncMutedState = useCallback((nextMuted: boolean) => {
    setIsMuted((current) => (current === nextMuted ? current : nextMuted));
  }, []);

  const clearVisibilityTimer = useCallback(() => {
    if (visibilityTimerRef.current === null) return;
    window.clearTimeout(visibilityTimerRef.current);
    visibilityTimerRef.current = null;
  }, []);

  const pauseAndMuteVideo = useCallback(() => {
    const currentVideo = videoRef.current;
    isPlayingRef.current = false;

    if (!currentVideo) return;

    // Pausing and muting outside the viewport stops decode pressure and prevents hidden audio.
    if (!currentVideo.paused) currentVideo.pause();
    currentVideo.muted = true;
    syncMutedState(true);
  }, [syncMutedState]);

  const playWithAutoplayPolicy = useCallback(() => {
    const currentVideo = videoRef.current;
    if (!currentVideo || playPromiseRef.current || isPlayingRef.current) return;

    // Browser autoplay is reliable only when playback starts muted. If the user unmuted earlier,
    // restore that preference after play() succeeds and the section is still visible.
    const mutedAfterStart = preferredMutedRef.current;
    currentVideo.muted = true;
    syncMutedState(true);

    const playPromise = currentVideo.play();
    playPromiseRef.current = playPromise;

    playPromise
      .then(() => {
        playPromiseRef.current = null;
        isPlayingRef.current = true;

        if (!isInPlayableViewRef.current) {
          pauseAndMuteVideo();
          return;
        }

        currentVideo.muted = mutedAfterStart;
        syncMutedState(mutedAfterStart);
      })
      .catch(() => {
        playPromiseRef.current = null;
        isPlayingRef.current = false;
        currentVideo.muted = true;
        preferredMutedRef.current = true;
        syncMutedState(true);
      });
  }, [pauseAndMuteVideo, syncMutedState]);

  const toggleMute = useCallback(() => {
    const nextMuted = !preferredMutedRef.current;
    preferredMutedRef.current = nextMuted;

    const currentVideo = videoRef.current;
    if (currentVideo) {
      currentVideo.muted = nextMuted;
    }

    syncMutedState(nextMuted);
  }, [syncMutedState]);

  useEffect(() => {
    isInPlayableViewRef.current = false;
    isPlayingRef.current = false;
    playPromiseRef.current = null;

    const resetTimer = window.setTimeout(() => {
      setHasMountedVideo(false);
      setIsVideoReady(false);
      setIsVideoLoading(false);
      setHasVideoError(false);
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [sourceKey]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !hasVideo) return;

    if (typeof IntersectionObserver === 'undefined') {
      const fallbackTimer = window.setTimeout(() => {
        setHasMountedVideo(true);
        isInPlayableViewRef.current = true;
        playWithAutoplayPolicy();
      }, 0);

      return () => {
        window.clearTimeout(fallbackTimer);
        pauseAndMuteVideo();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldPlay = entry.isIntersecting && entry.intersectionRatio >= VIDEO_VIEW_THRESHOLD;

        if (entry.isIntersecting) {
          // Mount near the viewport so metadata is ready, but keep preload at metadata to avoid pulling a 400MB file early.
          setHasMountedVideo((current) => current || true);
        }

        isInPlayableViewRef.current = shouldPlay;
        clearVisibilityTimer();

        visibilityTimerRef.current = window.setTimeout(
          () => {
            visibilityTimerRef.current = null;

            if (shouldPlay) {
              playWithAutoplayPolicy();
            } else {
              pauseAndMuteVideo();
            }
          },
          shouldPlay ? VISIBILITY_DEBOUNCE_MS : 0,
        );
      },
      {
        rootMargin: '220px 0px',
        threshold: [0, 0.15, VIDEO_VIEW_THRESHOLD, 0.35],
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      clearVisibilityTimer();
      isInPlayableViewRef.current = false;
      pauseAndMuteVideo();
    };
  }, [clearVisibilityTimer, hasVideo, pauseAndMuteVideo, playWithAutoplayPolicy]);

  useEffect(() => {
    if (!hasMountedVideo || !isInPlayableViewRef.current) return;

    const playTimer = window.setTimeout(() => playWithAutoplayPolicy(), 0);
    return () => window.clearTimeout(playTimer);
  }, [hasMountedVideo, playWithAutoplayPolicy]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black"
      style={{ contentVisibility: 'auto', contain: 'layout paint', containIntrinsicSize: '760px' }}
    >
      <div
        className={cn(
          'relative w-full opacity-0 transition-opacity duration-700 ease-out motion-reduce:opacity-100',
          hasMountedVideo || !hasVideo ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="relative overflow-hidden bg-black">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-black/38 to-transparent sm:h-24" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-linear-to-t from-black/44 to-transparent sm:h-24" />

          <div className="relative h-[50svh] min-h-[280px] w-full sm:h-[55svh] sm:min-h-[340px] md:h-[62svh] lg:h-[calc(100svh-4rem)] lg:min-h-[620px] 2xl:h-[calc(100svh-5rem)]">
            {hasVideo && hasMountedVideo ? (
              <>
                <video
                  key={sourceKey}
                  ref={videoRef}
                  className={cn(
                    'h-full w-full object-cover transition-opacity duration-700 ease-out',
                    isVideoReady && !hasVideoError ? 'opacity-100' : 'opacity-0',
                  )}
                  muted={isMuted}
                  playsInline
                  loop
                  preload="metadata"
                  poster={posterSrc || undefined}
                  controls={false}
                  controlsList="nodownload nofullscreen noplaybackrate"
                  disablePictureInPicture
                  aria-label="Baru Sahib Association documentary video"
                  onContextMenu={(event) => event.preventDefault()}
                  onLoadStart={() => {
                    setHasVideoError(false);
                    setIsVideoLoading(true);
                  }}
                  onWaiting={() => setIsVideoLoading(true)}
                  onStalled={() => setIsVideoLoading(true)}
                  onLoadedData={() => {
                    setIsVideoReady(true);
                    setIsVideoLoading(false);
                  }}
                  onCanPlay={() => {
                    setIsVideoReady(true);
                    setIsVideoLoading(false);
                  }}
                  onPlaying={() => {
                    isPlayingRef.current = true;
                    setIsVideoReady(true);
                    setIsVideoLoading(false);
                  }}
                  onPause={() => {
                    isPlayingRef.current = false;
                  }}
                  onError={() => {
                    setIsVideoLoading(false);
                    setHasVideoError(true);
                  }}
                >
                  {videoSources.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                  ))}
                </video>

                {!isVideoReady && posterSrc && <PosterPreview poster={posterSrc} />}

                {isVideoLoading && !hasVideoError && <VideoLoadingOverlay />}

                {hasVideoError && <VideoErrorOverlay />}

                {!hasVideoError && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="absolute right-4 bottom-4 z-20 flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/42 text-white shadow-[0_12px_34px_rgba(0,0,0,0.34)] backdrop-blur-sm transition-all duration-300 hover:bg-white/16 focus:ring-2 focus:ring-[#d8c187]/70 focus:ring-offset-2 focus:ring-offset-black focus:outline-none sm:right-6 sm:bottom-6 sm:size-14 lg:hover:scale-105"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? (
                      <VolumeX className="size-5 transition-transform duration-300" />
                    ) : (
                      <Volume2 className="size-5 transition-transform duration-300" />
                    )}
                  </button>
                )}
              </>
            ) : (
              <VideoFrameSkeleton poster={posterSrc} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PosterPreview({ poster }: { poster: string }) {
  return (
    <div className="absolute inset-0">
      <SafeImage
        src={poster}
        alt=""
        fill
        loading="lazy"
        quality={90}
        className="object-cover opacity-90"
        sizes={VIDEO_FRAME_SIZES}
      />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}

function VideoFrameSkeleton({ poster }: { poster?: string }) {
  return (
    <div className="relative h-full min-h-[240px] overflow-hidden bg-[#0c100d] sm:min-h-[360px] lg:min-h-0">
      {poster ? (
        <PosterPreview poster={poster} />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.1),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.012))]" />
      )}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.07)_42%,transparent_58%)] bg-[length:220%_100%] motion-safe:animate-[cinematicShimmer_2.6s_ease-in-out_infinite]" />
      <VideoLoadingOverlay />
      <div className="absolute right-5 bottom-5 size-12 animate-pulse rounded-full border border-white/12 bg-white/8 sm:right-6 sm:bottom-6 sm:size-14" />
    </div>
  );
}

function VideoLoadingOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(214,192,141,0.08),rgba(0,0,0,0.16)_34%,rgba(0,0,0,0.3)_100%)]"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center gap-5 rounded-[1.4rem] border border-white/12 bg-black/34 px-8 py-7 text-white shadow-[0_18px_52px_rgba(0,0,0,0.42)] backdrop-blur-sm">
        <span className="absolute inset-0 rounded-[1.4rem] bg-linear-to-br from-white/10 via-transparent to-[#d8c187]/10" />
        <SegmentedLoadingSpinner />
        <span className="font-jost-medium relative inline-flex items-center gap-1 text-xs tracking-[0.24em] text-white/78 uppercase">
          Loading video
          <span className="inline-flex w-5 justify-start gap-0.5" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="size-1 rounded-full bg-[#d8c187] motion-safe:animate-pulse"
                style={{ animationDelay: `${dot * 180}ms` }}
              />
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}

function SegmentedLoadingSpinner() {
  return (
    <div
      className="relative size-11 animate-spin sm:size-12"
      aria-hidden="true"
      style={{ animationDuration: '1100ms' }}
    >
      {loadingSpinnerSegments.map((segment) => (
        <span
          key={segment}
          className="absolute top-1/2 left-1/2 h-2.5 w-1 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)] sm:h-3"
          style={{
            opacity: 0.18 + segment * 0.065,
            transform: `translate(-50%, -50%) rotate(${segment * 30}deg) translateY(-1.15rem)`,
            transformOrigin: '50% 1.15rem',
          }}
        />
      ))}
    </div>
  );
}

function VideoErrorOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(214,192,141,0.1),rgba(0,0,0,0.24)_42%,rgba(0,0,0,0.42)_100%)]">
      <div className="max-w-sm rounded-2xl border border-white/12 bg-black/32 px-6 py-5 text-center text-white shadow-[0_18px_52px_rgba(0,0,0,0.42)] backdrop-blur-sm">
        <p className="font-jost-bold text-sm tracking-[0.18em] text-[#d8c187] uppercase">
          Video unavailable
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          The video could not load right now.
        </p>
      </div>
    </div>
  );
}

export function CinematicVideoSectionSkeleton() {
  return (
    <section aria-hidden className="relative w-full overflow-hidden bg-black">
      <div className="relative overflow-hidden bg-black">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-black/38 to-transparent sm:h-24" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-linear-to-t from-black/44 to-transparent sm:h-24" />
        <div className="h-[50svh] min-h-[280px] w-full sm:h-[55svh] sm:min-h-[340px] md:h-[62svh] lg:h-[calc(100svh-4rem)] lg:min-h-[620px] 2xl:h-[calc(100svh-5rem)]">
          <VideoFrameSkeleton />
        </div>
      </div>
    </section>
  );
}
