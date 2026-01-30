"use client";

import { useEffect, useState } from "react";
import { trackList } from "@/lib/musicData";

interface AlbumMenuProps {
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
}

export default function AlbumMenu({ currentTrackIndex, onTrackSelect }: AlbumMenuProps) {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    const lines = trackList.map((t, i) => `${i + 1}. ${t.title}`);
    let lineIndex = 0;
    let charIndex = 0;
    const id = setInterval(() => {
      if (lineIndex >= lines.length) {
        setTypingDone(true);
        clearInterval(id);
        return;
      }
      const line = lines[lineIndex];
      if (charIndex <= line.length) {
        setDisplayLines((prev) => {
          const next = lines.slice(0, lineIndex).map((l) => l);
          next.push(line.slice(0, charIndex));
          return next;
        });
        charIndex++;
      } else {
        lineIndex++;
        charIndex = 0;
      }
    }, 20);
    return () => clearInterval(id);
  }, []);

  const linesToShow = typingDone ? trackList.map((t, i) => `${i + 1}. ${t.title}`) : displayLines;

  return (
    <div
      className="absolute left-8 top-1/2 -translate-y-1/2 max-w-md text-sm text-white brightness-200 backdrop-blur-[2px] border border-white/20 rounded-lg p-6 bg-black/70 tracking-wider uppercase"
      style={{ maxHeight: "70vh", overflow: "auto" }}
    >
      <ul className="space-y-2">
        {linesToShow.map((line, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onTrackSelect(i)}
              className={`w-full text-left px-2 py-2 rounded transition hover:bg-white/10 font-medium ${currentTrackIndex === i ? "bg-white/15 underline font-semibold" : ""}`}
            >
              {line}
              {!typingDone && i === linesToShow.length - 1 && (
                <span className="animate-pulse">|</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-8 pt-6 border-t border-white/20 text-white text-xs tracking-widest font-medium">
        <p>Stream / Buy: Spotify | Bandcamp</p>
        <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#00ff00] hover:underline mr-2">
          Spotify
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#00ff00] hover:underline">
          Bandcamp
        </a>
      </div>
    </div>
  );
}
