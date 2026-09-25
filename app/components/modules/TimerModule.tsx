"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import FlipClock from "./FlipClock";
import { useSettings } from "@/app/components/settings/SettingsProvider";

type Phase = "focus" | "break" | "longBreak";

export default function TimerModule() {
  const { settings } = useSettings();
  const cycle = settings.pomodoro;

  const [phase, setPhase] = useState<Phase>("focus");
  const [seconds, setSeconds] = useState(cycle.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [round, setRound] = useState(0); // completed focus sessions in this set

  const phaseSeconds = (p: Phase) =>
    (p === "focus" ? cycle.focus : p === "break" ? cycle.break : cycle.longBreak) *
    60;

  // Reset the timer when the configured durations change (and not running).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isRunning) setSeconds(phaseSeconds(phase));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle.focus, cycle.break, cycle.longBreak]);

  const advance = () => {
    // Determine the next phase based on the cycle.
    if (phase === "focus") {
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= cycle.rounds) {
        setPhase("longBreak");
        setSeconds(cycle.longBreak * 60);
      } else {
        setPhase("break");
        setSeconds(cycle.break * 60);
      }
    } else {
      if (phase === "longBreak") setRound(0);
      setPhase("focus");
      setSeconds(cycle.focus * 60);
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) return prev - 1;
        // Reached zero — advance to the next phase on the next tick.
        advance();
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, round, cycle]);

  const reset = () => {
    setIsRunning(false);
    setSeconds(phaseSeconds(phase));
  };

  const skip = () => {
    setIsRunning(false);
    advance();
  };

  const total = phaseSeconds(phase);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = total > 0 ? 1 - seconds / total : 0;
  const isFocus = phase === "focus";
  const accentVar = isFocus ? "var(--accent)" : "var(--success)";
  const label =
    phase === "focus" ? "Focus" : phase === "break" ? "Break" : "Long break";

  const R = 92;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <span
        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
          isFocus ? "bg-accent-soft text-accent" : "bg-success-soft text-success"
        }`}
      >
        {label}
      </span>

      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" className="rotate-[-90deg]">
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--line)" strokeWidth="4" />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={accentVar}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.8s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <FlipClock minutes={minutes} seconds={secs} accent={accentVar} />
        </div>
      </div>

      {/* Round dots for this focus set */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: cycle.rounds }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full transition-colors"
            style={{
              backgroundColor: i < round ? "var(--accent)" : "var(--line-strong)",
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          aria-label="Reset timer"
          title="Reset"
          className="rounded-md p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsRunning((p) => !p)}
          className="inline-flex min-w-24 items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
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
          onClick={skip}
          aria-label="Skip session"
          title="Skip"
          className="rounded-md p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
