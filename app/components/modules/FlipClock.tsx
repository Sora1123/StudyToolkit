"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * A single split-flap digit card. Shows the current value on a static card;
 * when the value changes, the top half of the *previous* value folds down
 * to reveal the new value beneath — the classic flip-clock effect.
 */
function FlipDigit({
  value,
  accent,
  size,
}: {
  value: string;
  accent: string;
  /** Height of the digit card in px. Width and font scale from this. */
  size: number;
}) {
  // `shown` is the digit currently settled on the card (both halves at rest).
  // `incoming` is the digit the flap is folding toward. We detect changes
  // *during render* (not in an effect) so no intermediate frame is ever
  // painted with the new digit already in the bottom half.
  const [shown, setShown] = useState(value);
  const [incoming, setIncoming] = useState(value);

  if (value !== incoming) {
    // A new value arrived: start folding from `incoming`→`value`. Whatever the
    // flap was previously folding to (`incoming`) is now settled as `shown`.
    setShown(incoming);
    setIncoming(value);
  }

  const flipping = shown !== incoming;

  const width = Math.round(size * 0.7);
  const fontSize = Math.round(size * 0.55);
  const radius = Math.max(3, Math.round(size * 0.08));

  const cardBase =
    "absolute inset-0 flex items-center justify-center bg-surface-2 font-mono font-bold tabular-nums";
  const cardStyle = { color: accent, fontSize, height: "200%" as const };

  return (
    <div
      className="relative select-none"
      style={{ height: size, width }}
    >
      {/* Top half: shows the NEW value (revealed as the old flap folds away). */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 overflow-hidden"
        style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius }}
      >
        <div className={cardBase} style={{ ...cardStyle, top: 0 }}>
          {incoming}
        </div>
      </div>
      {/* Bottom half: keeps the OLD (settled) digit until the fold completes. */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden"
        style={{ borderBottomLeftRadius: radius, borderBottomRightRadius: radius }}
      >
        <div className={cardBase} style={{ ...cardStyle, top: "-100%" }}>
          {shown}
        </div>
      </div>

      {/* Folding top-half of the previous (settled) digit on change. */}
      <AnimatePresence>
        {flipping && (
          <motion.div
            key={`${shown}-${incoming}`}
            className="absolute inset-x-0 top-0 h-1/2 origin-bottom overflow-hidden"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            exit={{ rotateX: -90 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            onAnimationComplete={() => setShown(incoming)}
          >
            <div className={cardBase} style={cardStyle}>
              {shown}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center hinge line */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/10 dark:bg-white/10" />
    </div>
  );
}

interface FlipClockProps {
  minutes: number;
  seconds: number;
  accent: string;
  /** Digit-card height in px; the whole clock scales from this. */
  size?: number;
}

export default function FlipClock({
  minutes,
  seconds,
  accent,
  size = 80,
}: FlipClockProps) {
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  const gap = Math.max(2, Math.round(size * 0.05));
  const colonSize = Math.round(size * 0.45);
  return (
    <div
      className="flex items-center"
      style={{ perspective: 500, gap }}
      role="timer"
      aria-live="polite"
      aria-label={`${mm}:${ss} remaining`}
    >
      <FlipDigit value={mm[0]} accent={accent} size={size} />
      <FlipDigit value={mm[1]} accent={accent} size={size} />
      <span
        className="font-mono font-bold"
        style={{ color: accent, fontSize: colonSize, padding: `0 ${gap / 2}px` }}
      >
        :
      </span>
      <FlipDigit value={ss[0]} accent={accent} size={size} />
      <FlipDigit value={ss[1]} accent={accent} size={size} />
    </div>
  );
}
