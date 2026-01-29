"use client";

type Mood = "relaxed" | "frantic" | "otherworldly";

interface MoodControlProps {
  mood: Mood;
  onMoodChange: (mood: Mood) => void;
}

export default function MoodControl({ mood, onMoodChange }: MoodControlProps) {
  return (
    <div className="fixed bottom-8 right-8 flex gap-4 text-white font-thin bg-transparent">
      <button
        type="button"
        onClick={() => onMoodChange("frantic")}
        className={`px-3 py-1.5 uppercase transition ${mood === "frantic" ? "opacity-100 underline" : "opacity-60 hover:opacity-80"}`}
      >
        Frantic
      </button>
      <button
        type="button"
        onClick={() => onMoodChange("relaxed")}
        className={`px-3 py-1.5 uppercase transition ${mood === "relaxed" ? "opacity-100 underline" : "opacity-60 hover:opacity-80"}`}
      >
        Relaxed
      </button>
      <button
        type="button"
        onClick={() => onMoodChange("otherworldly")}
        className={`px-3 py-1.5 uppercase transition ${mood === "otherworldly" ? "opacity-100 underline" : "opacity-60 hover:opacity-80"}`}
      >
        Otherworldly
      </button>
    </div>
  );
}
