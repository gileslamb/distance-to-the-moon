export interface Track {
  id: string;
  title: string;
  filename: string;
  duration: number; // seconds, estimate
}

export const trackList: Track[] = [
  { id: "cosmic-whale", title: "Cosmic Whale", filename: "/music/Cosmic Whale.mp3", duration: 240 },
  { id: "distance-full", title: "Distance to The Moon (Full Score)", filename: "/music/DIstance to The Moon (Full Score).mp3", duration: 300 },
  { id: "escape-velocity", title: "Escape Velocity", filename: "/music/Escape Velocity.mp3", duration: 240 },
  { id: "ladder", title: "Ladder", filename: "/music/Ladder.mp3", duration: 180 },
  { id: "moon-landing", title: "Moon Landing", filename: "/music/Moon Landing.mp3", duration: 240 },
  { id: "otherworldly", title: "Otherworldly", filename: "/music/Otherworldly.mp3", duration: 240 },
  { id: "satellite", title: "Satellite", filename: "/music/Satellite.mp3", duration: 240 },
  { id: "space", title: "Space", filename: "/music/Space.mp3", duration: 240 },
  { id: "spiral", title: "Spiral", filename: "/music/Spiral.mp3", duration: 240 },
  { id: "x-space-variation", title: "X Space Theme Variation", filename: "/music/X Space Theme Variation.mp3", duration: 240 },
  { id: "x-space-theme", title: "X Space Theme", filename: "/music/X Space Theme.mp3", duration: 240 },
];
