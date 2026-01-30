"use client";

export type View = "home" | "film" | "album";

interface NavigationMenuProps {
  view: View;
  onViewChange: (view: View) => void;
}

export default function NavigationMenu({ view, onViewChange }: NavigationMenuProps) {
  return (
    <nav className="fixed bottom-8 left-8 flex flex-col gap-1 font-medium text-sm text-white brightness-150 tracking-wider uppercase backdrop-blur-[2px] bg-black/60 rounded-lg px-2 py-2">
      {(["home", "film", "album"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onViewChange(v)}
          className={`px-3 py-1.5 rounded text-left transition ${view === v ? "underline bg-white/10" : ""}`}
        >
          {v === "home" ? "Home" : v === "film" ? "Film" : "Album"}
        </button>
      ))}
    </nav>
  );
}
