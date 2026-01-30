"use client";

import DriftingImage from "@/components/DriftingImage";

interface DriftingMoonProps {
  sensitivity?: number;
}

export default function DriftingMoon({ sensitivity = 0.33 }: DriftingMoonProps) {
  return (
    <DriftingImage
      src="/stills/moon.png"
      alt="Moon"
      sensitivity={sensitivity}
      firstDelayMin={3000}
      firstDelayMax={10000}
      zIndex={5}
    />
  );
}
