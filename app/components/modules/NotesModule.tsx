"use client";

import { useEffect, useState } from "react";

/**
 * Quick Notes — a lightweight scratchpad persisted to localStorage.
 * This is genuinely functional client-side storage (no backend needed).
 */

const STORAGE_KEY = "studytoolkit.quicknotes";
const PLACEHOLDER = "Remember to review eigenvectors before Friday.";

export default function NotesModule() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored !== null) setValue(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (saved) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
        setSaved(true);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [value, saved]);

  return (
    <div className="flex h-full flex-col">
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder={PLACEHOLDER}
        aria-label="Quick notes"
        className="flex-1 resize-none rounded-md border border-line bg-surface-2/60 p-3 text-sm leading-relaxed text-text outline-none placeholder:text-faint focus:border-accent focus:bg-surface"
      />
      <div className="mt-1.5 text-right text-[11px] text-faint">
        {saved ? "Saved" : "Saving…"}
      </div>
    </div>
  );
}
