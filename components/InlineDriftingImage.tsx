"use client";

import { useEffect, useRef, useState } from "react";

const PARALLAX_RANGE = 25; // 20-30px movement range
const DRIFT_DURATION = 35000; // 35s

interface InlineDriftingImageProps {
  src: string;
  alt: string;
  onBack: () => void;
  sensitivity?: number;
}

export default function InlineDriftingImage({ src, alt, onBack, sensitivity = 0.33 }: InlineDriftingImageProps) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current = { x, y: -y };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let rafId: number;
    const lerp = 0.08;
    const tick = () => {
      const target = mouseRef.current;
      const cur = mouseCurrentRef.current;
      cur.x += (target.x - cur.x) * lerp;
      cur.y += (target.y - cur.y) * lerp;
      const sens = typeof sensitivity === "number" ? sensitivity : 0.33;
      const range = PARALLAX_RANGE * sens;
      setParallax({
        x: cur.x * range,
        y: cur.y * range,
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [sensitivity]);

  useEffect(() => {
    const t = setTimeout(onBack, DRIFT_DURATION);
    return () => clearTimeout(t);
  }, [onBack]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-[#C9A961] hover:text-[#D4B96C] hover:underline transition uppercase text-xs tracking-widest"
      >
        back
      </button>
      <div className="flex-1 flex items-center justify-center min-h-0 relative overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 flex items-center justify-center"
          style={{
            transform: `translate(calc(-50% + ${parallax.x}px), calc(-50% + ${parallax.y}px))`,
          }}
        >
          <div
            style={{
              animation: `poster-drift ${DRIFT_DURATION / 1000}s ease-in-out forwards`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="opacity-90 drop-shadow-2xl object-contain"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "min(60vw, 100%)",
                maxHeight: "min(50vh, 100%)",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
