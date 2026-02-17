"use client";

import { useState } from "react";
import InlineDriftingImage from "@/components/InlineDriftingImage";
import { TypingText } from "@/components/TypingText";

const GOLD = "#C9A961";

const FILM_INTRO = `DISTANCE TO THE MOON

An award-winning stop-motion animated short film that has screened at festivals worldwide, earning multiple awards and selections across 15 international film festivals.`;

const FILM_QUOTE_AND_SYNOPSIS = `"When we originally went to the moon, our total focus was on the moon. We weren't thinking about looking back at the Earth. But now that we've done it, that may well have been the most important reason we went."
— Michael Collins (Apollo 11, 1969)

In a stark future where Earth lies desolate, 'X', its sole remaining inhabitant, undertakes a surreal ascent on a ladder to the Moon. Battling inner demons, existential despair, and profound solitude, 'X' discovers unexpected companionship and glimpses of beauty and hope in the infinite vastness of space.

A stop-motion animated film inspired by early sci-fi aesthetic (Fritz Lang's Metropolis, Hitchcock) with an absurdist twist (Samuel Beckett, Italo Calvino's Cosmicomics). Set during the Space Race era (1963-68) but in a future timeline, the film resonates with our cultural, environmental and technological tipping point as we return to the moon.`;

const LAURELS = [
  { src: "/Laurels/Athens_white_distinction.png", alt: "Distinction Award - Athens Animfest 2025" },
  { src: "/Laurels/Athens_white_music.png", alt: "Music Award - Athens Animfest 2025" },
  { src: "/Laurels/MASA%20Finalist%20Laurels%202025%20white.png", alt: "Best Original Composition Finalist - Music & Sound Awards" },
  { src: "/Laurels/2025_SF_SHORTLIST_LAURELS.png", alt: "Shortlist - Shark Short Film Awards 2025" },
  { src: "/Laurels/AA_Official_Selection_2025.png", alt: "Official Selection - Athens Animfest 2025" },
  { src: "/Laurels/OFFICIAL%20SELECTION%20-%20Stop-eMotion%20Days%20in%20Venice%20-%202025-2.png", alt: "Official Selection - Stop-eMotion Venice 2025" },
  { src: "/Laurels/OFFICIAL-SELECTION-2025-white.gif", alt: "Official Selection - DUMBO Film Festival NYC 2025" },
  { src: "/Laurels/OFFICIAL%20SELECTION%20-%20Montreal%20International%20Animation%20Film%20Festival%20-%20ANIMAZE%20-%202025.png", alt: "Official Selection - Animaze Montreal 2025" },
  { src: "/Laurels/banjaluka%20white.png", alt: "Official Selection - Banjaluka IAFF 2025" },
  { src: "/Laurels/OFFICIALSELECTION-IndieCorkFilmFestival-2025.png", alt: "Official Selection - IndieCork Film Festival 2025" },
  { src: "/Laurels/Edinburgh%20Short%20Film%20Festival%20-%20Official%20Selection%20-%202025%20WHITE.png", alt: "Official Selection - Edinburgh Short Film Festival 2025" },
  { src: "/Laurels/OFFICIAL%20SELECTION%20-%20International%20Film%20Festival%20Glasgow%20-%202025.png", alt: "Official Selection - Glasgow International Film Festival 2025" },
  { src: "/Laurels/LIVIFF%20white.png", alt: "Official Selection - Liverpool Film Festival 2026" },
  { src: "/Laurels/Manipulate%20Laurel-02.png", alt: "Official Selection - Manipulate Film Festival 2026" },
  { src: "/Laurels/GSFF26%20Laurels%20WHITE%20OfficialSelection%404x.png", alt: "Official Selection - Glasgow Short Film Festival 2026" },
  { src: "/Laurels/OFFICIAL%20SELECTION%20-%20The%20Portland%20EcoFilm%20Festival%20-%202026.png", alt: "Official Selection - Portland EcoFilm Festival 2026" },
];

const FESTIVAL_SELECTIONS = [
  { date: "Feb 2025", name: "Athens Animfest" },
  { date: "May 2025", name: "Stop-eMotion, Venice" },
  { date: "Jun 2025", name: "DUMBO Film Festival, NYC" },
  { date: "Aug 2025", name: "Edinburgh International Film Festival" },
  { date: "Oct 2025", name: "Animaze — Montreal International Animation Film Festival" },
  { date: "Oct 2025", name: "Banjaluka International Animated Film Festival" },
  { date: "Oct 2025", name: "PÖFF Shorts" },
  { date: "Oct 2025", name: "Trieste Science+Fiction Festival" },
  { date: "Oct 2025", name: "IndieCork Film Festival" },
  { date: "Nov 2025", name: "Edinburgh Short Film Festival" },
  { date: "Nov 2025", name: "Glasgow International Film Festival" },
  { date: "2026", name: "Portland EcoFilm Festival" },
  { date: "Feb 2026", name: "Liverpool Film Festival" },
  { date: "Feb 2026", name: "Manipulate Film Festival" },
  { date: "Feb 2026", name: "Glasgow Short Film Festival" },
];

const AWARDS = [
  { award: "Distinction Award (Short Competition)", festival: "Athens Animfest" },
  { award: "Music Award", festival: "Athens Animfest" },
  { award: "Best Soundtrack", festival: "Animaze" },
  { award: "Best Original Composition in a Short Film — Finalist", festival: "Music & Sound Awards" },
  { award: "Best International Animated Short — Shortlisted", festival: "Shark Awards" },
];

// Structured film credits
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

function LaurelCarousel() {
  return (
    <div className="mt-6 mb-2">
      <div className="flex gap-4 overflow-x-auto pb-3">
        {LAURELS.map((l) => (
          <div key={l.alt} className="flex-shrink-0 flex items-center justify-center" style={{ width: 120, height: 80 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={l.src}
              alt={l.alt}
              loading="lazy"
              className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FestivalsAndAwards() {
  return (
    <div className="mt-6 space-y-6 text-sm leading-relaxed">
      {/* Awards */}
      <div>
        <h3 className="uppercase text-xs tracking-widest font-semibold mb-3" style={{ color: GOLD }}>
          Awards
        </h3>
        <div className="space-y-1.5">
          {AWARDS.map((a) => (
            <div key={a.award} className="flex flex-col">
              <span className="text-white/90">{a.award}</span>
              <span className="text-white/50 text-xs">{a.festival}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Festival Selections */}
      <div>
        <h3 className="uppercase text-xs tracking-widest font-semibold mb-3" style={{ color: GOLD }}>
          Festival Selections
        </h3>
        <div className="space-y-1">
          {FESTIVAL_SELECTIONS.map((f) => (
            <div key={`${f.date}-${f.name}`} className="flex gap-3">
              <span className="text-white/40 text-xs w-20 flex-shrink-0 pt-0.5">{f.date}</span>
              <span className="text-white/80">{f.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
            <div className="overflow-y-auto pr-1">
              <TypingText
                text={FILM_INTRO}
                firstLineGold
                className="text-sm"
                goldColor={GOLD}
              />

              <LaurelCarousel />

              <FestivalsAndAwards />

              <div className="mt-8 pt-6 border-t border-white/10">
                <TypingText
                  text={FILM_QUOTE_AND_SYNOPSIS}
                  className="text-sm"
                  goldColor={GOLD}
                />
              </div>

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
            </div>
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
