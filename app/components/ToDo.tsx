"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Trash2, Plus, ListTodo } from "lucide-react";

interface Task {
  id: string;
  task: string;
}

export default function ToDo() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ToDo");
        const data = await res.json();
        if (!cancelled) setTasks(Array.isArray(data) ? data : []);
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

  const addTask = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await fetch("/api/ToDo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask }),
      });
      const data = await res.json();
      setTasks((prev) => [...prev, data]);
      setNewTask("");
    } catch (e) {
      console.error("Failed to add task:", e);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/ToDo/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Failed to delete task:", e);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={addTask} className="mb-4 flex gap-2">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task"
          className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-accent"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      {loading ? (
        <p className="py-10 text-center text-sm text-faint">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong py-12 text-center">
          <ListTodo className="mx-auto mb-2 h-8 w-8 text-faint" />
          <p className="text-sm text-muted">No tasks yet. Add one above.</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map(({ id, task }) => (
            <li
              key={id}
              className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2.5"
            >
              <input
                type="checkbox"
                id={id}
                className="h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
              <label htmlFor={id} className="flex-1 text-sm text-text">
                {task}
              </label>
              <button
                onClick={() => deleteTask(id)}
                aria-label="Delete task"
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
