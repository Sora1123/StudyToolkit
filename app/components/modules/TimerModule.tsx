"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

/**
 * Pomodoro module — preserves the original Timer logic (25 min focus /
 * 5 min break, auto-transition on reaching zero) with a restyled, compact UI.
 */

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export default function TimerModule() {
  const [seconds, setSeconds] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) return prev - 1;
        // Reached zero: switch session type and reset.
        const nextFocus = !isFocus;
        setIsFocus(nextFocus);
        return nextFocus ? FOCUS_SECONDS : BREAK_SECONDS;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isFocus]);

  const reset = () => {
    setIsRunning(false);
    setSeconds(isFocus ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const format = (v: number) => v.toString().padStart(2, "0");
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <span
        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
          isFocus
            ? "bg-accent-soft text-accent"
            : "bg-success-soft text-success"
        }`}
      >
        {isFocus ? "Focus" : "Break"}
      </span>

      <div
        className="my-3 font-mono text-5xl font-bold tracking-tight text-text tabular-nums"
        role="timer"
        aria-live="polite"
        aria-label={`${format(minutes)}:${format(secs)} remaining`}
      >
        {format(minutes)}:{format(secs)}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsRunning((p) => !p)}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Start
            </>
          )}
        </button>
        <button
          onClick={reset}
          aria-label="Reset timer"
          title="Reset timer"
          className="rounded-md p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
