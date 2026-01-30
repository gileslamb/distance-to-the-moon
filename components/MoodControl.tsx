"use client";

type Mood = "relaxed" | "frantic" | "otherworldly";

interface MoodControlProps {
  mood: Mood;
  onMoodChange: (mood: Mood) => void;
}

export default function MoodControl({ mood, onMoodChange }: MoodControlProps) {
  return (
    <div className="fixed bottom-8 right-8 flex gap-4 text-white font-medium brightness-150 bg-transparent">
      <button
        type="button"
        onClick={() => onMoodChange("frantic")}
        className={`px-3 py-1.5 uppercase transition ${mood === "frantic" ? "underline" : ""}`}
      >
        Frantic
      </button>
      <button
        type="button"
        onClick={() => onMoodChange("relaxed")}
        className={`px-3 py-1.5 uppercase transition ${mood === "relaxed" ? "underline" : ""}`}
      >
        Relaxed
      </button>
      <button
        type="button"
        onClick={() => onMoodChange("otherworldly")}
        className={`px-3 py-1.5 uppercase transition ${mood === "otherworldly" ? "underline" : ""}`}
      >
        Otherworldly
      </button>
    </div>
  );
}
