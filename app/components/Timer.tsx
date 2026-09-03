"use client";

import { useState, useEffect } from "react";

const studyDefaultTime = 25 * 60;
const restDefaultTime = 5 * 60;

export default function Timer() {
  const [seconds, setSeconds] = useState(studyDefaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isStudying, setIsStudying] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (seconds === 0) {
      const nextIsStudying = !isStudying;
      setIsStudying(nextIsStudying);
      setSeconds(nextIsStudying ? studyDefaultTime : restDefaultTime);
    }
  }, [seconds, isStudying]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full border border-slate-100">
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider mb-2 ${
          isStudying
            ? "bg-indigo-100 text-indigo-700"
            : "bg-emerald-100 text-emerald-700"
        }`}
      >
        {isStudying ? "Study Session" : "Rest Break"}
      </span>

      <div className="text-6xl font-extrabold text-slate-800 tracking-tight my-4 font-mono">
        {formatTime(minutes)}:{formatTime(remainingSeconds)}
      </div>

      <button
        onClick={() => setIsRunning((prev) => !prev)}
        className={`w-full py-3 px-6 rounded-xl font-medium transition-all shadow-md text-white active:scale-95 ${
          isRunning
            ? "bg-amber-500 hover:bg-amber-600"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
    </div>
  );
}