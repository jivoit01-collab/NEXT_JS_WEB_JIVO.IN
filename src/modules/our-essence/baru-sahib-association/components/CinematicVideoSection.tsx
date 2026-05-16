'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BaruSahibAssociationVideoContent } from '../types';

interface CinematicVideoSectionProps {
  data?: BaruSahibAssociationVideoContent;
}

const fallbackVideoContent: BaruSahibAssociationVideoContent = {
  video: '',
};

function resolveMediaSrc(value: string) {
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

export function CinematicVideoSection({ data }: CinematicVideoSectionProps) {
  const { video } = data ?? fallbackVideoContent;
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playFrameRef = useRef<number | null>(null);
  const preferredMutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const resolvedVideoSrc = useMemo(() => resolveMediaSrc(video), [video]);

  const cancelPendingPlay = useCallback(() => {
    if (playFrameRef.current === null) return;
    window.cancelAnimationFrame(playFrameRef.current);
    playFrameRef.current = null;
  }, []);

  const pauseAndMuteVideo = useCallback(
    (syncState = true) => {
      const currentVideo = videoRef.current;
      if (!currentVideo) return;

      cancelPendingPlay();
      if (!currentVideo.paused) currentVideo.pause();
      currentVideo.muted = true;
      if (syncState) setIsMuted(true);
    },
    [cancelPendingPlay],
  );

  const playWithPreferredAudio = useCallback(() => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    cancelPendingPlay();
    playFrameRef.current = window.requestAnimationFrame(() => {
      playFrameRef.current = null;
      currentVideo.muted = preferredMutedRef.current;
      setIsMuted(preferredMutedRef.current);
      currentVideo.play().catch(() => undefined);
    });
  }, [cancelPendingPlay]);

  const toggleMute = useCallback(() => {
    const nextMuted = !preferredMutedRef.current;
    preferredMutedRef.current = nextMuted;

    const currentVideo = videoRef.current;
    if (currentVideo) {
      currentVideo.muted = nextMuted;
    }

    setIsMuted(nextMuted);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !resolvedVideoSrc) return;

    if (typeof IntersectionObserver === 'undefined') {
      setHasEntered(true);
      playWithPreferredAudio();
      return () => pauseAndMuteVideo(false);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          setHasEntered(true);
          playWithPreferredAudio();
        } else {
          pauseAndMuteVideo();
        }
      },
      {
        rootMargin: '0px',
        threshold: [0, 0.15, 0.2],
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      pauseAndMuteVideo(false);
      cancelPendingPlay();
    };
  }, [cancelPendingPlay, pauseAndMuteVideo, playWithPreferredAudio, resolvedVideoSrc]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#030504] px-4 py-16 sm:px-6 sm:py-20 lg:min-h-screen lg:px-8 lg:py-28 2xl:px-20 2xl:py-36"
    >
      <div className="absolute inset-0 bg-linear-to-b from-[#060b08] via-[#030504] to-black" />
      <div className="absolute top-0 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(204,174,110,0.18),transparent_68%)]" />
      <div className="absolute right-0 bottom-0 h-[34rem] w-[34rem] translate-x-1/3 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(58,114,78,0.16),transparent_70%)]" />
      <div className="cinematic-grain pointer-events-none absolute inset-0 opacity-[0.045]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-screen-2xl flex-col justify-center">
        <div
          className={cn(
            'mx-auto max-w-4xl text-center opacity-0 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100',
            hasEntered || !resolvedVideoSrc ? 'translate-y-0 opacity-100' : 'translate-y-6',
          )}
        >
          <h2 className="font-jost-extrabold text-4xl leading-none text-balance text-[#d6c08d]/75 uppercase sm:text-5xl lg:text-6xl 2xl:text-7xl">
            Baru Sahib
          </h2>
        </div>

        <div
          className={cn(
            'relative mx-auto mt-10 w-full max-w-[1500px] opacity-0 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 sm:mt-12 lg:mt-14 lg:w-[85vw]',
            hasEntered || !resolvedVideoSrc
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-8 scale-[0.985]',
          )}
        >
          <div className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_center,rgba(214,192,141,0.2),transparent_68%)] opacity-80 transition-opacity duration-500" />

          <div className="group relative rounded-[1.6rem] bg-linear-to-br from-white/22 via-[#d8c187]/28 to-white/8 p-px shadow-[0_32px_90px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out motion-reduce:transition-none sm:rounded-[2rem] lg:hover:-translate-y-1 lg:hover:scale-[1.004] lg:hover:shadow-[0_42px_120px_rgba(0,0,0,0.65)]">
            <div className="relative overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#090b09]/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:rounded-[1.95rem]">
              <div className="absolute inset-x-0 top-0 z-10 h-28 bg-linear-to-b from-black/42 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-linear-to-t from-black/48 to-transparent" />

              <div className="relative aspect-video w-full lg:aspect-auto lg:h-[80vh] lg:max-h-[820px]">
                {resolvedVideoSrc ? (
                  <>
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover"
                      muted={isMuted}
                      playsInline
                      loop
                      preload="metadata"
                      aria-label="Baru Sahib Association documentary video"
                    >
                      <source src={resolvedVideoSrc} type={getVideoType(resolvedVideoSrc)} />
                    </video>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="absolute right-4 bottom-4 z-20 flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/42 text-white shadow-2xl shadow-black/40 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/16 focus:ring-2 focus:ring-[#d8c187]/70 focus:ring-offset-2 focus:ring-offset-black focus:outline-none sm:right-6 sm:bottom-6 sm:size-14"
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? (
                        <VolumeX className="size-5 transition-transform duration-300" />
                      ) : (
                        <Volume2 className="size-5 transition-transform duration-300" />
                      )}
                    </button>
                  </>
                ) : (
                  <VideoFrameSkeleton />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoFrameSkeleton() {
  return (
    <div className="relative h-full min-h-[240px] overflow-hidden bg-[#0c100d] sm:min-h-[360px] lg:min-h-0">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.08)_42%,transparent_58%)] bg-[length:220%_100%] motion-safe:animate-[cinematicShimmer_2.4s_ease-in-out_infinite]" />
      <div className="absolute right-5 bottom-5 size-12 animate-pulse rounded-full border border-white/12 bg-white/8 sm:right-6 sm:bottom-6 sm:size-14" />
    </div>
  );
}

export function CinematicVideoSectionSkeleton() {
  return (
    <section
      aria-hidden
      className="relative overflow-hidden bg-[#030504] px-4 py-16 sm:px-6 sm:py-20 lg:min-h-screen lg:px-8 lg:py-28 2xl:px-20 2xl:py-36"
    >
      <div className="absolute inset-0 bg-linear-to-b from-[#060b08] via-[#030504] to-black" />
      <div className="cinematic-grain pointer-events-none absolute inset-0 opacity-[0.045]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-screen-2xl flex-col justify-center">
        <div className="mx-auto max-w-4xl animate-pulse text-center">
          <div className="mx-auto h-3 w-44 rounded bg-white/15 sm:h-4" />
          <div className="mx-auto mt-5 h-11 w-full max-w-2xl rounded bg-white/18 sm:h-14 lg:h-16" />
          <div className="mx-auto mt-4 h-4 w-full max-w-xl rounded bg-white/12 sm:h-5" />
        </div>
        <div className="relative mx-auto mt-10 w-full max-w-[1500px] sm:mt-12 lg:mt-14 lg:w-[85vw]">
          <div className="rounded-[1.6rem] bg-linear-to-br from-white/18 via-[#d8c187]/18 to-white/8 p-px shadow-[0_32px_90px_rgba(0,0,0,0.55)] sm:rounded-[2rem]">
            <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#090b09]/92 sm:rounded-[1.95rem]">
              <div className="aspect-video w-full lg:aspect-auto lg:h-[80vh] lg:max-h-[820px]">
                <VideoFrameSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
