"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

const GOLD = "#C9A961";
const RELEASE_TIME_UTC_MS = Date.parse("2026-02-26T00:00:00Z");

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function AnnouncementBanner() {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, RELEASE_TIME_UTC_MS - nowMs);
  const isReleased = remainingMs <= 0;
  const countdown = useMemo(() => formatRemaining(remainingMs), [remainingMs]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Placeholder until list provider is wired up.
    console.log("newsletter_signup", { email: email.trim(), timestamp: new Date().toISOString() });
    setSubmitted(true);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] border-b border-white/10 bg-[#05070f]/95 backdrop-blur-sm">
      <div className="h-9 px-4 md:px-8 flex items-center justify-center text-[11px] md:text-xs tracking-wide text-white/85">
        {!isReleased ? (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            <span>The album arrives at midnight —</span>
            <span style={{ color: GOLD }} className="tabular-nums font-medium">{countdown}</span>
            <a
              href="https://orcd.co/dttmostpresave"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white transition-colors"
              style={{ color: GOLD }}
            >
              Pre-save
            </a>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            <span>The album is out now —</span>
            <a
              href="https://orcd.co/tdttmost"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white transition-colors"
              style={{ color: GOLD }}
            >
              Stream it
            </a>
            <span>/</span>
            <a
              href="https://gileslamb.bandcamp.com/album/the-distance-to-the-moon-original-motion-picture-soundtrack"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white transition-colors"
              style={{ color: GOLD }}
            >
              Buy on Bandcamp
            </a>
          </div>
        )}
      </div>
      <div className="border-t border-white/5 px-4 md:px-8 py-2 flex items-center justify-center">
        {submitted ? (
          <p className="text-[11px] text-white/75 tracking-wide">
            Thank you — we&apos;ll be in touch
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] md:text-[11px] text-white/55 tracking-wide">
              Find out about future releases and projects from We Are Curious Dreamers
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-7 w-52 max-w-[65vw] rounded border border-white/20 bg-black/30 px-2 text-[11px] text-white placeholder:text-white/35 outline-none focus:border-white/35"
            />
            <button
              type="submit"
              className="h-7 px-3 rounded border border-white/20 bg-white/5 text-[10px] uppercase tracking-widest text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              style={{ color: GOLD }}
            >
              Stay in the orbit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
