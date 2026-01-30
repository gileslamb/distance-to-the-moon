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

// Add transparent PNGs here. Each drifts bottom-to-top with random angles and parallax.
// Example future additions: ladder, character, book, graphophone, whale, fish, teddy bear, earth
const DRIFTING_ELEMENTS = [
  { imagePath: "/stills/moon.png", name: "Moon", minDelay: 3000, maxDelay: 10000, minScale: 0.3, maxScale: 2, zIndex: 5 },
  { imagePath: "/stills/jacket.png", name: "Jacket", minDelay: 12000, maxDelay: 28000, minScale: 0.3, maxScale: 2, zIndex: 6 },
  { imagePath: "/stills/Otherworldly.png", name: "Otherworldly", minDelay: 22000, maxDelay: 40000, minScale: 0.3, maxScale: 2, zIndex: 7 },
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

      {view === "film" && <FilmInfo />}
      {view === "album" && (
        <AlbumMenu
          currentTrackIndex={currentTrackIndex}
          onTrackSelect={(index) => {
            setCurrentTrackIndex(index);
            setPlayRequest((r) => r + 1);
          }}
        />
      )}

      <MusicPlayer
        currentTrackIndex={currentTrackIndex}
        onTrackChange={setCurrentTrackIndex}
        onPlayStateChange={handlePlayStateChange}
        playRequest={playRequest}
      />

      <MusicControls isMuted={isMuted} onMuteToggle={handleMuteToggle} onReseed={handleReseed} />
      <MouseSensitivityControl sensitivity={mouseSensitivity} onSensitivityChange={setMouseSensitivity} />
      <StarSizeControl sizeMultiplier={starSizeMultiplier} onSizeChange={setStarSizeMultiplier} />
      <StarSpeedControl speedMultiplier={starSpeedMultiplier} onSpeedChange={setStarSpeedMultiplier} />
      <NavigationMenu view={view} onViewChange={setView} />
    </main>
  );
}
