"use client";

import DriftingImage from "@/components/DriftingImage";

interface DriftingJacketProps {
  sensitivity?: number;
}

export default function DriftingJacket({ sensitivity = 0.33 }: DriftingJacketProps) {
  return (
    <DriftingImage
      src="/stills/jacket.png"
      alt="Jacket"
      sensitivity={sensitivity}
      firstDelayMin={12000}
      firstDelayMax={28000}
      zIndex={6}
    />
  );
}
