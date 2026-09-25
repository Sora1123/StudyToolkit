"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { PriorityBadge, SubjectTag } from "@/app/components/ui/Tags";
import { Priority, Subject, subjectFromString } from "@/app/components/ui/subjects";

/**
 * "Today's Tasks" — reuses the existing /api/ToDo data ({ id, task }).
 *
 * Completion, subject, and priority are UI-level enrichments: the existing
 * backend only stores { id, task }, so completion is tracked in component
 * state (functional within the session) and subject/priority are optional
 * metadata inferred locally. This keeps the existing API/data untouched while
 * making the module easy to extend once the backend supports these fields.
 */

interface ApiTask {
  id: string;
  task: string;
  // Optional fields the backend may add later.
  completed?: boolean;
  subject?: string;
  priority?: Priority;
}

interface UiTask {
  id: string;
  task: string;
  completed: boolean;
  subject: Subject;
  priority?: Priority;
}

export default function TasksModule() {
  const [tasks, setTasks] = useState<UiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ToDo");
        const data: ApiTask[] = await res.json();
        if (cancelled) return;
        setTasks(
          (Array.isArray(data) ? data : []).map((t) => ({
            id: String(t.id),
            task: String(t.task ?? ""),
            completed: Boolean(t.completed),
            subject: subjectFromString(t.subject),
            priority: t.priority,
          })),
        );
      } catch (e) {
        console.error("Failed to fetch tasks:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );

  const addTask = async () => {
    const value = newTask.trim();
    if (!value) return;
    try {
      const res = await fetch("/api/ToDo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: value }),
      });
      const created: ApiTask = await res.json();
      setTasks((prev) => [
        ...prev,
        {
          id: String(created.id),
          task: String(created.task ?? value),
          completed: false,
          subject: "General",
        },
      ]);
      setNewTask("");
      inputRef.current?.focus();
    } catch (e) {
      console.error("Failed to add task:", e);
    }
  };

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  // Active tasks first, completed sink to the bottom.
  const ordered = [...tasks].sort(
    (a, b) => Number(a.completed) - Number(b.completed),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-faint">Today</span>
          <span className="text-xs font-medium text-muted">
            {done} / {total} completed
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="-mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
        {loading ? (
          <p className="py-6 text-center text-sm text-faint">Loading…</p>
        ) : total === 0 ? (
          <p className="py-6 text-center text-sm text-faint">
            No tasks yet. Add one below.
          </p>
        ) : (
          ordered.map((t) => (
            <div
              key={t.id}
              className="group/task flex items-start gap-2.5 rounded-md px-1.5 py-1.5 hover:bg-surface-2"
            >
              <button
                onClick={() => toggle(t.id)}
                aria-label={
                  t.completed ? "Mark incomplete" : "Mark complete"
                }
                className="mt-0.5 text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm leading-snug ${
                    t.completed
                      ? "text-faint line-through"
                      : "text-text"
                  }`}
                >
                  {t.task}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <SubjectTag subject={t.subject} />
                  {t.priority && <PriorityBadge priority={t.priority} />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }}
        className="mt-2 flex items-center gap-2 border-t border-line pt-2"
      >
        <input
          ref={inputRef}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task…"
          aria-label="Add a task"
          className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none placeholder:text-faint focus:border-accent"
        />
        <button
          type="submit"
          aria-label="Add task"
          className="flex items-center justify-center rounded-md bg-accent p-1.5 text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
