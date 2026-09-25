"use client";

import { useState, useEffect, useRef } from "react";
import { Reorder, useDragControls } from "motion/react";
import { CheckCircle2, Circle, Plus, GripVertical } from "lucide-react";
import { PriorityBadge, SubjectTag } from "@/app/components/ui/Tags";
import {
  Priority,
  Subject,
  subjectFromString,
} from "@/app/components/ui/subjects";

/**
 * "Today's Tasks" — reuses the existing /api/ToDo data ({ id, task }).
 * Drag the handle to reorder; check to complete. Completion/subject/priority
 * are UI-level enrichments (backend only stores { id, task }).
 */

interface ApiTask {
  id: string;
  task: string;
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

function TaskRow({
  task,
  onToggle,
}: {
  task: UiTask;
  onToggle: (id: string) => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      dragElastic={0}
      dragMomentum={false}
      transition={{ duration: 0.12, ease: "linear" }}
      className="group/task flex items-start gap-2 rounded-md bg-surface py-1.5 hover:bg-surface-2"
      onPointerDown={(e) => controls.start(e)}
      onClick={() => onToggle(task.id)}
    >
      <button
        aria-label="Drag to reorder"
        className="h-100% mt-0.5 cursor-grab touch-none text-faint opacity-0 transition-opacity group-hover/task:opacity-100 active:cursor-grabbing"
        onClick={(e) => {e.stopPropagation()}}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        className="mt-0.5 text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {task.completed ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>
      <div className="min-w-0 max-w-full">
        <p
          className={`text-sm leading-snug select-none cursor-default ${
            task.completed ? "text-faint line-through" : "text-text"
          }`}
        >
          {task.task}
        </p>
        <div className="mt-1 flex items-center gap-2 select-none cursor-default">
          <SubjectTag subject={task.subject} />
          {task.priority && <PriorityBadge priority={task.priority} />}
        </div>
      </div>
      {/* Blank right area — drag here to reorder the task. */}
      <div
        aria-hidden
        className="min-w-8 flex-1 cursor-grab touch-none self-stretch active:cursor-grabbing"
        onClick={(e) => {e.stopPropagation()}}
      />
    </Reorder.Item>
  );
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

      <div className="-mx-1 flex-1 overflow-y-auto pr-1">
        {loading ? (
          <p className="py-6 text-center text-sm text-faint">Loading…</p>
        ) : total === 0 ? (
          <p className="py-6 text-center text-sm text-faint">
            No tasks yet. Add one below.
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={tasks}
            onReorder={setTasks}
            className="space-y-0.5"
          >
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={toggle} />
            ))}
          </Reorder.Group>
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
