"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye, Pencil, SplitSquareHorizontal } from "lucide-react";
import { useSettings } from "@/app/components/settings/SettingsProvider";
import MarkdownView from "./notes/MarkdownView";
import LatexView from "./notes/LatexView";

/**
 * Quick Notes — a scratchpad with live Markdown/LaTeX rendering, persisted to
 * localStorage. Content auto-compiles into a preview as you type; you can
 * switch between edit-only, split, and preview-only layouts, and choose whether
 * the document is interpreted as Markdown (with inline `$…$` math) or LaTeX.
 */

type DocMode = "markdown" | "latex";
type ViewMode = "edit" | "split" | "preview";

interface NotesDoc {
  content: string;
  mode: DocMode;
  view: ViewMode;
}

const STORAGE_KEY = "studytoolkit.quicknotes.v2";
// Legacy key: a plain string of note text (pre-Markdown/LaTeX upgrade).
const LEGACY_KEY = "studytoolkit.quicknotes";

const PLACEHOLDER: Record<DocMode, string> = {
  markdown:
    "# Study notes\n\nWrite **Markdown** with inline math like $E = mc^2$.\n\n$$\n\\int_0^1 x^2 \\, dx = \\frac{1}{3}\n$$",
  latex:
    "\\section{Derivatives}\n\n\\frac{d}{dx} e^x = e^x\n\n\\begin{aligned}\n(f g)' &= f' g + f g'\n\\end{aligned}",
};

function loadDoc(): NotesDoc {
  const fallback: NotesDoc = { content: "", mode: "markdown", view: "split" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NotesDoc>;
      return {
        content: typeof parsed.content === "string" ? parsed.content : "",
        mode: parsed.mode === "latex" ? "latex" : "markdown",
        view:
          parsed.view === "edit" || parsed.view === "preview"
            ? parsed.view
            : "split",
      };
    }
    // Migrate legacy plain-text notes, if any.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy !== null) {
      return { ...fallback, content: legacy };
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

export default function NotesModule() {
  const { settings } = useSettings();
  const [doc, setDoc] = useState<NotesDoc>({
    content: "",
    mode: "markdown",
    view: "split",
  });
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(true);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate once on mount.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setDoc(loadDoc());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Debounced autosave after hydration.
  useEffect(() => {
    if (!hydrated || saved) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
        setSaved(true);
        setJustSaved(true);
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setJustSaved(false), 1200);
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [doc, saved, hydrated]);

  const patch = (p: Partial<NotesDoc>) => {
    setDoc((d) => ({ ...d, ...p }));
    setSaved(false);
  };

  const { content, mode, view } = doc;

  const count =
    settings.notesUnit === "words"
      ? `${content.trim() ? content.trim().split(/\s+/).length : 0} words`
      : `${content.length} chars`;

  const showEditor = view === "edit" || view === "split";
  const showPreview = view === "preview" || view === "split";

  const Preview = mode === "latex" ? LatexView : MarkdownView;

  const viewButtons: { value: ViewMode; icon: typeof Eye; label: string }[] = [
    { value: "edit", icon: Pencil, label: "Edit" },
    { value: "split", icon: SplitSquareHorizontal, label: "Split" },
    { value: "preview", icon: Eye, label: "Preview" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar: doc mode + view layout */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex rounded-md bg-surface-2 p-0.5 text-xs">
          {(["markdown", "latex"] as DocMode[]).map((m) => (
            <button
              key={m}
              onClick={() => patch({ mode: m })}
              className={`rounded px-2 py-0.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                mode === m
                  ? "bg-surface text-accent shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              {m === "markdown" ? "Markdown" : "LaTeX"}
            </button>
          ))}
        </div>

        <div className="flex rounded-md bg-surface-2 p-0.5">
          {viewButtons.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => patch({ view: value })}
              aria-label={label}
              title={label}
              aria-pressed={view === value}
              className={`rounded p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                view === value
                  ? "bg-surface text-accent shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Editor / preview panes */}
      <div className="flex min-h-0 flex-1 gap-2">
        {showEditor && (
          <textarea
            value={content}
            onChange={(e) => patch({ content: e.target.value })}
            placeholder={PLACEHOLDER[mode]}
            aria-label="Notes editor"
            spellCheck={mode === "markdown"}
            className={`min-h-0 resize-none rounded-md border border-line bg-surface-2/50 p-3 font-mono text-[13px] leading-relaxed text-text outline-none transition-colors placeholder:text-faint focus:border-accent focus:bg-surface ${
              view === "split" ? "w-1/2" : "w-full"
            }`}
          />
        )}
        {showPreview && (
          <div
            className={`no-scrollbar min-h-0 overflow-y-auto rounded-md border border-line bg-surface p-3 ${
              view === "split" ? "w-1/2" : "w-full"
            }`}
          >
            <Preview source={content} />
          </div>
        )}
      </div>

      {/* Footer: count + save status */}
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
