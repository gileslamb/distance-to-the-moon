"use client";

import { useEffect, useRef, useState } from "react";
import type { Mood } from "@/lib/types";
import { SoundscapeManager } from "@/lib/soundscapeManager";
import Starfield from "@/components/Starfield";
import StarSizeControl from "@/components/StarSizeControl";
import MoodControl from "@/components/MoodControl";
import MusicPlayer from "@/components/MusicPlayer";
import MusicControls from "@/components/MusicControls";
import NavigationMenu, { type View } from "@/components/NavigationMenu";
import FilmInfo from "@/components/FilmInfo";
import AlbumMenu from "@/components/AlbumMenu";

export default function Home() {
  const [mood, setMood] = useState<Mood>("relaxed");
  const [starSizeMultiplier, setStarSizeMultiplier] = useState(1);
  const [view, setView] = useState<View>("home");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playRequest, setPlayRequest] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [starfieldKey, setStarfieldKey] = useState(0);
  const soundscapeRef = useRef<SoundscapeManager | null>(null);

  if (!soundscapeRef.current) soundscapeRef.current = new SoundscapeManager();
  const soundscape = soundscapeRef.current;

  useEffect(() => {
    soundscape.setGlobalMute(isMuted);
    if (!isMuted) soundscape.start();
  }, [isMuted, soundscape]);

  const handlePlayStateChange = (playing: boolean) => {
    if (playing) soundscape.fadeOut();
    else soundscape.fadeIn();
  };

  const handleMuteToggle = () => setIsMuted((m) => !m);
  const handleReseed = () => setStarfieldKey((k) => k + 1);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <Starfield key={starfieldKey} mood={mood} sizeMultiplier={starSizeMultiplier} />

      {view === "home" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-white text-8xl font-thin tracking-[0.3em] uppercase">
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
      <StarSizeControl sizeMultiplier={starSizeMultiplier} onSizeChange={setStarSizeMultiplier} />
      <MoodControl mood={mood} onMoodChange={setMood} />
      <NavigationMenu view={view} onViewChange={setView} />
    </main>
  );
}
