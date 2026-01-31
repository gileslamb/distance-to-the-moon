"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackList } from "@/lib/musicData";

interface MusicPlayerProps {
  currentTrackIndex?: number;
  onTrackChange?: (index: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  playRequest?: number;
  isMuted?: boolean;
}

export default function MusicPlayer({
  currentTrackIndex: controlledIndex = 0,
  onTrackChange,
  onPlayStateChange,
  playRequest = 0,
  isMuted = false,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [internalIndex, setInternalIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [displayTitle, setDisplayTitle] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  const currentTrackIndex = onTrackChange ? controlledIndex : internalIndex;
  const setCurrentTrackIndex = onTrackChange ?? setInternalIndex;
  const track = trackList[currentTrackIndex] ?? trackList[0];

  const applyTrack = useCallback((index: number) => {
    const t = trackList[index];
    if (!t || !audioRef.current) return;
    audioRef.current.src = t.filename;
    setCurrentTime(0);
    setDuration(t.duration || 0);
    setDisplayTitle("");
    setTypingDone(false);
  }, [setCurrentTrackIndex]);

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
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => setDuration(el.duration);
    const onEnded = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
      const next = (currentTrackIndex + 1) % trackList.length;
      setCurrentTrackIndex(next);
    };
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("ended", onEnded);
    };
  }, [currentTrackIndex, onPlayStateChange, setCurrentTrackIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    onPlayStateChange?.(true);
    return () => onPlayStateChange?.(false);
  }, [isPlaying, onPlayStateChange]);

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
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      onPlayStateChange?.(false);
    } else el.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const next = () => {
    const nextIndex = (currentTrackIndex + 1) % trackList.length;
    setCurrentTrackIndex(nextIndex);
  };

  const hasStartedPlayback = displayTitle.length > 0 || isPlaying;

  return (
    <div className="fixed top-8 left-8 flex flex-col gap-2 font-medium text-sm text-white brightness-150 tracking-wider uppercase backdrop-blur-[2px] bg-black/60 rounded-lg px-4 py-3">
      <audio ref={audioRef} preload="metadata" />
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
  );
}
