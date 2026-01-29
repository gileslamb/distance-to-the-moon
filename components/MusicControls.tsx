"use client";

interface MusicControlsProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  onReseed: () => void;
}

export default function MusicControls({ isMuted, onMuteToggle, onReseed }: MusicControlsProps) {
  return (
    <div className="fixed bottom-16 right-8 flex gap-3 font-thin text-sm text-white/80 tracking-wider uppercase">
      <button
        type="button"
        onClick={onMuteToggle}
        className="px-3 py-1.5 rounded bg-white/5 backdrop-blur-[2px] border border-white/20 hover:bg-white/10 transition"
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <button
        type="button"
        onClick={onReseed}
        className="px-3 py-1.5 rounded bg-white/5 backdrop-blur-[2px] border border-white/20 hover:bg-white/10 transition"
      >
        Reseed
      </button>
    </div>
  );
}
