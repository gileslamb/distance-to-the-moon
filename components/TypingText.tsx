"use client";

import { useTypingText } from "@/hooks/useTypingText";

const TYPING_INTERVAL = 12;

interface TypingTextProps {
  text: string;
  /** Optional: render the first line in gold */
  firstLineGold?: boolean;
  /** Optional: gold character ranges [start, end) for credits */
  goldRanges?: Array<[number, number]>;
  /** Optional: link ranges [start, end, href] for mailto etc */
  linkRanges?: Array<[number, number, string]>;
  className?: string;
  /** Gold color for labels */
  goldColor?: string;
}

type SpanType = { text: string; color: string; href?: string };

function getSpans(
  displayedText: string,
  goldRanges: Array<[number, number]>,
  linkRanges: Array<[number, number, string]> | undefined,
  goldColor: string
): SpanType[] {
  if (!goldRanges?.length && !linkRanges?.length) {
    return [{ text: displayedText, color: "white" }];
  }
  const points = new Set<number>([0, displayedText.length]);
  for (const [s, e] of goldRanges ?? []) {
    points.add(s);
    points.add(e);
  }
  for (const [s, e] of linkRanges ?? []) {
    points.add(s);
    points.add(e);
  }
  const sorted = [...points].sort((a, b) => a - b);
  const spans: SpanType[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    if (start >= displayedText.length) continue;
    const text = displayedText.slice(start, Math.min(end, displayedText.length));
    if (!text) continue;
    const isGold = (goldRanges ?? []).some(([rs, re]) => start >= rs && end <= re) ||
      (linkRanges ?? []).some(([rs, re]) => start >= rs && end <= re);
    const link = linkRanges?.find(([s, e]) => start >= s && end <= e);
    spans.push({
      text,
      color: isGold ? goldColor : "white",
      href: link?.[2],
    });
  }
  return spans;
}

export function TypingText({
  text,
  firstLineGold = false,
  goldRanges,
  linkRanges,
  className = "",
  goldColor = "#C9A961",
}: TypingTextProps) {
  const { displayedText, isDone } = useTypingText(text, TYPING_INTERVAL);

  if ((goldRanges && goldRanges.length > 0) || (linkRanges && linkRanges.length > 0)) {
    const spans = getSpans(displayedText, goldRanges ?? [], linkRanges, goldColor);
    return (
      <div className={`whitespace-pre-wrap ${className}`} style={{ filter: "none" }}>
        {spans.map((s, i) =>
          s.href ? (
            <a
              key={i}
              href={s.href}
              className="hover:underline"
              style={{ color: goldColor }}
            >
              {s.text}
            </a>
          ) : (
            <span key={i} style={{ color: s.color }}>
              {s.text}
            </span>
          )
        )}
        {!isDone && <span className="animate-pulse">|</span>}
      </div>
    );
  }

  if (firstLineGold) {
    const parts = displayedText.split("\n");
    const completeLines = parts.slice(0, -1);
    const currentLine = parts[parts.length - 1] ?? "";
    const isOnFirstLine = completeLines.length === 0;
    return (
      <div className={`leading-relaxed space-y-2 ${className}`}>
        {completeLines.map((line, i) => (
          <p key={i} style={i === 0 ? { color: goldColor } : undefined}>
            {line}
          </p>
        ))}
        {currentLine && (
          <p style={isOnFirstLine ? { color: goldColor } : undefined}>
            {currentLine}
            {!isDone && <span className="animate-pulse text-white">|</span>}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {displayedText}
      {!isDone && <span className="animate-pulse">|</span>}
    </div>
  );
}
