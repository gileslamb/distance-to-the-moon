"use client";

import { useEffect, useRef, useState } from "react";
import { SoundscapeManager } from "@/lib/soundscapeManager";
import Starfield from "@/components/Starfield";
import StarSizeControl from "@/components/StarSizeControl";
import StarSpeedControl from "@/components/StarSpeedControl";
import MouseSensitivityControl from "@/components/MouseSensitivityControl";
import MusicPlayer from "@/components/MusicPlayer";
import MusicControls from "@/components/MusicControls";
import NavigationMenu, { type View } from "@/components/NavigationMenu";
import FilmInfo from "@/components/FilmInfo";
import AlbumMenu from "@/components/AlbumMenu";
import DriftingElement from "@/components/DriftingElement";
import DriftingSwimmer from "@/components/DriftingSwimmer";

// Vertical floaters: bottom-to-top, rare appearances (60-120s between). Stagger initials over ~5 min.
// Looped sequences: position-stabilized, trimmed to smooth loops, sequential numbering from 1.
const DRIFTING_ELEMENTS = [
  { imagePath: "/stills/moon.png", name: "Moon", minDelay: 0, maxDelay: 30000, minScale: 0.3, maxScale: 2, zIndex: 5 },
  { imagePath: "/sequences_looped/jacket/frame_0001.png", name: "Jacket", minDelay: 30000, maxDelay: 60000, minScale: 0.3, maxScale: 2, zIndex: 6, sequenceFolder: "/sequences_looped/jacket", frameStart: 1, frameEnd: 115, fps: 8 },
  { imagePath: "/sequences_looped/embrace/frame_0001.png", name: "Embrace", minDelay: 60000, maxDelay: 90000, minScale: 0.3, maxScale: 2, zIndex: 7, sequenceFolder: "/sequences_looped/embrace", frameStart: 1, frameEnd: 98 },
  { imagePath: "/sequences_looped/gramophone/frame_0001.png", name: "Gramophone", minDelay: 90000, maxDelay: 120000, minScale: 0.3, maxScale: 2, zIndex: 8, sequenceFolder: "/sequences_looped/gramophone", frameStart: 1, frameEnd: 20 },
  { imagePath: "/stills/ladder.png", name: "Ladder", minDelay: 120000, maxDelay: 150000, minScale: 0.3, maxScale: 2, zIndex: 9 },
  { imagePath: "/sequences_looped/books/frame_0001.png", name: "Books", minDelay: 150000, maxDelay: 180000, minScale: 0.3, maxScale: 2, zIndex: 10, sequenceFolder: "/sequences_looped/books", frameStart: 1, frameEnd: 21, fps: 8 },
  { imagePath: "/sequences_looped/teddy/frame_0001.png", name: "Teddy", minDelay: 180000, maxDelay: 210000, minScale: 0.3, maxScale: 2, zIndex: 11, sequenceFolder: "/sequences_looped/teddy", frameStart: 1, frameEnd: 10, fps: 4 },
  { imagePath: "/sequences_looped/satellite/frame_0001.png", name: "Satellite", minDelay: 240000, maxDelay: 270000, minScale: 0.3, maxScale: 2, zIndex: 13, sequenceFolder: "/sequences_looped/satellite", frameStart: 1, frameEnd: 66, fps: 8 },
  { imagePath: "/stills/x%20fall.png", name: "X Fall", minDelay: 270000, maxDelay: 330000, minScale: 0.3, maxScale: 2, zIndex: 14 },
];

// Horizontal swimmers: left-to-right with subtle drift. Spaced 90-180s between.
// Looped sequences with position-stabilized frames for smooth looping.
const SWIMMING_ELEMENTS = [
  { imagePath: "/sequences_looped/fish/frame_0001.png", name: "Fish", minDelay: 20000, maxDelay: 80000, sizeMultiplier: 0.7, zIndex: 4, sequenceFolder: "/sequences_looped/fish", frameStart: 1, frameEnd: 7, fps: 6 },
  { imagePath: "/sequences_looped/whale/frame_0001.png", name: "Whale", minDelay: 120000, maxDelay: 200000, sizeMultiplier: 2, zIndex: 4, sequenceFolder: "/sequences_looped/whale", frameStart: 1, frameEnd: 26, fps: 6, flipY: true },
  { imagePath: "/sequences_looped/fish_shoal/frame_0001.png", name: "Fish Shoal", minDelay: 60000, maxDelay: 140000, sizeMultiplier: 4, zIndex: 4, sequenceFolder: "/sequences_looped/fish_shoal", frameStart: 1, frameEnd: 68, fps: 8 },
];

export default function Home() {
  const [starSizeMultiplier, setStarSizeMultiplier] = useState(1);
  const [starSpeedMultiplier, setStarSpeedMultiplier] = useState(1);
  const [mouseSensitivity, setMouseSensitivity] = useState(0.33);
  const [view, setView] = useState<View>("home");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playRequest, setPlayRequest] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [starfieldKey, setStarfieldKey] = useState(0);
  const soundscapeRef = useRef<SoundscapeManager | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!soundscapeRef.current) soundscapeRef.current = new SoundscapeManager();
  const soundscape = soundscapeRef.current;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/souundscape/DTTM_Soundscape.mp3");
    audio.loop = true;
    audio.volume = 0.15; // Set before storing in ref - 15% volume for ambient level
    backgroundAudioRef.current = audio;
    if (!isMuted) audio.play().catch(() => {});
    return () => {
      audio.pause();
      backgroundAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    soundscape.setGlobalMute(isMuted);
    if (!isMuted) soundscape.start();
    if (backgroundAudioRef.current) backgroundAudioRef.current.muted = isMuted;
  }, [isMuted, soundscape]);

  const handlePlayStateChange = (playing: boolean) => {
    setIsMusicPlaying(playing);
    if (playing) soundscape.fadeOut();
    else soundscape.fadeIn();
  };

  useEffect(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    if (isMusicPlaying) {
      audio.pause();
    } else if (!isMuted) {
      audio.volume = 0.15; // Ensure 15% volume when resuming
      audio.play().catch(() => {});
    }
  }, [isMusicPlaying, isMuted]);

  const handleMuteToggle = () => setIsMuted((m) => !m);
  const handleReseed = () => setStarfieldKey((k) => k + 1);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <Starfield key={starfieldKey} mood="relaxed" sizeMultiplier={starSizeMultiplier} speedMultiplier={starSpeedMultiplier} sensitivity={mouseSensitivity} />
      {SWIMMING_ELEMENTS.map((el) => (
        <DriftingSwimmer
          key={el.name}
          {...el}
          sensitivity={mouseSensitivity}
        />
      ))}
      {DRIFTING_ELEMENTS.map((el) => (
        <DriftingElement
          key={el.name}
          {...el}
          sensitivity={mouseSensitivity}
        />
      ))}

      {view === "home" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1
            className="text-white font-thin uppercase whitespace-nowrap text-[clamp(1.5rem,6vw,6rem)] tracking-[clamp(0.1em,0.5vw,0.3em)]"
          >
            Distance to the Moon
          </h1>
        </div>
      )}

      {view === "film" && <FilmInfo onBackToHome={() => setView("home")} sensitivity={mouseSensitivity} />}
      {view === "album" && (
        <AlbumMenu
          currentTrackIndex={currentTrackIndex}
          onTrackSelect={(index) => {
            setCurrentTrackIndex(index);
            setPlayRequest((r) => r + 1);
          }}
          onBackToHome={() => setView("home")}
          sensitivity={mouseSensitivity}
        />
      )}

      <MusicPlayer
        currentTrackIndex={currentTrackIndex}
        onTrackChange={setCurrentTrackIndex}
        onPlayStateChange={handlePlayStateChange}
        playRequest={playRequest}
        isMuted={isMuted}
      />

      <MusicControls isMuted={isMuted} onMuteToggle={handleMuteToggle} onReseed={handleReseed} />
      <MouseSensitivityControl sensitivity={mouseSensitivity} onSensitivityChange={setMouseSensitivity} />
      <StarSizeControl sizeMultiplier={starSizeMultiplier} onSizeChange={setStarSizeMultiplier} />
      <StarSpeedControl speedMultiplier={starSpeedMultiplier} onSpeedChange={setStarSpeedMultiplier} />
      <NavigationMenu view={view} onViewChange={setView} />
    </main>
  );
}
