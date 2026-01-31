"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface DriftingSwimmerConfig {
  imagePath: string;
  name: string;
  minDelay: number;
  maxDelay: number;
  sizeMultiplier?: number; // 0.5 = half, 2 = double
  zIndex?: number;
}

interface DriftingSwimmerProps extends DriftingSwimmerConfig {
  sensitivity?: number;
}

const SWIM_DURATION = 55000; // 55s slow horizontal drift
const PARALLAX_FACTOR = 0.3 * 15;
const BASE_WIDTH = 200;
const BASE_HEIGHT = 120;

export default function DriftingSwimmer({
  imagePath,
  name,
  minDelay,
  maxDelay,
  sizeMultiplier = 1,
  zIndex = 4,
  sensitivity = 0.33,
}: DriftingSwimmerProps) {
  const [isSwimming, setIsSwimming] = useState(false);
  const [baseY, setBaseY] = useState("40%");
  const [swimDrift, setSwimDrift] = useState("0%");
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
      setParallax({
        x: cur.x * PARALLAX_FACTOR * sens,
        y: cur.y * PARALLAX_FACTOR * sens,
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [sensitivity]);

  useEffect(() => {
    let isFirst = true;
    const scheduleNextSwim = () => {
      const delay = isFirst
        ? minDelay + Math.random() * (maxDelay - minDelay)
        : 90000 + Math.random() * 90000;
      isFirst = false;
      const t = setTimeout(() => {
        setBaseY(`${25 + Math.random() * 50}%`);
        // Random subtle drift: -3% to +3% (up or down)
        const drift = (Math.random() - 0.5) * 6;
        setSwimDrift(`${drift}%`);
        setIsSwimming(true);

        setTimeout(() => {
          setIsSwimming(false);
          scheduleNextSwim();
        }, SWIM_DURATION);
      }, delay);
      return () => clearTimeout(t);
    };
    const cleanup = scheduleNextSwim();
    return cleanup;
  }, [minDelay, maxDelay]);

  const w = Math.round(BASE_WIDTH * sizeMultiplier);
  const h = Math.round(BASE_HEIGHT * sizeMultiplier);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex }}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${parallax.x}px, ${parallax.y}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <div
          className={`absolute ${isSwimming ? "opacity-100" : "opacity-0"}`}
          style={{
            "--swim-base-y": baseY,
            "--swim-drift": swimDrift,
            animation: isSwimming
              ? `swim-horizontal ${SWIM_DURATION / 1000}s linear forwards`
              : "none",
            transition: "opacity 2s ease-in-out",
          } as React.CSSProperties}
        >
          <Image
            src={imagePath}
            alt={name}
            width={w}
            height={h}
            unoptimized
            className="opacity-55 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    </div>
  );
}
