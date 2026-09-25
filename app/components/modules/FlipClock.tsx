"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * A single split-flap digit card. Shows the current value on a static card;
 * when the value changes, the top half of the *previous* value folds down
 * to reveal the new value beneath — the classic flip-clock effect.
 */
function FlipDigit({ value, accent }: { value: string; accent: string }) {
  const [prev, setPrev] = useState(value);
  const current = useRef(value);

  useEffect(() => {
    if (value !== current.current) {
      setPrev(current.current);
      current.current = value;
    }
  }, [value]);

  const cardBase =
    "absolute inset-0 flex items-center justify-center rounded-md bg-surface-2 font-mono text-4xl font-bold tabular-nums sm:text-5xl";

  return (
    <div className="relative h-16 w-11 select-none sm:h-20 sm:w-14">
      {/* The current value, always visible underneath. */}
      <div className={cardBase} style={{ color: accent }}>
        {value}
      </div>

      {/* Folding top-half of the previous value on change. */}
      <AnimatePresence>
        {prev !== value && (
          <motion.div
            key={`${prev}-${value}`}
            className="absolute inset-x-0 top-0 h-1/2 origin-bottom overflow-hidden rounded-t-md"
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            exit={{ rotateX: -90 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            onAnimationComplete={() => setPrev(value)}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <div
              className={cardBase}
              style={{ color: accent, height: "200%" }}
            >
              {prev}
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
}

export default function FlipClock({ minutes, seconds, accent }: FlipClockProps) {
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  return (
    <div
      className="flex items-center gap-1"
      style={{ perspective: 500 }}
      role="timer"
      aria-live="polite"
      aria-label={`${mm}:${ss} remaining`}
    >
      <FlipDigit value={mm[0]} accent={accent} />
      <FlipDigit value={mm[1]} accent={accent} />
      <span
        className="px-0.5 font-mono text-3xl font-bold sm:text-4xl"
        style={{ color: accent }}
      >
        :
      </span>
      <FlipDigit value={ss[0]} accent={accent} />
      <FlipDigit value={ss[1]} accent={accent} />
    </div>
  );
}
