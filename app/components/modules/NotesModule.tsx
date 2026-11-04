"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Check } from "lucide-react";
import { useSettings } from "@/app/components/settings/SettingsProvider";

/**
 * Quick Notes — a Markdown scratchpad with true in-place live preview.
 *
 * The editor renders Markdown formatting and inline `$…$` / block `$$…$$` math
 * as you type (no separate preview pane), persisting to localStorage with a
 * debounced autosave. The CodeMirror editor is client-only, so it's loaded via
 * a dynamic import with SSR disabled.
 */

const MarkdownEditor = dynamic(() => import("./notes/MarkdownEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-faint">
      Loading editor…
    </div>
  ),
});

const STORAGE_KEY = "studytoolkit.quicknotes.v3";
// Prior keys we migrate from: v2 stored {content,mode,view}; the original
// stored a plain string of note text.
const V2_KEY = "studytoolkit.quicknotes.v2";
const LEGACY_KEY = "studytoolkit.quicknotes";

const PLACEHOLDER =
  "# Study notes\n\nWrite **Markdown** with inline math like $E = mc^2$.\n\n$$\n\\int_0^1 x^2 \\, dx = \\frac{1}{3}\n$$";

function loadContent(): string {
  try {
    const v3 = window.localStorage.getItem(STORAGE_KEY);
    if (v3 !== null) return v3;
    // Migrate v2 ({content,mode,view}) → plain content.
    const v2 = window.localStorage.getItem(V2_KEY);
    if (v2 !== null) {
      try {
        const parsed = JSON.parse(v2) as { content?: unknown };
        if (typeof parsed.content === "string") return parsed.content;
      } catch {
        /* fall through */
      }
    }
    // Migrate original plain-string notes.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy !== null) return legacy;
  } catch {
    /* ignore */
  }
  return "";
}

export default function NotesModule() {
  const { settings } = useSettings();
  const [content, setContent] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(true);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate once on mount.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setContent(loadContent());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Debounced autosave after hydration.
  useEffect(() => {
    if (!hydrated || saved) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, content);
        setSaved(true);
        setJustSaved(true);
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setJustSaved(false), 1200);
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [content, saved, hydrated]);

  const count =
    settings.notesUnit === "words"
      ? `${content.trim() ? content.trim().split(/\s+/).length : 0} words`
      : `${content.length} chars`;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-line bg-surface-2/40 px-3 py-1 focus-within:border-accent focus-within:bg-surface">
        {hydrated ? (
          <MarkdownEditor
            value={content}
            onChange={(v) => {
              setContent(v);
              setSaved(false);
            }}
            placeholder={PLACEHOLDER}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-faint">
            Loading…
          </div>
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-faint">
        <span>{count}</span>
        <span
          className={`inline-flex items-center gap-1 transition-opacity duration-300 ${
            justSaved
              ? "text-success opacity-100"
              : saved
                ? "opacity-60"
                : "opacity-100"
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
