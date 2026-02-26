"use client";

interface MusicControlsProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  onReseed: () => void;
}

export default function MusicControls({ isMuted, onMuteToggle, onReseed }: MusicControlsProps) {
  return (
    <div className="fixed flex gap-2 font-medium text-sm text-white brightness-150 tracking-wider uppercase md:bottom-8 md:right-8 max-md:left-[230px] max-md:right-auto max-md:top-[calc(2rem+var(--announcement-offset,0px))]">
      <button
        type="button"
        onClick={onMuteToggle}
        className="px-2.5 py-1.5 rounded bg-black/60 backdrop-blur-[2px] border border-white/20 hover:bg-black/80 transition text-xs md:text-sm"
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <button
        type="button"
        onClick={onReseed}
        className="px-2.5 py-1.5 rounded bg-black/60 backdrop-blur-[2px] border border-white/20 hover:bg-black/80 transition text-xs md:text-sm"
      >
        Reseed
      </button>
    </div>
  );
}
