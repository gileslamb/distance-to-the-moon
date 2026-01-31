"use client";

import { useState } from "react";
import InlineDriftingImage from "@/components/InlineDriftingImage";
import { TypingText } from "@/components/TypingText";

const GOLD = "#C9A961";

const FILM_DESCRIPTION = `DISTANCE TO THE MOON

Official Selection: Athens Animation Film Festival 2025
Award of Distinction & Music Award Winner: Athens Animation Film Festival 2025
Official Selection: Stop-Emotion Film Festival, Venice 2025

"When we originally went to the moon, our total focus was on the moon. We weren't thinking about looking back at the Earth. But now that we've done it, that may well have been the most important reason we went."
— Michael Collins (Apollo 11, 1969)

In a stark future where Earth lies desolate, 'X', its sole remaining inhabitant, undertakes a surreal ascent on a ladder to the Moon. Battling inner demons, existential despair, and profound solitude, 'X' discovers unexpected companionship and glimpses of beauty and hope in the infinite vastness of space.

A stop-motion animated film inspired by early sci-fi aesthetic (Fritz Lang's Metropolis, Hitchcock) with an absurdist twist (Samuel Beckett, Italo Calvino's Cosmicomics). Set during the Space Race era (1963-68) but in a future timeline, the film resonates with our cultural, environmental and technological tipping point as we return to the moon.`;

// Structured film credits: label (gold) + content (white)
const FILM_CREDITS_ENTRIES: Array<{ label: string; content: string }> = [
  { label: "DISTANCE TO THE MOON - FILM CREDITS", content: "" },
  { label: "Presented by:", content: "Short Circuit & Eyebolls & Curious Dreamers" },
  { label: "In Association with:", content: "Creative Scotland\nBFI Network" },
  { label: "Executive Producers (Short Circuit):", content: "Gillian Berrie\nTiernan Kelly\nMiriam Newman\nWilma Smith" },
  { label: "Executive Producers (Creative Scotland):", content: "Sean Greenhorn" },
  { label: "Original Concept:", content: "Curious Dreamers" },
  { label: "Writer:", content: "Sacha Kyle" },
  { label: "Co-Directors:", content: "Sacha Kyle\nVictoria Watson" },
  { label: "Producers:", content: "Rhona Drummond\nGiles Lamb" },
  { label: "Music & Sound Design:", content: "Giles Lamb" },
  { label: "Art Director:", content: "Victoria Watson" },
  { label: "Storyboards:", content: "Sam Horton" },
  { label: "Animatic Editor:", content: "Victoria Watson" },
  { label: "Puppet Design & Fabrication:", content: "Rachael Olga Lloyd" },
  { label: "Set Design & Fabrication:", content: "Calum Main" },
  { label: "Props:", content: "Calum Main\nVictoria Watson" },
  { label: "Animation Consultant:", content: "Michael Hughes" },
  { label: "Animator:", content: "Calum Main" },
  { label: "Director of Photography:", content: "Sean Monroe" },
  { label: "VFX Supervisor & Background Designer:", content: "Agata Kaczan" },
  { label: "Edit, Grade, VFX & Compositing:", content: "Florian Viale" },
  { label: "Sound Mix:", content: "Blazing Griffin" },
  { label: "Special Thanks:", content: "Curious Dreamers, Julian Schwanitz, Bruce Carmichael, Paul Bock,\nIsabel Garrett, Astrid Goldsmith, Garry Marshall, Andrew John Tait" },
  { label: "Supported by:", content: "National Lottery\nScottish Government through Creative Scotland\nBFI Network\nShort Circuit" },
  { label: "", content: "Short Circuit is delivered by Film City Futures in partnership with Glasgow Film" },
  { label: "", content: "Copyright © Eyebolls, Curious Dreamers" },
];

function buildCreditsTextAndRanges() {
  let fullText = "";
  const goldRanges: Array<[number, number]> = [];
  for (const { label, content } of FILM_CREDITS_ENTRIES) {
    if (label) {
      const start = fullText.length;
      fullText += label;
      goldRanges.push([start, fullText.length]);
      fullText += "\n";
    }
    if (content) {
      fullText += content + "\n\n";
    }
  }
  return { fullText: fullText.trimEnd(), goldRanges };
}

const { fullText: FILM_CREDITS_TEXT, goldRanges: FILM_CREDITS_GOLD_RANGES } = buildCreditsTextAndRanges();

interface FilmInfoProps {
  onBackToHome?: () => void;
  sensitivity?: number;
}

export default function FilmInfo({ onBackToHome, sensitivity = 0.33 }: FilmInfoProps) {
  const [view, setView] = useState<"info" | "credits" | "poster">("info");

  return (
    <div
      className={`absolute top-24 bottom-20 left-20 right-20 max-w-2xl font-medium text-sm text-white backdrop-blur-[2px] border border-white/20 rounded-lg p-6 tracking-wider overflow-auto flex flex-col ${view === "poster" ? "bg-black/40" : "bg-black/70"}`}
      style={{ maxHeight: "calc(100vh - 10rem)" }}
    >
      {view === "poster" ? (
        <InlineDriftingImage
          src="/DTTM%20POSTERV7.jpg"
          alt="Film Poster"
          onBack={() => setView("info")}
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
          {view === "info" && (
            <>
              <TypingText
                text={FILM_DESCRIPTION}
                firstLineGold
                className="text-sm"
                goldColor={GOLD}
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setView("credits")}
                  className="px-4 py-2 rounded border border-white/30 bg-white/5 hover:bg-white/10 transition uppercase text-xs tracking-widest font-medium hover:underline"
                  style={{ color: GOLD }}
                >
                  Film Credits
                </button>
                <button
                  type="button"
                  onClick={() => setView("poster")}
                  className="px-4 py-2 rounded border border-white/30 bg-white/5 hover:bg-white/10 transition uppercase text-xs tracking-widest font-medium hover:underline"
                  style={{ color: GOLD }}
                >
                  View Poster
                </button>
              </div>
            </>
          )}
          {view === "credits" && (
            <>
              <button
                type="button"
                onClick={() => setView("info")}
                className="mb-4 hover:underline transition uppercase text-xs tracking-widest"
                style={{ color: GOLD }}
              >
                back
              </button>
              <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 text-sm leading-relaxed">
                <TypingText
                  text={FILM_CREDITS_TEXT}
                  goldRanges={FILM_CREDITS_GOLD_RANGES}
                  goldColor={GOLD}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
