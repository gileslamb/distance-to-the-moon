"use client";

export type View = "listen" | "film" | "music";

interface NavigationMenuProps {
  view: View;
  onViewChange: (view: View) => void;
}

export default function NavigationMenu({ view, onViewChange }: NavigationMenuProps) {
  return (
    <nav className="fixed bottom-8 left-8 flex flex-col gap-1 font-thin text-sm text-white/90 tracking-wider uppercase backdrop-blur-[2px]">
      {(["listen", "film", "music"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onViewChange(v)}
          className={`px-3 py-1.5 rounded text-left transition ${view === v ? "opacity-100 underline bg-white/10" : "opacity-60 hover:opacity-80"}`}
        >
          {v === "listen" ? "Listen" : v === "film" ? "Film" : "Music"}
        </button>
      ))}
    </nav>
  );
}
