"use client";

import { useState, useEffect } from "react";

const studyDefaultTime = 5;
const restDefaultTime = 3;

export default function Timer() {
  const [seconds, setSeconds] = useState(studyDefaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isStudying, setIsStudying] = useState(true);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (seconds === 0) {
      setIsRunning(false);
      const nextIsStudying = !isStudying;
      setIsStudying(nextIsStudying);
      setSeconds(nextIsStudying ? studyDefaultTime : restDefaultTime);
    }
  }, [seconds, isStudying]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <>
      <p className="flex justify-center">
        {formatTime(minutes)} : {formatTime(remainingSeconds)}
      </p>
      <button onClick={() => setIsRunning((prev) => !prev)}>
        {isRunning ? "Pause" : "Start"}
      </button>
    </>
  );
}
