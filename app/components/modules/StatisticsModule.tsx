"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, CheckCircle2, Flame, BookOpen } from "lucide-react";

/**
 * Study Statistics — a concise weekly overview.
 *
 * "Tasks completed" is derived live from /api/ToDo (counts items marked
 * completed). Study time, streak, most-studied and the weekly bars are
 * clearly-structured local sample data pending an analytics backend.
 */

// Sample weekly study minutes (Mon–Sun).
const weekly = [45, 80, 30, 95, 60, 120, 40];
const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);
  return value;
}

export default function StatisticsModule() {
  const [tasksDone, setTasksDone] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ToDo");
        const data = await res.json();
        if (cancelled) return;
        const done = Array.isArray(data)
          ? data.filter((t: { completed?: boolean }) => t.completed).length
          : 0;
        setTasksDone(done);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalMin = weekly.reduce((a, b) => a + b, 0);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const maxBar = Math.max(...weekly);

  const animTasks = useCountUp(tasksDone);
  const animStreak = useCountUp(5);

  const stats = [
    {
      icon: Clock,
      label: "This week",
      value: `${hours}h ${mins}m`,
    },
    {
      icon: CheckCircle2,
      label: "Tasks done",
      value: String(animTasks),
    },
    {
      icon: Flame,
      label: "Streak",
      value: `${animStreak} days`,
    },
    {
      icon: BookOpen,
      label: "Top subject",
      value: "Math",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Weekly bar sparkline */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-muted">
            Study time this week
          </span>
          <span className="text-xs font-semibold text-text">
            {hours}h {mins}m
          </span>
        </div>
        <div className="flex h-16 items-end gap-1.5">
          {weekly.map((v, i) => (
            <div
              key={i}
              className="flex flex-1 flex-col items-center gap-1"
              title={`${v} min`}
            >
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-accent/80 transition-all duration-500"
                  style={{ height: `${(v / maxBar) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-faint">{weekdayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid flex-1 grid-cols-2 gap-2">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col justify-center rounded-md border border-line bg-surface-2/50 p-2.5"
          >
            <Icon className="h-3.5 w-3.5 text-muted" />
            <p className="mt-1.5 text-sm font-semibold leading-tight text-text">
              {value}
            </p>
            <p className="text-[10px] leading-tight text-faint">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
