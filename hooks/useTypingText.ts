"use client";

import { useEffect, useState } from "react";

const TYPING_INTERVAL = 12; // 40% faster than original 20ms (20 * 0.6)

export function useTypingText(text: string, intervalMs = TYPING_INTERVAL, enabled = true) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedLength(text.length);
      setIsDone(true);
      return;
    }
    setDisplayedLength(0);
    setIsDone(false);
    let index = 0;
    const id = setInterval(() => {
      index++;
      setDisplayedLength(index);
      if (index >= text.length) {
        setIsDone(true);
        clearInterval(id);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [text, intervalMs, enabled]);

  return {
    displayedText: text.slice(0, displayedLength),
    isDone,
  };
}
