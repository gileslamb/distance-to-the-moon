"use client";

import { useEffect, useState } from "react";

const CONTENT = {
  title: "Distance to the Moon",
  description: "A short film about distance, longing, and the space between us. Composed and scored for the screen.",
  vimeoUrl: "https://vimeo.com/example",
  screenedAt: "Festival A, Festival B, Festival C",
  screeningNext: "Upcoming screening TBA",
};

export default function FilmInfo() {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  const fullText = [
    CONTENT.title,
    "",
    CONTENT.description,
    "",
    `Watch now: ${CONTENT.vimeoUrl}`,
    "",
    `Screened at: ${CONTENT.screenedAt}`,
    "",
    `Screening next: ${CONTENT.screeningNext}`,
  ].join("\n");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i <= fullText.length) {
        setDisplay(fullText.slice(0, i));
        if (i === fullText.length) setDone(true);
        i++;
      } else clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, [fullText]);

  return (
    <div
      className="absolute left-8 top-1/2 -translate-y-1/2 max-w-md font-thin text-sm text-white/90 backdrop-blur-[2px] whitespace-pre-wrap border border-white/20 rounded-lg p-6 bg-black/20 tracking-wider"
      style={{ maxHeight: "70vh", overflow: "auto" }}
    >
      {display}
      {!done && <span className="animate-pulse">|</span>}
    </div>
  );
}
