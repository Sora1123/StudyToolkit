"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const studyDefaultTime = 25 * 60;
const restDefaultTime = 5 * 60;

export default function Timer() {
  const [seconds, setSeconds] = useState(studyDefaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isStudying, setIsStudying] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) return prev - 1;
        const nextStudying = !isStudying;
        setIsStudying(nextStudying);
        return nextStudying ? studyDefaultTime : restDefaultTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isStudying]);

  const reset = () => {
    setIsRunning(false);
    setSeconds(isStudying ? studyDefaultTime : restDefaultTime);
  };

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <div className="flex w-full max-w-sm flex-col items-center rounded-lg border border-line bg-surface p-8">
      <span
        className={`mb-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
          isStudying
            ? "bg-accent-soft text-accent"
            : "bg-success-soft text-success"
        }`}
      >
        {isStudying ? "Study Session" : "Rest Break"}
      </span>

      <div
        className="my-4 font-mono text-6xl font-bold tracking-tight text-text tabular-nums"
        role="timer"
        aria-live="polite"
        aria-label={`${formatTime(minutes)}:${formatTime(
          remainingSeconds,
        )} remaining`}
      >
        {formatTime(minutes)}:{formatTime(remainingSeconds)}
      </div>

      <div className="flex w-full items-center gap-2">
        <button
          onClick={() => setIsRunning((prev) => !prev)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
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
          className="rounded-md border border-line p-3 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
