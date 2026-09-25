"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useSettings } from "@/app/components/settings/SettingsProvider";

/**
 * Quick Notes — a lightweight scratchpad persisted to localStorage.
 * Debounced autosave with a subtle "saved" pulse and a live character count.
 */

const STORAGE_KEY = "studytoolkit.quicknotes";
const PLACEHOLDER = "Jot a quick reminder…\n\ne.g. Review eigenvectors before Friday.";

export default function NotesModule() {
  const { settings } = useSettings();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

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
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1200);
      } catch {
        /* ignore */
      }
    }, 500);
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
        className="flex-1 resize-none rounded-md border border-line bg-surface-2/50 p-3 text-sm leading-relaxed text-text outline-none transition-colors placeholder:text-faint focus:border-accent focus:bg-surface"
      />
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-faint">
        <span>
          {settings.notesUnit === "words"
            ? `${value.trim() ? value.trim().split(/\s+/).length : 0} words`
            : `${value.length} chars`}
        </span>
        <span
          className={`inline-flex items-center gap-1 transition-opacity duration-300 ${
            justSaved ? "text-success opacity-100" : saved ? "opacity-60" : "opacity-100"
          }`}
        >
          {justSaved ? (
            <>
              <Check className="h-3 w-3" /> Saved
            </>
          ) : saved ? (
            "Saved"
          ) : (
            "Saving…"
          )}
        </span>
      </div>
    </div>
  );
}
