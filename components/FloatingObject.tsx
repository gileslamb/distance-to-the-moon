"use client";

import Image from "next/image";

interface FloatingObjectProps {
  src: string;
  alt: string;
  className?: string;
  parallaxStrength?: number;
  width?: number;
  height?: number;
}

export default function FloatingObject({
  src,
  alt,
  className = "",
  parallaxStrength = 1,
  width = 120,
  height = 120,
}: FloatingObjectProps) {
  const strength = Math.min(2, Math.max(0, parallaxStrength));

  return (
    <div
      className={className}
      data-parallax-strength={strength}
      style={{
        position: "absolute",
        transition: "transform 0.2s ease-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <Image src={src} alt={alt} width={width} height={height} />
    </div>
  );
}
