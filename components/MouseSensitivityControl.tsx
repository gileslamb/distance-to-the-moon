"use client";

interface MouseSensitivityControlProps {
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
}

export default function MouseSensitivityControl({ sensitivity, onSensitivityChange }: MouseSensitivityControlProps) {
  return (
    <div className="absolute top-8 right-48 flex flex-col items-center gap-2 text-white font-thin bg-transparent">
      <span className="uppercase opacity-100 text-xs tracking-wide">SENSITIVITY</span>
      <div className="h-24 w-6 flex items-center justify-center">
        <input
          type="range"
          min="0.2"
          max="2"
          step="0.1"
          value={sensitivity}
          onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
          className="w-24 h-5 -rotate-90 origin-center appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:bg-white/40
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-80
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1.5
            [&::-moz-range-track]:h-0.5 [&::-moz-range-track]:bg-white/40
            [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:opacity-80 [&::-moz-range-thumb]:border-0"
        />
      </div>
    </div>
  );
}
