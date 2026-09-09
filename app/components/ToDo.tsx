"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

export default function ToDo() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/ToDo");
      const data = await res.json();
      setTasks(data);
      console.log(tasks);
    } catch (e) {
      console.error("Failed to fetch cards: ", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await fetch (`/api/ToDo/${id}`, {method: "DELETE"})
    } catch (e) {
      console.error("Failed to delete card:", e)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full border border-slate-100">
        <div className="text-2xl text-slate-800 tracking-tight my-4 font-mono">
          {tasks.map(({ id, task }) => (
            <div key={id} className="flex items-center gap-2">
              <input type="checkbox" id={id} name="task" value={id} />
              <label htmlFor={id}>{task}</label>
              <button 
              onClick = {deleteCard}
              className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
