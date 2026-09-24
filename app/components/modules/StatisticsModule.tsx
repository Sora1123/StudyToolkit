"use client";

import { Clock, CheckCircle2, Flame, BookOpen } from "lucide-react";

/**
 * Study Statistics — concise study metrics.
 *
 * There is no analytics backend yet, so these are clearly-structured local
 * sample values. Replace `stats` with a fetch/derivation once study activity
 * is tracked.
 */

const stats = [
  { icon: Clock, label: "Study time this week", value: "12h 40m" },
  { icon: CheckCircle2, label: "Tasks completed", value: "27" },
  { icon: Flame, label: "Study streak", value: "5 days" },
  { icon: BookOpen, label: "Most studied", value: "Mathematics" },
];

export default function StatisticsModule() {
  return (
    <div className="grid h-full grid-cols-2 gap-2">
      {stats.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex flex-col justify-between rounded-md border border-line bg-surface-2/50 p-3"
        >
          <Icon className="h-4 w-4 text-muted" />
          <div className="mt-2">
            <p className="text-base font-semibold leading-tight text-text">
              {value}
            </p>
            <p className="mt-0.5 text-[11px] leading-tight text-faint">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
