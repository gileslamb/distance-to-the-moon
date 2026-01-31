"use client";

import { useEffect, useState } from "react";
import { trackList } from "@/lib/musicData";
import InlineDriftingImage from "@/components/InlineDriftingImage";
import { TypingText } from "@/components/TypingText";

const GOLD = "#C9A961";
const TYPING_INTERVAL = 12;

// Album credits: label (gold) + content (white). Emails get gold.
const ALBUM_CREDITS_ENTRIES: Array<{ label: string; content: string }> = [
  { label: "Music Composed by:", content: "Giles Lamb" },
  { label: "Music Produced by:", content: "Giles Lamb and Sacha Kyle" },
  { label: "Album Digital Release:", content: "Red Rocca" },
  { label: "Publishing:", content: "Peer Music Publishing UK" },
  { label: "Licensing:", content: "Anne Miller – anne@peermusic.com" },
  { label: "Master:", content: "Curious Dreamers – hello@curiousdreamers.com" },
  { label: "Musicians/Performers:", content: "" },
  { label: "Tracks 1-11:", content: "Giles Lamb" },
  { label: "Tracks 1, 2, 8:", content: "Nino Racco (Vocal)" },
  { label: "Track 7:", content: "Lorenzo Carraffe (Spoken Word)" },
];

function buildAlbumCreditsTextAndRanges() {
  let fullText = "";
  const goldRanges: Array<[number, number]> = [];
  const linkRanges: Array<[number, number, string]> = [];
  for (const entry of ALBUM_CREDITS_ENTRIES) {
    if (entry.label) {
      goldRanges.push([fullText.length, fullText.length + entry.label.length]);
      fullText += entry.label + (entry.content ? " " : "\n");
    }
    if (entry.content) {
      fullText += entry.content + "\n";
      const anne = "anne@peermusic.com";
      const hello = "hello@curiousdreamers.com";
      const iAnne = fullText.indexOf(anne);
      if (iAnne >= 0) {
        goldRanges.push([iAnne, iAnne + anne.length]);
        linkRanges.push([iAnne, iAnne + anne.length, "mailto:anne@peermusic.com"]);
      }
      const iHello = fullText.indexOf(hello);
      if (iHello >= 0) {
        goldRanges.push([iHello, iHello + hello.length]);
        linkRanges.push([iHello, iHello + hello.length, "mailto:hello@curiousdreamers.com"]);
      }
    }
  }
  return { fullText: fullText.trimEnd(), goldRanges, linkRanges };
}

const { fullText: ALBUM_CREDITS_TEXT, goldRanges: ALBUM_CREDITS_GOLD_RANGES, linkRanges: ALBUM_CREDITS_LINK_RANGES } = buildAlbumCreditsTextAndRanges();

const STREAM_BUY_TEXT = "Stream / Buy: Spotify | Bandcamp";

interface AlbumMenuProps {
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
  onBackToHome?: () => void;
  sensitivity?: number;
}

export default function AlbumMenu({ currentTrackIndex, onTrackSelect, onBackToHome, sensitivity = 0.33 }: AlbumMenuProps) {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [trackTypingDone, setTrackTypingDone] = useState(false);
  const [view, setView] = useState<"tracks" | "credits" | "cover">("tracks");

  useEffect(() => {
    const lines = trackList.map((t, i) => `${i + 1}. ${t.title}`);
    let lineIndex = 0;
    let charIndex = 0;
    const id = setInterval(() => {
      if (lineIndex >= lines.length) {
        setTrackTypingDone(true);
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
    }, TYPING_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const linesToShow = trackTypingDone ? trackList.map((t, i) => `${i + 1}. ${t.title}`) : displayLines;

  return (
    <div
      className={`absolute top-24 bottom-20 left-20 right-20 max-w-md text-sm text-white backdrop-blur-[2px] border border-white/20 rounded-lg p-6 tracking-wider overflow-auto flex flex-col ${view === "cover" ? "bg-black/40" : "bg-black/70"}`}
      style={{ maxHeight: "calc(100vh - 10rem)" }}
    >
      {view === "cover" ? (
        <InlineDriftingImage
          src="/DTTM%20Album%20Artwork.png"
          alt="Album Cover"
          onBack={() => setView("tracks")}
          sensitivity={sensitivity}
        />
      ) : (
        <>
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="mb-4 hover:underline transition uppercase text-xs tracking-widest"
              style={{ color: GOLD }}
            >
              ← Back to Home
            </button>
          )}
          {view === "tracks" && (
            <>
              <ul className="space-y-2 uppercase">
                {linesToShow.map((line, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => onTrackSelect(i)}
                      className={`w-full text-left px-2 py-2 rounded transition hover:bg-white/10 font-medium hover:underline ${currentTrackIndex === i ? "bg-white/15 underline font-semibold" : ""}`}
                      style={{ color: GOLD }}
                    >
                      {line}
                      {!trackTypingDone && i === linesToShow.length - 1 && (
                        <span className="animate-pulse text-white">|</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-white/20 text-xs tracking-widest font-medium space-y-2">
                <TypingText text={STREAM_BUY_TEXT} goldColor={GOLD} />
                <div className="flex gap-2 mt-2">
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: GOLD }}>
                    Spotify
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: GOLD }}>
                    Bandcamp
                  </a>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setView("credits")}
                  className="px-4 py-2 rounded border border-white/30 bg-white/5 hover:bg-white/10 transition uppercase text-xs tracking-widest font-medium hover:underline"
                  style={{ color: GOLD }}
                >
                  Album Credits
                </button>
                <button
                  type="button"
                  onClick={() => setView("cover")}
                  className="px-4 py-2 rounded border border-white/30 bg-white/5 hover:bg-white/10 transition uppercase text-xs tracking-widest font-medium hover:underline"
                  style={{ color: GOLD }}
                >
                  View Album Cover
                </button>
              </div>
            </>
          )}
          {view === "credits" && (
            <>
              <button
                type="button"
                onClick={() => setView("tracks")}
                className="mb-4 hover:underline transition uppercase text-xs tracking-widest"
                style={{ color: GOLD }}
              >
                back
              </button>
              <div className="text-xs tracking-wider space-y-1 leading-relaxed opacity-95">
                <TypingText
                  text={ALBUM_CREDITS_TEXT}
                  goldRanges={ALBUM_CREDITS_GOLD_RANGES}
                  linkRanges={ALBUM_CREDITS_LINK_RANGES}
                  goldColor={GOLD}
                  className="not-uppercase"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
