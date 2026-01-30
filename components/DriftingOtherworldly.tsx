"use client";

import DriftingImage from "@/components/DriftingImage";

interface DriftingOtherworldlyProps {
  sensitivity?: number;
}

export default function DriftingOtherworldly({ sensitivity = 0.33 }: DriftingOtherworldlyProps) {
  return (
    <DriftingImage
      src="/stills/Otherworldly.png"
      alt="Otherworldly"
      sensitivity={sensitivity}
      firstDelayMin={22000}
      firstDelayMax={40000}
      zIndex={7}
    />
  );
}
