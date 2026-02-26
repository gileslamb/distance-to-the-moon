"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackList } from "@/lib/musicData";

export interface MusicPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentTrackIndex: number;
}

export interface MusicPlayerControls {
  playTrack: (index: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
}

interface MusicPlayerProps {
  currentTrackIndex?: number;
  onTrackChange?: (index: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  playRequest?: number;
  isMuted?: boolean;
  hideUI?: boolean;
  onPlaybackState?: (state: MusicPlayerState) => void;
  onControlsReady?: (controls: MusicPlayerControls) => void;
}

export default function MusicPlayer({
  currentTrackIndex: controlledIndex = 0,
  onTrackChange,
  onPlayStateChange,
  playRequest = 0,
  isMuted = false,
  hideUI = false,
  onPlaybackState,
  onControlsReady,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onPlayStateChangeRef = useRef(onPlayStateChange);
  const isPlayingRef = useRef(false);
  const trackIndexRef = useRef(0);
  const [internalIndex, setInternalIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [displayTitle, setDisplayTitle] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  const currentTrackIndex = onTrackChange ? controlledIndex : internalIndex;
  const setCurrentTrackIndex = onTrackChange ?? setInternalIndex;
  const track = trackList[currentTrackIndex] ?? trackList[0];

  useEffect(() => {
    onPlayStateChangeRef.current = onPlayStateChange;
  }, [onPlayStateChange]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    trackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  const emitPlaybackState = useCallback((overrides?: Partial<MusicPlayerState>) => {
    onPlaybackState?.({
      isPlaying,
      currentTime,
      duration,
      currentTrackIndex,
      ...overrides,
    });
  }, [onPlaybackState, isPlaying, currentTime, duration, currentTrackIndex]);

  const applyTrack = useCallback((index: number) => {
    const t = trackList[index];
    if (!t || !audioRef.current) return;
    audioRef.current.src = t.filename;
    setCurrentTime(0);
    setDuration(t.duration || 0);
    setDisplayTitle("");
    setTypingDone(false);
  }, [setCurrentTrackIndex]);

  const playTrack = useCallback((index: number) => {
    const t = trackList[index];
    const el = audioRef.current;
    if (!t || !el) return;
    setCurrentTrackIndex(index);
    el.src = t.filename;
    el.currentTime = 0;
    setCurrentTime(0);
    setDuration(t.duration || 0);
    setDisplayTitle("");
    setTypingDone(false);
    el.play().catch(() => {});
    setIsPlaying(true);
    onPlayStateChangeRef.current?.(true);
  }, [setCurrentTrackIndex]);

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.play().catch(() => {});
    setIsPlaying(true);
    onPlayStateChangeRef.current?.(true);
  }, []);

  const pause = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    setIsPlaying(false);
    onPlayStateChangeRef.current?.(false);
  }, []);

  useEffect(() => {
    applyTrack(currentTrackIndex);
  }, [currentTrackIndex, applyTrack]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) audioRef.current.play().catch(() => {});
  }, [currentTrackIndex, isPlaying]);

  useEffect(() => {
    if (playRequest > 0 && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [playRequest]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTimeUpdate = () => {
      setCurrentTime(el.currentTime);
      emitPlaybackState({ currentTime: el.currentTime });
    };
    const onLoadedMetadata = () => {
      setDuration(el.duration);
      emitPlaybackState({ duration: el.duration });
    };
    const onEnded = () => {
      setIsPlaying(false);
      onPlayStateChangeRef.current?.(false);
      const next = (currentTrackIndex + 1) % trackList.length;
      setCurrentTrackIndex(next);
      emitPlaybackState({ isPlaying: false, currentTrackIndex: next, currentTime: 0 });
    };
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("ended", onEnded);
    };
  }, [currentTrackIndex, setCurrentTrackIndex, emitPlaybackState]);

  useEffect(() => {
    if (!isPlaying) return;
    onPlayStateChange?.(true);
    return () => onPlayStateChange?.(false);
  }, [isPlaying, onPlayStateChange]);

  useEffect(() => {
    emitPlaybackState();
  }, [emitPlaybackState]);

  useEffect(() => {
    onControlsReady?.({
      playTrack,
      togglePlay: () => {
        if (isPlayingRef.current) pause();
        else play();
      },
      play,
      pause,
      next: () => {
        const nextIndex = (trackIndexRef.current + 1) % trackList.length;
        playTrack(nextIndex);
      },
    });
  }, [onControlsReady, playTrack, play, pause]);

  useEffect(() => {
    if (!isPlaying || typingDone) return;
    const full = track.title;
    let i = 0;
    const id = setInterval(() => {
      if (i <= full.length) {
        setDisplayTitle(full.slice(0, i));
        if (i === full.length) setTypingDone(true);
        i++;
      } else clearInterval(id);
    }, 12); /* Same as all typing: 12ms (40% faster than original 20ms) */
    return () => clearInterval(id);
  }, [isPlaying, track.title]);


  const togglePlay = () => {
    if (isPlaying) pause();
    else play();
  };

  const next = () => {
    const nextIndex = (currentTrackIndex + 1) % trackList.length;
    playTrack(nextIndex);
  };

  const hasStartedPlayback = displayTitle.length > 0 || isPlaying;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      {!hideUI && (
        <div
          className="fixed left-8 flex flex-col gap-2 font-medium text-sm text-white brightness-150 tracking-wider uppercase backdrop-blur-[2px] bg-black/60 rounded-lg px-4 py-3"
          style={{ top: "calc(2rem + var(--announcement-offset, 0px))" }}
        >
          {!hasStartedPlayback ? (
            <button
              type="button"
              onClick={togglePlay}
              className="rounded transition hover:underline text-left"
            >
              Play Album
            </button>
          ) : (
            <>
              <p className="tabular-nums font-semibold truncate max-w-[280px]" style={{ color: "#C9A961" }}>
                {isPlaying ? (displayTitle || track.title) : track.title}
                {!typingDone && isPlaying && <span className="animate-pulse">|</span>}
              </p>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="text-white/90 hover:text-white hover:underline transition"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="text-white/90 hover:text-white hover:underline transition"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
