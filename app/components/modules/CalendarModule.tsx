"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import {
  Subject,
  subjectColor,
  subjectFromString,
} from "@/app/components/ui/subjects";

/**
 * Calendar — a compact month view of dated events, persisted to localStorage.
 *
 * There is no scheduling backend, so events live entirely on the device under
 * `studytoolkit.calendar`. Each event is pinned to a single day (YYYY-MM-DD)
 * and carries a subject for color-coding consistent with the rest of the app.
 */

const STORAGE_KEY = "studytoolkit.calendar";

interface CalendarEvent {
  id: string;
  /** ISO day key: YYYY-MM-DD (local). */
  date: string;
  title: string;
  subject: Subject;
}

const SUBJECTS: Subject[] = [
  "General",
  "Mathematics",
  "Science",
  "Computer Science",
  "Humanities",
  "Business",
];

// --- Date helpers (all local-time; no timezone conversion) -----------------

/** Local YYYY-MM-DD key for a date. */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function loadEvents(): CalendarEvent[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is CalendarEvent =>
          !!e &&
          typeof e.id === "string" &&
          typeof e.date === "string" &&
          typeof e.title === "string",
      )
      .map((e) => ({ ...e, subject: subjectFromString(e.subject) }));
  } catch {
    return [];
  }
}

export default function CalendarModule() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // The month currently shown (any day within it).
  const [cursor, setCursor] = useState(() => new Date());
  // The day the user is adding/viewing events for (YYYY-MM-DD), or null.
  const [selected, setSelected] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSubject, setDraftSubject] = useState<Subject>("General");

  // Hydrate once on mount.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setEvents(loadEvents());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist after hydration whenever events change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      /* ignore */
    }
  }, [events, hydrated]);

  const todayKey = dayKey(new Date());

  // Build the 6-week grid (42 cells) for the cursor's month.
  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = first.getDay(); // 0=Sun
    const gridStart = new Date(year, month, 1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + i,
      );
      return { date: d, key: dayKey(d), inMonth: d.getMonth() === month };
    });
  }, [cursor]);

  // Group events by day for quick lookup.
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date);
      if (list) list.push(e);
      else map.set(e.date, [e]);
    }
    return map;
  }, [events]);

  const selectedEvents = selected ? byDay.get(selected) ?? [] : [];

  const addEvent = () => {
    if (!selected || !draftTitle.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: selected,
        title: draftTitle.trim(),
        subject: draftSubject,
      },
    ]);
    setDraftTitle("");
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const shiftMonth = (delta: number) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
    setSelected(null);
  };

  const prettySelected = selected
    ? new Date(`${selected}T00:00:00`).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="flex h-full flex-col">
      {/* Month header + navigation */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="rounded-md p-1 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-text">
          {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <button
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="rounded-md p-1 text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-faint">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className="mt-0.5 grid min-h-0 flex-1 grid-cols-7 gap-0.5">
        {cells.map(({ date, key, inMonth }) => {
          const dayEvents = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selected;
          return (
            <button
              key={key}
              onClick={() => {
                setSelected(key);
                setDraftTitle("");
              }}
              aria-label={`${date.getDate()}, ${dayEvents.length} events`}
              aria-pressed={isSelected}
              className={`flex flex-col items-center rounded-md py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 ${
                isSelected
                  ? "bg-accent-soft text-accent"
                  : "hover:bg-surface-2"
              } ${inMonth ? "text-text" : "text-faint"}`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isToday ? "bg-accent font-semibold text-white" : ""
                }`}
              >
                {date.getDate()}
              </span>
              {/* Up to 3 event dots, subject-colored. */}
              <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <span
                    key={e.id}
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: subjectColor[e.subject] }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected-day event editor */}
      {selected && (
        <div className="mt-2 shrink-0 rounded-md border border-line bg-surface-2/50 p-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-text">
              {prettySelected}
            </span>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close day"
              className="rounded p-0.5 text-faint transition-colors hover:text-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {selectedEvents.length > 0 && (
            <ul className="mb-1.5 max-h-20 space-y-1 overflow-y-auto">
              {selectedEvents.map((e) => (
                <li
                  key={e.id}
                  className="group/ev flex items-center gap-1.5 text-xs"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subjectColor[e.subject] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-text">
                    {e.title}
                  </span>
                  <button
                    onClick={() => removeEvent(e.id)}
                    aria-label={`Delete ${e.title}`}
                    className="shrink-0 text-faint opacity-0 transition-opacity hover:text-danger group-hover/ev:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-1.5">
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addEvent();
              }}
              placeholder="Add event…"
              aria-label="Event title"
              className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2 py-1 text-xs text-text outline-none focus:border-accent"
            />
            <select
              value={draftSubject}
              onChange={(e) => setDraftSubject(subjectFromString(e.target.value))}
              aria-label="Event subject"
              className="rounded-md border border-line bg-surface px-1 py-1 text-xs text-text outline-none focus:border-accent"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s === "Computer Science" ? "CS" : s}
                </option>
              ))}
            </select>
            <button
              onClick={addEvent}
              disabled={!draftTitle.trim()}
              aria-label="Add event"
              className="shrink-0 rounded-md bg-accent p-1 text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
