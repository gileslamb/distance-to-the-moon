"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface DriftingSwimmerConfig {
  imagePath: string;
  name: string;
  minDelay: number;
  maxDelay: number;
  waveAnim: "slow" | "fast";
  zIndex?: number;
}

interface DriftingSwimmerProps extends DriftingSwimmerConfig {
  sensitivity?: number;
}

const SWIM_DURATION = 50000; // 50s slow horizontal drift
const PARALLAX_FACTOR = 0.3 * 15;

export default function DriftingSwimmer({
  imagePath,
  name,
  minDelay,
  maxDelay,
  waveAnim = "slow",
  zIndex = 4,
  sensitivity = 0.33,
}: DriftingSwimmerProps) {
  const [isSwimming, setIsSwimming] = useState(false);
  const [baseY, setBaseY] = useState("40%");
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
        : 90000 + Math.random() * 90000; // 90-180s between swims
      isFirst = false;
      const t = setTimeout(() => {
        setBaseY(`${25 + Math.random() * 50}%`); // Random vertical lane 25-75%
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

  const waveKeyframes = waveAnim === "fast" ? "swim-wave-fast" : "swim-wave-slow";
  const waveDuration = waveAnim === "fast" ? 2.5 : 4;

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
            animation: isSwimming
              ? `swim-horizontal ${SWIM_DURATION / 1000}s ease-in-out forwards`
              : "none",
            transition: "opacity 1.5s ease-in-out",
          } as React.CSSProperties}
        >
          <div
            style={
              isSwimming
                ? {
                    animation: `${waveKeyframes} ${waveDuration}s ease-in-out infinite`,
                  }
                : undefined
            }
          >
            <Image
              src={imagePath}
              alt={name}
              width={200}
              height={120}
              unoptimized
              className="opacity-55 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
