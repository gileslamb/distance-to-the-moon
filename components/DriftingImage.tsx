"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface DriftParams {
  startX: string;
  endX: string;
  startY: string;
  endY: string;
  startScale: number;
  endScale: number;
  rotation: number;
}

interface DriftingImageProps {
  src: string;
  alt: string;
  sensitivity?: number;
  firstDelayMin?: number;
  firstDelayMax?: number;
  zIndex?: number;
}

const DRIFT_DURATION = 54000;
const PARALLAX_FACTOR = 0.3 * 15;

export default function DriftingImage({
  src,
  alt,
  sensitivity = 0.33,
  firstDelayMin = 3000,
  firstDelayMax = 15000,
  zIndex = 5,
}: DriftingImageProps) {
  const [isDrifting, setIsDrifting] = useState(false);
  const [driftParams, setDriftParams] = useState<DriftParams>({
    startX: "50%",
    endX: "50%",
    startY: "95%",
    endY: "-15%",
    startScale: 2,
    endScale: 0.35,
    rotation: 360,
  });
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
    const scheduleNextDrift = () => {
      const delay = isFirst
        ? firstDelayMin + Math.random() * (firstDelayMax - firstDelayMin)
        : 25000 + Math.random() * 35000;
      isFirst = false;
      const t = setTimeout(() => {
        const startXPercent = 15 + Math.random() * 70;
        const angleOffset = (Math.random() - 0.5) * 40;
        const endXPercent = startXPercent + angleOffset;
        const rotationDir = Math.random() > 0.5 ? 1 : -1;
        const rotation = rotationDir * (300 + Math.random() * 180);

        setDriftParams({
          startX: `${startXPercent}%`,
          endX: `${Math.max(5, Math.min(95, endXPercent))}%`,
          startY: "95%",
          endY: `${-10 - Math.random() * 15}%`,
          startScale: 1.5 + Math.random() * 0.5,
          endScale: 0.3 + Math.random() * 0.2,
          rotation,
        });
        setIsDrifting(true);

        setTimeout(() => {
          setIsDrifting(false);
          scheduleNextDrift();
        }, DRIFT_DURATION);
      }, delay);
      return () => clearTimeout(t);
    };
    const cleanup = scheduleNextDrift();
    return cleanup;
  }, [firstDelayMin, firstDelayMax]);

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
          className={`absolute ${isDrifting ? "opacity-100" : "opacity-0"}`}
          style={{
            "--moon-start-x": driftParams.startX,
            "--moon-end-x": driftParams.endX,
            "--moon-start-y": driftParams.startY,
            "--moon-end-y": driftParams.endY,
            "--moon-start-scale": driftParams.startScale,
            "--moon-end-scale": driftParams.endScale,
            "--moon-rotation": `${driftParams.rotation}deg`,
            animation: isDrifting
              ? `moon-drift ${DRIFT_DURATION / 1000}s cubic-bezier(0.22, 0.61, 0.36, 1) forwards`
              : "none",
            transition: "opacity 1.5s ease-in-out",
          } as React.CSSProperties}
        >
          <div
            style={
              isDrifting
                ? { animation: "moon-wobble 4s ease-in-out infinite" }
                : undefined
            }
          >
            <Image
              src={src}
              alt={alt}
              width={280}
              height={280}
              className="opacity-60 drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
