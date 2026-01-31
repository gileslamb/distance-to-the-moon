"use client";

interface MusicControlsProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  onReseed: () => void;
}

export default function MusicControls({ isMuted, onMuteToggle, onReseed }: MusicControlsProps) {
  return (
    <div className="fixed bottom-8 right-8 flex gap-3 font-medium text-sm text-white brightness-150 tracking-wider uppercase">
      <button
        type="button"
        onClick={onMuteToggle}
        className="px-3 py-1.5 rounded bg-black/60 backdrop-blur-[2px] border border-white/20 hover:bg-black/80 transition"
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <button
        type="button"
        onClick={onReseed}
        className="px-3 py-1.5 rounded bg-black/60 backdrop-blur-[2px] border border-white/20 hover:bg-black/80 transition"
      >
        Reseed
      </button>
    </div>
  );
}
