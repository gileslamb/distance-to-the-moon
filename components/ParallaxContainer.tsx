"use client";

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
}

function getParallaxStrength(child: React.ReactElement): number {
  const props = child?.props ?? {};
  const raw =
    props["data-parallax-strength"] ??
    (props as { parallaxStrength?: number }).parallaxStrength;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(2, Math.max(0, n)) : 0;
}

export default function ParallaxContainer({ children, className = "" }: ParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMouse({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const dx = (mouse.x - 0.5) * 2;
  const dy = (mouse.y - 0.5) * 2;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {React.Children.map(children, (child, i) => {
        const element = child as React.ReactElement;
        const strength = React.isValidElement(element) ? getParallaxStrength(element) : 0;
        const moveX = dx * strength * 20;
        const moveY = dy * strength * 20;
        return (
          <div
            key={element?.key ?? i}
            style={{
              position: "absolute",
              transition: "transform 0.15s ease-out",
              transform: `translate(${moveX}px, ${moveY}px)`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
