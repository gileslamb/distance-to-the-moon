"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackList } from "@/lib/musicData";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface MusicPlayerProps {
  currentTrackIndex?: number;
  onTrackChange?: (index: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  playRequest?: number;
}

export default function MusicPlayer({
  currentTrackIndex: controlledIndex = 0,
  onTrackChange,
  onPlayStateChange,
  playRequest = 0,
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
    }, 35);
    return () => clearInterval(id);
  }, [isPlaying, track.title]);

  useEffect(() => {
    if (!isPlaying) {
      setDisplayTitle("");
      setTypingDone(false);
    }
  }, [isPlaying]);

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

  return (
    <div className="fixed top-8 left-8 flex flex-col gap-2 font-thin text-sm text-white tracking-wider uppercase backdrop-blur-[2px] max-w-[280px]">
      <audio ref={audioRef} preload="metadata" />
      {!isPlaying ? (
        <button
          type="button"
          onClick={togglePlay}
          className="px-5 py-2.5 rounded border border-white/30 bg-white/5 hover:bg-white/10 transition font-thin tracking-wider uppercase"
        >
          Play
        </button>
      ) : (
        <>
          <p className="tabular-nums">
            {displayTitle}
            {!typingDone && <span className="animate-pulse">|</span>}
          </p>
          <p className="text-white/70 tabular-nums text-sm">
            {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : "—:—"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="px-4 py-2 rounded border border-white/30 bg-white/5 hover:bg-white/10 transition font-thin tracking-wider uppercase"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={next}
              className="px-4 py-2 rounded border border-white/30 bg-white/5 hover:bg-white/10 transition font-thin tracking-wider uppercase"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
